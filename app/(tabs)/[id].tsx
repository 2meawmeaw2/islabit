import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {};

const Id = (props: Props) => {
  const habits = [
    { id: 1, habit: "Pray Fajr on time" },
    { id: 2, habit: "Read Quran daily" },
    { id: 3, habit: "Give charity weekly" },
    { id: 4, habit: "Fast Mondays and Thursdays" },
    { id: 5, habit: "Avoid gossip" },
    { id: 6, habit: "Visit relatives" },
    { id: 7, habit: "Help a neighbor" },
    { id: 8, habit: "Learn new dua" },
    { id: 9, habit: "Memorize a surah" },
    { id: 10, habit: "Reflect on Allah’s creation" },
    { id: 11, habit: "Pray Tahajjud" },
    { id: 12, habit: "Thank Allah after every meal" },
    { id: 13, habit: "Control anger" },
    { id: 14, habit: "Smile at others" },
    { id: 15, habit: "Use siwak before prayer" },
    { id: 16, habit: "Make daily istighfar" },
    { id: 17, habit: "Keep promises" },
    { id: 18, habit: "Recite Ayat al-Kursi after prayer" },
    { id: 19, habit: "Be patient in hardship" },
    { id: 20, habit: "Give sincere advice" },
  ];

  const { id } = useLocalSearchParams();
  return (
    <SafeAreaView>
      <Text>{id}</Text>
    </SafeAreaView>
  );
};

export default Id;
