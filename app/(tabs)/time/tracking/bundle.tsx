import { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import { SimpleBundleCard } from "@/components/tracking/SimpleBundleCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useCurrentPrayer } from "@/lib/prayers";
import { useBundlesStore } from "@/store/bundlesStore";
import { useRouter } from "expo-router";

export default function BundleTrackingScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const currentPrayer = useCurrentPrayer();
  const isBundlesHydrated = useBundlesStore((s) => s.isHydrated);
  const bundles = useBundlesStore((s) => s.bundles);
  const initializeBundles = useBundlesStore.getState().initialize;

  useEffect(() => {
    if (!isBundlesHydrated) {
      initializeBundles();
    }
  }, [isBundlesHydrated, initializeBundles]);

  console.log("bundles(store)", bundles);
  const onRefresh = useCallback(async () => {
    if (!isBundlesHydrated) return;

    setRefreshing(true);
    try {
      await useBundlesStore.getState().initialize();
    } catch (error) {
      console.error("Error refreshing bundles:", error);
    } finally {
      setRefreshing(false);
    }
  }, [isBundlesHydrated]);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Bundles Grid */}
        <View className="px-2">
          {bundles.map((bundle, index) => (
            <Animated.View
              key={bundle.id}
              entering={FadeInDown.duration(400).delay(index * 100)}
            >
              <SimpleBundleCard
                title={bundle.title}
                subtitle={bundle.subtitle}
                habitCount={bundle.habits.length}
                color={bundle.color}
                category={bundle.category}
                onPress={() =>
                  router.push(`/time/tracking/bundle-details?id=${bundle.id}`)
                }
              />
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
