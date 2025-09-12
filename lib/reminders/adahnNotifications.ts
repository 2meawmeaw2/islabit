// lib/adhan/notifications.ts
import * as Notifications from "expo-notifications";
import { getPresentedNotificationsAsync } from "expo-notifications";
import { Alert } from "react-native";
import { Linking } from "react-native";

export interface PrayerSlot {
  name: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
  date: Date; // absolute Date for the prayer time
}

// Call this once early (app start) before scheduling
export async function ensureNotificationSetup(): Promise<void> {
  const settings = await Notifications.getPermissionsAsync();
  if (!settings.granted) {
    await Notifications.requestPermissionsAsync();
  }

  // Ensure a high-importance channel with custom sound
  await Notifications.setNotificationChannelAsync("adhan", {
    name: "الآذان",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: false,
    lightColor: "#000000",
  });

  // Global handler (optional)
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function cancelAllPrayerNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

async function testNotificationSetup(): Promise<TestResult> {
  try {
    console.log("🔧 Testing notification setup...");

    // 1. Check permissions
    console.log("📋 Checking permissions...");
    const permissions = await Notifications.getPermissionsAsync();

    if (!permissions.granted) {
      return {
        success: false,
        message:
          "Notifications permission not granted. Please enable in settings.",
        details: permissions,
      };
    }
    console.log("✅ Permissions granted");

    // 2. Check if channel exists (Android)
    console.log("📺 Checking notification channel...");
    try {
      const channel = await Notifications.getNotificationChannelAsync("adhan");
      if (!channel) {
        return {
          success: false,
          message:
            'Notification channel "adhan" not found. Please run setup first.',
        };
      }
      console.log("✅ Channel exists:", channel.name);
    } catch (error) {
      console.log("⚠️ Could not check channel (might be iOS)");
    }

    // 3. Check for potential issues
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();
    const warnings = [];

    // Check if dates are in the future
    const now = new Date();
    const futureNotifications = scheduledNotifications.filter((n) => {
      const trigger = n.trigger as any;
      return trigger.date && new Date(trigger.date) > now;
    });

    if (scheduledNotifications.length > futureNotifications.length) {
      warnings.push(
        `${scheduledNotifications.length - futureNotifications.length} notifications scheduled in the past`
      );
    }

    console.log("✅ Setup test completed successfully");

    return {
      success: true,
      message:
        warnings.length > 0
          ? `Setup working but with warnings: ${warnings.join(", ")}`
          : "All notification setup tests passed! 🎉",
      details: {
        permissions,
        scheduledCount: scheduledNotifications.length,
        futureCount: futureNotifications.length,
        warnings,
      },
    };
  } catch (error) {
    console.error("❌ Test failed:", error);
    return {
      success: false,
      message: "Test failed with error",
      details: error,
    };
  }
}

// Helper function to show user-friendly alerts
async function showTestResults(result: TestResult) {
  if (result.success) {
    Alert.alert("✅ Setup Test Passed", result.message, [{ text: "OK" }]);
  } else {
    Alert.alert("❌ Setup Issue Found", result.message, [
      { text: "Open Settings", onPress: () => Linking.openSettings() },
      { text: "OK", style: "cancel" },
    ]);
  }

  // Log details for debugging
  console.log("Test result details:", result.details);
}

export async function schedulePrayers(prayers: PrayerSlot[]): Promise<void> {
  // Test the setup first
  console.log("🧪 Running notification setup test...");
  const testResult = await testNotificationSetup();

  if (!testResult.success) {
    console.error("❌ Notification setup test failed:", testResult.message);
    await showTestResults(testResult);
    // You can choose to return early or continue despite the test failure
    // return; // Uncomment this if you want to stop on test failure
  } else {
    console.log("✅ Setup test passed, proceeding with scheduling");
    // Optionally show success to user
    // await showTestResults(testResult);
  }

  // Schedule a quick test notification (5 seconds)
  const testDate = new Date(Date.now() + 5000);
  console.log("📅 Scheduling test notification for:", testDate);

  try {
    const testId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🕌 Test Prayer Notification",
        body: `This is a test - ${testDate.toLocaleTimeString()}`,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        channelId: "adhan",
        date: testDate,
      } as any,
    });

    console.log("✅ Test notification scheduled with ID:", testId);

    // Verify it was scheduled
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const testNotif = scheduled.find((n) => n.identifier === testId);
    if (testNotif) {
      console.log("✅ Test notification confirmed in schedule");
    } else {
      console.error("❌ Test notification not found in schedule");
    }
  } catch (error) {
    console.error("❌ Failed to schedule test notification:", error);
    Alert.alert(
      "Test Failed",
      "Could not schedule test notification. Check your setup.",
      [{ text: "OK" }]
    );
  }

  // Schedule actual prayer notifications if prayers array is provided
  if (prayers && prayers.length > 0) {
    console.log(`📿 Scheduling ${prayers.length} prayer notifications...`);

    for (const p of prayers) {
      try {
        // Check if prayer time is in the future
        const now = new Date();
        if (p.date <= now) {
          console.warn(
            `⚠️ Skipping ${p.name} - time is in the past: ${p.date.toLocaleString()}`
          );
          continue;
        }

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: titleForPrayer(p.name),
            body: ` ${p.date.toLocaleTimeString()}`,
            priority: Notifications.AndroidNotificationPriority.MAX,
          },
          trigger: {
            channelId: "adhan",
            date: p.date,
          } as any,
        });

        console.log(
          `✅ Scheduled ${p.name} for ${p.date.toLocaleString()} (ID: ${notificationId})`
        );
      } catch (error) {
        console.error(`❌ Failed to schedule ${p.name}:`, error);
      }
    }

    // Final verification
    const allScheduled =
      await Notifications.getAllScheduledNotificationsAsync();
    console.log(`📊 Total scheduled notifications: ${allScheduled.length}`);

    // Show summary to user
    const futureNotifications = allScheduled.filter((n) => {
      const trigger = n.trigger as any;
      return trigger.date && new Date(trigger.date) > new Date();
    });

    Alert.alert(
      "Notifications Scheduled",
      `Successfully scheduled ${futureNotifications.length} prayer notifications.\n\nWatch for the test notification in 5 seconds!`,
      [{ text: "OK" }]
    );
  } else {
    console.log("📝 No prayers provided, only test notification scheduled");
    Alert.alert(
      "Test Notification Only",
      "Watch for the test notification in 5 seconds!",
      [{ text: "OK" }]
    );
  }
}

function titleForPrayer(name: PrayerSlot["name"]): string {
  switch (name) {
    case "fajr":
      return "الفجر";
    case "dhuhr":
      return "الظهر";
    case "asr":
      return "العصر";
    case "maghrib":
      return "المغرب";
    case "isha":
      return "العشاء";
  }
}
