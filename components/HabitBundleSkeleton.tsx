import React, { useEffect, useRef } from "react";
import { View, ScrollView, Animated as RNAnimated } from "react-native";
import { shadowStyle } from "@/lib/shadow";

interface HabitBundleSkeletonProps {
  count?: number;
}

const HabitBundleSkeleton: React.FC<HabitBundleSkeletonProps> = ({
  count = 3,
}) => {
  const shimmerAnimation = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    const shimmerLoop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        RNAnimated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 2000,
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

  const renderSkeletonCard = () => (
    <View
      style={{
        width: 288, // w-72 = 288px
        height: 250, // exact height from real component
        borderRadius: 16,
        overflow: "hidden",
        marginRight: 16,
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
            offset: { width: 0, height: 8 },
            opacity: 0.25,
            radius: 12,
          }),
          elevation: 10,
        }}
      >
        {/* Upper section - placeholder for bundle image (h-40 = 160px) */}
        <View
          style={{
            height: 160, // h-40 from real component
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            margin: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Placeholder icon area */}
          <RNAnimated.View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              opacity: shimmerOpacity,
            }}
          />
        </View>

        {/* Lower section - placeholder for bundle info (remaining 90px) */}
        <View
          style={{
            height: 90, // 250 - 160 = 90px
            padding: 16,
            gap: 6,
            justifyContent: "center",
          }}
        >
          {/* Bundle title placeholder */}
          <RNAnimated.View
            style={{
              height: 14,
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              borderRadius: 7,
              width: "70%",
              opacity: shimmerOpacity,
            }}
          />

          {/* Bundle description placeholder */}
          <RNAnimated.View
            style={{
              height: 10,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: 5,
              width: "50%",
              opacity: shimmerOpacity,
            }}
          />

          {/* Bundle stats placeholder */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <RNAnimated.View
              style={{
                height: 12,
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: 6,
                width: "40%",
                opacity: shimmerOpacity,
              }}
            />
            <RNAnimated.View
              style={{
                height: 12,
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: 6,
                width: "30%",
                opacity: shimmerOpacity,
              }}
            />
          </View>
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
          borderColor: "rgba(0, 174, 239, 0.15)",
          opacity: shimmerOpacity,
        }}
      />
    </View>
  );

  return (
    <View>
      {/* Horizontal scrollable skeleton cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingRight: 20 }}
      >
        {Array.from({ length: count }).map((_, index) => (
          <View key={index}>{renderSkeletonCard()}</View>
        ))}
      </ScrollView>
    </View>
  );
};

export default HabitBundleSkeleton;
