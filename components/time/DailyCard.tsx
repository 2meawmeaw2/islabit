import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Prayer } from "@/types/salat";
import { PRAYERS } from "@/assets/constants/prayers";
import S from "../../assets/styles/shared";
import { Button } from "../textButton";
const DailyCard: React.FC<{
  today: Date;
  onOpenDaily?: (date?: Date) => void;
  prayers?: Prayer[]; // optional override
}> = ({ today, onOpenDaily, prayers = PRAYERS }) => {
  return (
    <View className="bg-fore border-[1px] border-border-primary/80 p-[12px] rounded-2xl">
      <View style={S.rowBetween}>
        <Text className="text-text-brand font-ibm-plex-arabic-medium text-xl">
          عرض اليوم
        </Text>
        <Button
          textClassName="py-4 text-sm font-ibm-plex-arabic"
          onPress={() => (onOpenDaily ? onOpenDaily(today) : null)}
        >
          فتح
        </Button>
      </View>

      {/* Minimal prayers strip */}
      <View style={[S.rowBetween, { marginTop: 12 }]}>
        {prayers.map((p) => (
          <View key={p.key} style={S.centerCol}>
            <Text style={{ fontSize: 16 }}>{p.emoji}</Text>
            <Text className="font-ibm-plex-arabic-extralight mt-3 text-xs text-text-white">
              {p.time}
            </Text>
            <Text className="font-ibm-plex-arabic-light text-text-white/80">
              {p.name}
            </Text>
          </View>
        ))}
      </View>

      <Text className="text-right font-ibm-plex-arabic text-text-white mt-[14px]">
        مهام اليوم
      </Text>
      <View className="py-3 px-2 border-border-primary my-4 border-[1px] rounded-xl">
        <Text className=" text-right text-text-disabled/80 font-ibm-plex-arabic-extralight">
          لا توجد مهام حالياً
        </Text>
      </View>
    </View>
  );
};

export default DailyCard;
