import { usePrayerTimesStore } from '@/store/prayerTimesStore';
import { dayjs } from '@/lib/daysjs';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text } from 'react-native';

const NextPrayerCard = () => {
    const { days } = usePrayerTimesStore();
    const [timeRemaining, setTimeRemaining] = useState('');

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

    useEffect(() => {
        if (nextPrayer) {
            const interval = setInterval(() => {
                const now = dayjs();
                const prayerTime = dayjs(nextPrayer.time);
                const diff = prayerTime.diff(now);
                const duration = dayjs.duration(diff);
                const hours = duration.hours();
                const minutes = duration.minutes();
                const seconds = duration.seconds();
                setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [nextPrayer]);

    if (!nextPrayer) {
        return null;
    }

    return (
        <View className="bg-fore rounded-lg p-4 m-4">
            <Text className="text-text-brand text-lg font-ibm-plex-arabic-medium">
                {`صلاة ${nextPrayer.name}`}
            </Text>
            <Text className="text-text-primary text-5xl font-ibm-plex-arabic-bold my-2">
                {dayjs(nextPrayer.time).format('HH:mm')}
            </Text>
            <Text className="text-text-muted text-base font-ibm-plex-arabic">
                {`متبقي: ${timeRemaining}`}
            </Text>
        </View>
    );
};

export default NextPrayerCard;
