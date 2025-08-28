// app/screens/KnowledgeTypes.tsx
import React, { useMemo } from "react";
import {
  FlatList,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInUp,
  FadeOut,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type KnowledgeItem = {
  id: string;
  title: string;
  description: string;
  /** Remote URL or local asset via require(...) */
  image?: any;
  /** Fallback when image not provided */
  emojiFallback?: string;
};

const SP = {
  screenX: 24,
  cardGap: 12,
  cardHeight: 220,
} as const;

const CARD_HEIGHT = SP.cardHeight;
const IMG_HEIGHT = CARD_HEIGHT / 2; // exactly half the card

const demoItems: KnowledgeItem[] = [
  {
    id: "fiqh",
    title: "الفقه",
    description: "أحكام العبادات والمعاملات بأسلوب مبسّط.",
    emojiFallback: "📘",
  },
  {
    id: "aqeedah",
    title: "العقيدة",
    description: "أساسيات التوحيد والإيمان وقضايا الاعتقاد.",
    emojiFallback: "🌟",
  },
  {
    id: "seerh",
    title: "السيرة",
    description: "سيرة النبي ﷺ وأهم الدروس والعِبر.",
    emojiFallback: "🕋",
  },
  {
    id: "quran",
    title: "علوم القرآن",
    description: "تفسير، تجويد، وأسباب النزول بإيجاز.",
    emojiFallback: "📖",
  },
];

const KnowledgeCard: React.FC<{
  item: KnowledgeItem;
  onPress?: (it: KnowledgeItem) => void;
}> = ({ item, onPress }) => {
  const pressed = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withTiming(pressed.value ? 0.98 : 1, { duration: 120 }) },
    ],
  }));

  return (
    <Animated.View
      layout={Layout.springify()}
      entering={FadeInUp.duration(220)}
      exiting={FadeOut.duration(150)}
      style={{ width: "48%", height: CARD_HEIGHT, marginBottom: SP.cardGap }}
    >
      <Animated.View style={[pressStyle, { height: "100%" }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPressIn={() => (pressed.value = 1)}
          onPressOut={() => (pressed.value = 0)}
          onPress={() => onPress?.(item)}
          className="bg-fore border border-border-primary rounded-2xl overflow-hidden"
          style={Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
            },
            android: { elevation: 1 },
          })}
        >
          {/* Top: image (exactly half height) */}
          {item.image ? (
            <Image
              source={item.image}
              resizeMode="cover"
              style={{ height: IMG_HEIGHT, width: "100%" }}
            />
          ) : (
            <View
              style={{ height: IMG_HEIGHT }}
              className="bg-gray-100 items-center justify-center" // Replaced rgba(148,163,184,0.15) with solid light gray
            >
              <Text className="text-2xl ">{item.emojiFallback ?? "📚"}</Text>
            </View>
          )}

          {/* Bottom: text content */}
          <View className="px-3 py-3">
            <Text
              className="font-ibm-plex-arabic-bold text-text-brand text-right"
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text
              className="font-ibm-plex-arabic text-text-white/70 text-xs text-right mt-1"
              numberOfLines={3}
            >
              {item.description}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const KnowledgeTypesScreen: React.FC<{
  items?: KnowledgeItem[];
  onSelect?: (item: KnowledgeItem) => void;
  title?: string;
}> = ({ items = demoItems, onSelect, title = "أنواع المعرفة" }) => {
  const data = useMemo(() => items.slice(0, 4), [items]);

  return (
    <SafeAreaView className="bg-bg flex-1 mx-3">
      <Animated.ScrollView
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: 32,
        }}
      >
        {/* Header */}
        <View className="flex-row-reverse items-center justify-between mb-1">
          <Text className="font-ibm-plex-arabic-bold text-text-brand text-[1.7rem] ml-2">
            {title}
          </Text>
        </View>
        <Text className="font-ibm-plex-arabic text-text-secondary text-xs text-right mb-4">
          اختر نوع المعرفة لاستكشاف المحتوى المناسب.
        </Text>

        {/* Grid 2×2 */}
        <FlatList
          data={data}
          keyExtractor={(it) => it.id}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: SP.cardGap,
          }}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <KnowledgeCard item={item} onPress={onSelect} />
          )}
        />
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default KnowledgeTypesScreen;
export type { KnowledgeItem };
