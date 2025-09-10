import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import * as Network from "expo-network";
import { Ionicons } from "@expo/vector-icons";
import {
  fmtArabicDateDay,
  fmtArabicDateMonthAndNumberAndYear,
} from "@/lib/dates";
import { computePrayerTimes } from "@/lib/prayer-times/compute";
import {
  buildParameters,
  defaultPrayerCalcConfig,
} from "@/lib/prayer-times/parameters";
import { usePrayerTimes } from "@/lib/prayer-times/use-prayer-times";
import { dayjs } from "@/lib/daysjs";
import { router } from "expo-router";
import { usePrayerTimesStore } from "@/store/prayerTimesStore";
import { useLocationStore } from "@/store/locationStore";

interface Prayer {
  name: string;
  time: Date;
  shouldRing?: boolean; // <- optional, since we compute it
  wasPrayed?: boolean; // <- optional, if you plan to track it
}

interface PrayerDay {
  date: Date;
  prayers: Prayer[];
}
interface NominatimResponse {
  place_id: number;
  address: {
    town?: string;
    village?: string;
    city?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
  display_name: string;
}
const PrayerTimesScreen = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const { coords: cachedCoords, ensureCoords } = useLocationStore();
  const {
    days,
    isInitialized,
    coordinates: storedCoords,
    initializePrayers,
  } = usePrayerTimesStore();
  const [city, setCity] = useState<string | null>(null);
  const [cityError, setCityError] = useState<string | null>(null);

