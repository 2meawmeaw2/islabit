import React, { useEffect, useRef } from "react";
import { View, Animated as RNAnimated } from "react-native";
import { shadowStyle } from "@/lib/shadow";

interface TrendingSkeletonProps {
  habitCount?: number;
  bundleCount?: number;
}

const TrendingSkeleton: React.FC<TrendingSkeletonProps> = ({
  habitCount = 3,
  bundleCount = 3,
}) => {
  const shimmerAnimation = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    const shimmerLoop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: false,
        }),
        RNAnimated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: false,
        }),
      ])
    );

    shimmerLoop.start();

    return () => shimmerLoop.stop();
  }, [shimmerAnimation]);

  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  const renderHabitSkeleton = () => (
    <View
      style={{
        width: "100%",
        height: 64, // h-16 = 64px from real component
        borderRadius: 12, // rounded-xl
        overflow: "hidden",
        marginBottom: 12, // gap-3
      }}
    >
      {/* Main glass card container */}
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.12)",
          ...shadowStyle({
            color: "#000",
            offset: { width: 0, height: 4 },
            opacity: 0.2,
            radius: 8,
          }),
          elevation: 6,
        }}
      >
        {/* Content layout matching real habit card */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: "100%",
            paddingHorizontal: 16,
            gap: 12,
          }}
        >
          {/* Category Icon placeholder (w-10 h-10 = 40x40) */}
          <RNAnimated.View
            style={{
              width: 40,
              height: 40,
              borderRadius: 8, // rounded-lg
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              opacity: shimmerOpacity,
            }}
          />

          {/* Content area placeholder */}
          <View
            style={{
              flex: 1,
              alignItems: "flex-end",
              marginRight: 12,
              gap: 4,
            }}
          >
            <RNAnimated.View
              style={{
                height: 16,
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                borderRadius: 8,
                width: "70%",
                opacity: shimmerOpacity,
              }}
            />
            <RNAnimated.View
              style={{
                height: 12,
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: 6,
                width: "50%",
                opacity: shimmerOpacity,
              }}
            />
          </View>

          {/* Chevron placeholder */}
          <RNAnimated.View
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: "rgba(0, 174, 239, 0.2)",
              opacity: shimmerOpacity,
            }}
          />
        </View>
      </View>

      {/* Subtle glow effect */}
      <RNAnimated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 12,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: "rgba(0, 174, 239, 0.12)",
          opacity: shimmerOpacity,
        }}
      />
    </View>
  );

  const renderBundleSkeleton = () => (
    <View
      style={{
        width: "100%",
        height: 192, // h-48 = 192px from real component
        borderRadius: 16, // rounded-2xl
        overflow: "hidden",
        marginBottom: 16, // gap-4
      }}
    >
      {/* Main glass card container */}
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.12)",
          ...shadowStyle({
            color: "#000",
            offset: { width: 0, height: 6 },
            opacity: 0.2,
            radius: 10,
          }),
          elevation: 8,
        }}
      >
        {/* Upper section - placeholder for bundle image */}
        <View
          style={{
            height: "70%", // Most of the card height
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            margin: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <RNAnimated.View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              opacity: shimmerOpacity,
            }}
          />
        </View>

        {/* Lower section - placeholder for bundle info */}
        <View
          style={{
            height: "30%",
            padding: 16,
            gap: 6,
            justifyContent: "center",
          }}
        >
          <RNAnimated.View
            style={{
              height: 18,
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              borderRadius: 9,
              width: "80%",
              opacity: shimmerOpacity,
            }}
          />
          <RNAnimated.View
            style={{
              height: 12,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: 6,
              width: "60%",
              opacity: shimmerOpacity,
            }}
          />
        </View>
      </View>

      {/* Subtle glow effect */}
      <RNAnimated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 16,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: "rgba(0, 174, 239, 0.12)",
          opacity: shimmerOpacity,
        }}
      />
    </View>
  );

  return (
    <View style={{ paddingHorizontal: 20 }}>
      {/* Trending Habits Section */}
      <View style={{ marginBottom: 24 }}>
        {/* Vertical list of habit skeletons */}
        <View style={{ gap: 12 }}>
          {Array.from({ length: habitCount }).map((_, index) => (
            <View key={`habit-${index}`}>{renderHabitSkeleton()}</View>
          ))}
        </View>
      </View>

      {/* Trending Bundles Section */}
      <View>
        {/* Vertical list of bundle skeletons */}
        <View style={{ gap: 16 }}>
          {Array.from({ length: bundleCount }).map((_, index) => (
            <View key={`bundle-${index}`}>{renderBundleSkeleton()}</View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default TrendingSkeleton;
