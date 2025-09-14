import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const HabitList = ({ habits, onToggleHabit, onHabitPress }) => {
    return (
        <View className="mx-4 mt-4">
            {habits.map((habit) => (
                <Pressable
                    key={habit.id}
                    onPress={() => onHabitPress(habit)}
                    className="bg-bg rounded-lg p-4 mb-2 flex-row justify-between items-center"
                >
                    <View>
                        <Text className="text-text-primary font-ibm-plex-arabic-medium text-lg">
                            {habit.title}
                        </Text>
                        <Text className="text-text-muted font-ibm-plex-arabic">
                            {habit.description}
                        </Text>
                    </View>
                    <Pressable onPress={() => onToggleHabit(habit.id, !habit.isCompletedForSelectedDay)}>
                        <AntDesign
                            name={habit.isCompletedForSelectedDay ? 'checkcircle' : 'checkcircleo'}
                            size={24}
                            color={habit.isCompletedForSelectedDay ? '#4ADE80' : '#6C7684'}
                        />
                    </Pressable>
                </Pressable>
            ))}
        </View>
    );
};

export default HabitList;