  const getCityWithNominatim = async (
    latitude: number,
    longitude: number,
    signal?: AbortSignal
  ): Promise<string | null> => {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "json");
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));
    url.searchParams.set("accept-language", "ar");

    try {
      const res = await fetch(url.toString(), {
        signal,
        headers: {
          "User-Agent": "HabitTrackerApp/1.0", // Required by Nominatim
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        console.error(`Nominatim API error: ${res.status}`);
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = (await res.json()) as NominatimResponse;
      console.log("Nominatim response:", JSON.stringify(data, null, 2));

      // Try to get the most specific location name
      const name =
        data?.address?.town ??
        data?.address?.village ??
        data?.address?.city ??
        data?.address?.municipality ??
        data?.address?.county ??
        data?.address?.state ??
        null;

      if (!name) {
        console.log("No location name found in response");
      }

      return name;
    } catch (e) {
      if (e?.name === "AbortError") {
        console.log("Request was aborted");
        throw e;
      }
      console.error("Error fetching location:", e);
      throw new Error("Failed to fetch location data");
    }
  };

  const getCityWithExpoLocation = async (
    latitude: number,
    longitude: number
  ): Promise<string | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Location permission not granted");
      }

      const result = await Location.reverseGeocodeAsync(
        {
          latitude,
          longitude,
        },
        { language: "ar" }
      );

      if (result && result.length > 0) {
        return (
          result[0].city ||
          result[0].district ||
          result[0].subregion ||
          result[0].region ||
          null
        );
      }
      return null;
    } catch (error) {
      console.error("Error getting location with Expo:", error);
      return null;
    }
  };

  // Effect: refetch whenever coords change, cancel on unmount
  useEffect(() => {
    if (!cachedCoords?.lat || !cachedCoords?.lng) return;

    const controller = new AbortController();
    setCityError(null);

    (async () => {
      try {
        // Check network status
        const networkState = await Network.getNetworkStateAsync();

        let name: string | null = null;

        if (
          networkState.isConnected &&
          networkState.type === Network.NetworkStateType.WIFI
        ) {
          // Try Nominatim first if we have WiFi
          name = await getCityWithNominatim(
            cachedCoords.lat,
            cachedCoords.lng,
            controller.signal
          );
        }

        // If Nominatim failed or we're not on WiFi, try Expo Location
        if (!name) {
          name = await getCityWithExpoLocation(
            cachedCoords.lat,
            cachedCoords.lng
          );
        }

        if (name) {
          setCity(name);
        } else {
          setCityError("تعذر جلب المدينة");
        }
      } catch (e: any) {
        if (e?.name !== "AbortError") setCityError("تعذر جلب المدينة");
      }
    })();

    return () => controller.abort();
  }, [cachedCoords]);

  // Initialize today's store-based prayers once we have coordinates
  useEffect(() => {
    if (!cachedCoords) {
      ensureCoords();
    }
  }, [cachedCoords, ensureCoords]);

  // Initialize today's store-based prayers once we have coordinates
  useEffect(() => {
    if (days.length > 0 && dayjs(days[0].date).isSame(dayjs(), "day")) return;
    if (!cachedCoords) return;
    if (!isInitialized || !storedCoords) {
      initializePrayers(cachedCoords.lat, cachedCoords.lng);
    }
  }, [cachedCoords, isInitialized, storedCoords, initializePrayers, days]);
  // Build prayerDay either from store (today) or computed (other dates)
  const prayerDay = useMemo<PrayerDay | undefined>(() => {
    if (!cachedCoords) return undefined;

    const params = buildParameters(defaultPrayerCalcConfig);
    const { raw } = computePrayerTimes(
      cachedCoords.lat,
      cachedCoords.lng,
      selectedDate,
      params
    );

    const now = dayjs();
    const prayers: Prayer[] = [
      { name: "الفجر", time: raw.fajr },
      { name: "الشروق", time: raw.sunrise, wasPrayed: false },
      { name: "الظهر", time: raw.dhuhr },
      { name: "العصر", time: raw.asr },
      { name: "المغرب", time: raw.maghrib },
      { name: "العشاء", time: raw.isha },
    ].map((prayer) => {
      const prayerTime = dayjs(prayer.time);
      const deltaMinutes = prayerTime.diff(now, "minute");
      return {
        ...prayer,
        shouldRing: deltaMinutes >= 0 && deltaMinutes <= 30,
      };
    });
    return { date: selectedDate, prayers };
  }, [cachedCoords, selectedDate, days]);

  const isLoading = useMemo(() => {
    return !cachedCoords || !prayerDay;
  }, [cachedCoords, days, prayerDay]);

  const previousDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const nextDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00070A" />
      <ScrollView style={styles.scrollView}>
        {/* Header */}

        <View style={styles.header}>
          <View className="items-end gap-4">
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ transform: [{ translateX: 5 }] }}
              className="mb-10 bg-fore rounded-full p-2"
            >
              <Ionicons name="chevron-forward" size={24} color="#00AEEF" />
            </TouchableOpacity>
            <View style={styles.locationContainer}>
              <Text className="text-white text-3xl font-ibm-plex-arabic-medium">
                {city}
              </Text>
              <Ionicons name="location-sharp" size={24} color="#00AEEF" />
            </View>
          </View>
        </View>

        {/* Date Section */}
        <View className="flex-row-reverse justify-between items-center">
          <View className="flex-row-reverse gap-2">
            <Ionicons name="calendar-outline" size={22} color="#00AEEF" />
            <View className="justify-center items-end gap-2">
              <Text className="text-text-primary text-2xl mb-1 font-ibm-plex-arabic-semibold">
                {fmtArabicDateDay(selectedDate)}
              </Text>
              <Text className="text-text-primary text-md font-ibm-plex-arabic-medium">
                {fmtArabicDateMonthAndNumberAndYear(selectedDate)}
              </Text>
            </View>
          </View>
          <View style={styles.dateSection}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.navButton}
              onPress={nextDay}
            >
              <Ionicons name="chevron-back" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.navButton}
              onPress={previousDay}
            >
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Prayer Times List */}
        {isLoading ? (
          <View style={[styles.prayerTimesContainer, styles.centerContent]}>
            <ActivityIndicator size="large" color="#00AEEF" />
          </View>
        ) : (
          <ScrollView
            style={styles.prayerTimesContainer}
            showsVerticalScrollIndicator={false}
          >
            {prayerDay?.prayers.map((prayer, index) => (
              <Pressable
                key={index}
                style={{
                  paddingVertical: 20,
                  borderBottomWidth: 1,
                  borderBottomColor: "#333",
                }}
                className=" flex-row justify-between items-center"
                onPress={() => {}}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.prayerStatus}
                >
                  {prayer.shouldRing && (
                    <Ionicons name="alarm-sharp" size={20} color="#00AEEF" />
                  )}
                </TouchableOpacity>
                <View className="flex-row justify-between items-center">
                  <Text className="text-white text-lg font-ibm-plex-arabic-semibold text-right">
                    {prayer.name}
                  </Text>

                  <View className="mr-2 ml-3">
                    <Text className="text-white text-lg font-ibm-plex-arabic text-right">
                      {dayjs(prayer.time).format("HH:mm")}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
            <View style={{ height: 200 }} />
          </ScrollView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00070A",
  },
  scrollView: {
    paddingHorizontal: 20,
    flex: 1,
    paddingBottom: 40,
    paddingTop: 20,
  },
  header: {
    alignItems: "flex-end",
    marginTop: 20,
    marginBottom: 80,
  },

  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  locationText: {
    color: "white",
    fontSize: 24,
    fontWeight: "300",
    textAlign: "right",
  },
  dateSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  navButton: {
    padding: 10,
  },
  dayLabel: {
    color: "#4A90E2",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  islamicDate: {
    color: "white",
    fontSize: 20,
    fontWeight: "400",
    marginBottom: 4,
    textAlign: "center",
  },
  gregorianDate: {
    color: "#888",
    fontSize: 16,
    fontWeight: "300",
    textAlign: "center",
  },
  divider: {
    height: 3,
    borderRadius: 50,
    backgroundColor: "#6C7684",
    marginVertical: 20,
  },
  prayerTimesContainer: {
    flex: 1,
  },
  prayerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  prayerStatus: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  soundIconContainer: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  prayerName: {
    color: "white",
    fontSize: 18,
    fontWeight: "400",
    flex: 1,
    textAlign: "center",
  },
  time: {
    color: "white",
    fontSize: 18,
    fontWeight: "400",
    marginRight: 4,
  },
  period: {
    color: "#888",
    fontSize: 16,
    fontWeight: "300",
  },
});

export default PrayerTimesScreen;
