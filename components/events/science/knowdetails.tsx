import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Share,
  I18nManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type KnowledgeItem = {
  typeLabel: string; // e.g. "حديث", "فقه", "سيرة"
  title: string;
  description: string;
  imageUri?: string; // remote image
};

type Props = {
  item?: KnowledgeItem;
  onBack?: () => void;
};

const KnowledgeDetails: React.FC<Props> = ({ item, onBack }) => {
  // Fallback demo content so the screen renders nicely out-of-the-box
  const data = useMemo<KnowledgeItem>(
    () =>
      item ?? {
        typeLabel: "علم الحديث",
        title: "فضل طلب العلم وأثره في تهذيب النفس وبناء المجتمع",
        description:
          "يُعدّ طلب العلم من أجلِّ القُرَب وأعظم الطاعات، به تُستنار العقول وتتهذّب النفوس وتقوم الحضارات. قال ﷺ: «من سلك طريقًا يلتمس فيه علمًا سهّل الله له به طريقًا إلى الجنة». يتطلب ذلك إخلاص النيّة والصبر، والبدء بالأصول قبل الفروع، وملازمة العلماء والكتب المعتبرة، والعمل بما يُتعلّم، إذ العلم بلا عمل كالشجرة بلا ثمر. ومع تطور الوسائل اليوم، صار الوصول للمعلومة أيسر، لكن يبقى التثبّت والتحرير العلمي شرطًا واجبًا. وفي هذا السياق، ينبغي لطالب العلم أن يجمع بين العلم والخلق، وأن يجعل ما يتلقاه زادًا يعمّر به قلبه ويُصلح به مجتمعه.",
        imageUri:
          "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop",
      },
    [item]
  );

  const [bookmarked, setBookmarked] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const shareItem = async () => {
    try {
      await Share.share({
        message: `${data.title}\n\n${data.description}`,
        title: data.title,
      });
    } catch {}
  };

  const isRTL = I18nManager.isRTL ?? true;
  const previewLines = 7;

  return (
    <SafeAreaView className="bg-bg flex-1">
      {/* Top Bar */}
      <View className="px-4 pt-1 pb-2 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 rounded-lg bg-fore border border-border-secondary items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="رجوع"
        >
          <Ionicons
            name={isRTL ? "chevron-forward" : "chevron-back"}
            size={20}
            color="#00AEEF"
          />
        </TouchableOpacity>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={shareItem}
            className="w-10 h-10 rounded-lg bg-fore border border-border-secondary items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="مشاركة"
          >
            <Ionicons name="share-social-outline" size={18} color="#00AEEF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setBookmarked((v) => !v)}
            className="w-10 h-10 rounded-lg bg-fore border border-border-secondary items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel={bookmarked ? "إزالة من المحفوظات" : "حفظ"}
          >
            <Ionicons
              name={bookmarked ? "bookmark" : "bookmark-outline"}
              size={18}
              color="#00AEEF"
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Image */}
        <View className="px-4">
          <View className="w-full h-56 rounded-2xl overflow-hidden bg-fore border border-border-secondary">
            {!!data.imageUri ? (
              <Image
                source={{ uri: data.imageUri }}
                className="w-full h-full"
                resizeMode="cover"
                accessible
                accessibilityLabel="صورة الموضوع"
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="image-outline" size={28} color="#4B9AB5" />
                <Text className="font-ibm-plex-arabic text-text-secondary mt-2">
                  لا توجد صورة
                </Text>
              </View>
            )}

            {/* Floating type chip */}
            <View className="absolute right-3 top-3 px-3 py-1 rounded-full bg-bg/80 border border-border-secondary">
              <Text className="font-ibm-plex-arabic-medium text-text-brand text-xs">
                {data.typeLabel}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="px-4 mt-4">
          <Text className="font-ibm-plex-arabic-bold text-text-brand text-xl text-right leading-7">
            {data.title}
          </Text>

          <View className="mt-2 bg-fore border border-border-secondary rounded-2xl p-4">
            <Text
              className="font-ibm-plex-arabic text-text-primary text-[15px] leading-6 text-right"
              numberOfLines={expanded ? undefined : previewLines}
            >
              {data.description}
            </Text>

            {/* Read more / less */}
            <TouchableOpacity
              onPress={() => setExpanded((v) => !v)}
              className="self-end mt-2"
            >
              <Text className="font-ibm-plex-arabic-medium text-text-brand text-sm">
                {expanded ? "إظهار أقل" : "اقرأ المزيد"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Nice pull-quote / ayah strip (optional, matches your style) */}
          <View className="bg-text-primary border-r-4 border-text-brand rounded-xl p-3 my-4">
            <Text className="font-ibm-plex-arabic text-bg text-center text-sm leading-5">
              "وَقُل رَّبِّ زِدْنِي عِلْمًا"
            </Text>
            <Text className="font-ibm-plex-arabic-light text-bg text-center text-xs mt-1">
              سورة طه - آية ١١٤
            </Text>
          </View>
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default KnowledgeDetails;
