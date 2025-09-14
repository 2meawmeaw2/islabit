import { useBundlesStore } from "@/store/bundlesStore";
import React, { useCallback, memo } from "react";
import { ScrollView, Pressable, Text, View } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface BundleFilterProps {
  selectedBundleId: string | null;
  onSelectBundle: (bundleId: string | null) => void;
}

const BundleFilter = memo(
  ({ selectedBundleId, onSelectBundle }: BundleFilterProps) => {
    const { bundles } = useBundlesStore();
    const fadeAnim = useSharedValue(0);

    React.useEffect(() => {
      fadeAnim.value = withTiming(1, { duration: 300 });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: fadeAnim.value,
    }));

    const handleSelectBundle = useCallback(
      (bundleId: string | null) => {
        onSelectBundle(bundleId === selectedBundleId ? null : bundleId);
      },
      [selectedBundleId, onSelectBundle]
    );

    if (bundles.length === 0) {
      return null;
    }

    return (
      <Animated.View
        style={animatedStyle}
        entering={FadeIn.duration(300)}
        className="my-2 bg-bg"
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            width: "100%",
          }}
        >
          <View style={{ width: "100%" }} className="flex-row-reverse  ">
            <Pressable
              onPress={() => handleSelectBundle(null)}
              className="px-4 py-2 rounded-full mr-2"
              style={{
                backgroundColor:
                  selectedBundleId === null ? "#00AEEF" : "#1A1E1F",
              }}
            >
              <Text
                className={`font-ibm-plex-arabic-medium ${
                  selectedBundleId === null
                    ? "text-white"
                    : "text-text-disabled"
                }`}
              >
                الكل
              </Text>
            </Pressable>

            {bundles.map((bundle) => (
              <Pressable
                key={bundle.id}
                onPress={() => handleSelectBundle(bundle.id)}
                className="px-4 py-2 rounded-full mr-2"
                style={{
                  backgroundColor:
                    selectedBundleId === bundle.id ? bundle.color : "#1A1E1F",
                }}
              >
                <Text className="font-ibm-plex-arabic-medium text-text-primary">
                  {bundle.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    );
  }
);

export default BundleFilter;
