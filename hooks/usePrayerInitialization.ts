import { useEffect } from "react";
import * as Location from "expo-location";
import { usePrayerTimesStore } from "../store/prayerTimesStore";

export function usePrayerInitialization() {
  const { initializePrayers, updatePrayerWindow, isInitialized } =
    usePrayerTimesStore();

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Location permission denied");
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!mounted) return;

        await initializePrayers(
          position.coords.latitude,
          position.coords.longitude
        );
      } catch (error) {
        console.error("Failed to initialize prayer times:", error);
      }
    }

    if (!isInitialized) {
      initialize();
    }

    // Set up regular updates for shouldRing status (every minute)
    const updateInterval = setInterval(() => {
      if (isInitialized) {
        updatePrayerWindow();
      }
    }, 60 * 1000); // Check every minute

    return () => {
      mounted = false;
      clearInterval(updateInterval);
    };
  }, [isInitialized]);
}
