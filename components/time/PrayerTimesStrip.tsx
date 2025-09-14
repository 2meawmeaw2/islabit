import { usePrayerTimesStore } from '@/store/prayerTimesStore';
import { dayjs } from '@/lib/daysjs';
import React, { useMemo } from 'react';
import { View, Text } from 'react-native';

const PrayerTimesStrip = () => {
    const { days } = usePrayerTimesStore();

    const prayerTimes = useMemo(() => {
        if (days.length === 0) {
            return [];
        }
        return days[0].prayers;
    }, [days]);

    const nextPrayer = useMemo(() => {
        const now = dayjs();
        for (const prayer of prayerTimes) {
            if (dayjs(prayer.time).isAfter(now)) {
                return prayer;
            }
        }
        return prayerTimes[0];
    }, [prayerTimes]);

    if (prayerTimes.length === 0) {
        return null;
    }

    return (
        <View className="px-4 mt-4">
            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-text-primary font-ibm-plex-arabic-medium text-lg">
                    مواقيت الصلاة
                </Text>
                {nextPrayer && (
                    <Text className="text-text-muted font-ibm-plex-arabic text-sm">
                        {`الصلاة التالية: ${nextPrayer.name} في ${dayjs(nextPrayer.time).format('HH:mm')}`}
                    </Text>
                )}
            </View>
            <View className="flex-row justify-between bg-fore rounded-lg p-2">
                {prayerTimes.map((prayer) => (
                    <View key={prayer.name} className="items-center">
                        <Text className="text-text-primary font-ibm-plex-arabic-medium">
                            {prayer.name}
                        </Text>
                        <Text className="text-text-muted font-ibm-plex-arabic">
                            {dayjs(prayer.time).format('HH:mm')}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default PrayerTimesStrip;
