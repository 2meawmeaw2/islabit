import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  onBackPress?: () => void; // رجوع للشاشة السابقة
  onStartPress?: () => void; // ابدأ الآن
};
type RowProps = { icon: any; title: string; desc: string; dir: boolean };

const Row: React.FC<RowProps> = ({ icon, title, desc, dir }) => {
  const { width: screenW } = useWindowDimensions();

  // Start off-screen to the right
  const tx = useSharedValue(dir ? -1 * screenW : screenW);
  const cardOp = useSharedValue(0);

  // Animate into place
  React.useEffect(() => {
    tx.value = withTiming(0, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
    cardOp.value = withTiming(1, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
    opacity: cardOp.value,
  }));

  return (
    <Animated.View
      style={animatedStyles}
      className="bg-fore border border-border-primary rounded-2xl py-4 px-2 mb-3"
    >
      <View className="flex-row-reverse items-start">
        <View
          className="w-9 h-9 rounded-xl items-center justify-center -mt-[2px] ml-3"
          style={{ backgroundColor: "#E0F2FE" }} // Replaced rgba(0,174,239,0.12) with solid light blue
        >
          <Ionicons name={icon} size={18} color="#00AEEF" />
        </View>
        <View className="flex-1 gap-1">
          <Text className="font-ibm-plex-arabic-bold text-text-primary text-right">
            {title}
          </Text>
          <Text className="font-ibm-plex-arabic text-text-secondary text-[12px] text-right mt-1">
            {desc}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const WelcomeMoreInfoUI: React.FC<Props> = ({ onBackPress, onStartPress }) => {
  const containerY = useSharedValue(200);
  const containerOp = useSharedValue(0);

  const containerOpB = useSharedValue(0);

  const whyY = useSharedValue(50);
  const whyOp = useSharedValue(0);

  const hintContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: containerOp.value,
      transform: [{ translateY: containerY.value }],
    };
  });
  const startButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: containerOpB.value,
    };
  });
  const whyStyle = useAnimatedStyle(() => {
    return {
      opacity: whyOp.value,
      transform: [{ translateY: whyY.value }],
    };
  });
  useEffect(() => {
    containerOp.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
    containerY.value = withTiming(0, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
    containerOpB.value = withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
    whyOp.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
    whyY.value = withTiming(0, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, []);
  return (
    <SafeAreaView className="bg-bg flex-1">
      {/* Top bar */}
      <View className="flex-row-reverse items-center justify-between px-6 pt-2 pb-2">
        <TouchableOpacity onPress={onBackPress} hitSlop={8}>
          <View className="flex-row-reverse items-center">
            <Ionicons
              name="chevron-back"
              size={18}
              color="#85DEFF"
              style={{ transform: [{ scaleX: -1 }] }}
            />
            <Text className="font-ibm-plex-arabic-medium text-text-white mr-1">
              رجوع
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 24,
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="overflow-hidden h-9 mb-5">
          <Animated.Text
            style={whyStyle}
            className="font-ibm-plex-arabic-bold text-text-brand text-center text-[20px]  overflow-hidden"
          >
            لماذا هذا التطبيق ؟
          </Animated.Text>
        </View>
        <Row
          dir={false}
          icon="time-outline"
          title="الوقت المتبقي"
          desc="شاهد ببساطة كم تبقى للصلاة التالية لتخطط مهامك."
        />
        <Row
          dir={true}
          icon="checkbox-outline"
          title="مهام قصيرة وواضحة"
          desc="اربط كل مهمة بصلاة محددة لتحافظ على التركيز."
        />
        <Row
          dir={false}
          icon="notifications-outline"
          title="تذكير لطيف"
          desc="تنبيهات خفيفة قبل الأوقات المهمة."
        />

        {/* Tiny tips */}
        <Animated.View
          style={hintContainerStyle}
          className="mt-4 bg-fore border border-border-secondary rounded-2xl p-4"
        >
          <Text className="font-ibm-plex-arabic-medium text-text-white text-right mb-2">
            تلميحات
          </Text>
          <View className="gap-2">
            <Text className="font-ibm-plex-arabic text-text-secondary text-[12px] text-right">
              • اجعل كل مهمة فعلًا واحدًا واضحًا.
            </Text>
            <Text className="font-ibm-plex-arabic text-text-secondary text-[12px] text-right">
              • اكتب ملاحظة قصيرة إن احتجت تفاصيل.
            </Text>
          </View>
        </Animated.View>

        {/* CTA */}
        <Animated.View style={startButtonStyle}>
          <TouchableOpacity
            onPress={onStartPress}
            activeOpacity={0.9}
            className="bg-text-brand rounded-2xl py-3 mt-6"
            accessibilityRole="button"
            accessibilityLabel="ابدأ الآن"
          >
            <Text className="font-ibm-plex-arabic-bold text-center text-text-primary text-base">
              ابدأ الآن
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WelcomeMoreInfoUI;
