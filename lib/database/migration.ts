/**
 * Data Migration Script - AsyncStorage to SQLite
 *
 * This script helps migrate existing data from AsyncStorage to SQLite.
 * It preserves all user data while transitioning to the new storage system.
 *
 * Usage: Call migrateFromAsyncStorage() once when the app starts
 * to migrate existing data to SQLite.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createHabit } from "./habits";
import { createBundle } from "./bundles";
import type { HabitProps } from "@/types/habit";
import type { BundleLocal } from "@/store/bundlesStore";

interface MigrationResult {
  success: boolean;
  habitsMigrated: number;
  bundlesMigrated: number;
  errors: string[];
}

/**
 * Migrate habits from AsyncStorage to SQLite
 */
async function migrateHabits(): Promise<{ count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;

  try {
    const habitsData = await AsyncStorage.getItem("habits");
    if (!habitsData) {
      return { count: 0, errors: [] };
    }

    const habits: any[] = JSON.parse(habitsData);

    for (const habit of habits) {
      try {
        // Convert old format to new format
        const migratedHabit: Omit<HabitProps, "completed"> = {
          id: habit.id,
          title: habit.title,
          quote: habit.quote,
          description: habit.description,
          streak: habit.streak || 0,
          bestStreak: habit.bestStreak || 0,
          relatedSalat: habit.relatedSalat || ["fajr"],
          relatedDays: habit.relatedDays || [0, 1, 2, 3, 4, 5, 6],
          category: habit.category || {
            text: "عام",
            hexColor: "#8B5CF6",
          },
          color: habit.color,
        };

        await createHabit(migratedHabit);
        count++;
      } catch (error) {
        errors.push(`Failed to migrate habit ${habit.id}: ${error}`);
      }
    }
  } catch (error) {
    errors.push(`Failed to read habits from AsyncStorage: ${error}`);
  }

  return { count, errors };
}

/**
 * Migrate bundles from AsyncStorage to SQLite
 */
async function migrateBundles(): Promise<{ count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;

  try {
    const bundlesData = await AsyncStorage.getItem("bundles");
    if (!bundlesData) {
      return { count: 0, errors: [] };
    }

    const bundles: any[] = JSON.parse(bundlesData);

    for (const bundle of bundles) {
      try {
        // Convert old format to new format
        const migratedBundle: BundleLocal = {
          id: bundle.id,
          title: bundle.title,
          subtitle: bundle.subtitle,
          description: bundle.description,
          category: bundle.category || {
            text: "عام",
            hexColor: "#8B5CF6",
          },
          image_url: bundle.image_url || "",
          color: bundle.color,
          dates: {
            enrolled_at: bundle.dates?.enrolled_at || new Date().toISOString(),
            start_date: bundle.dates?.start_date || new Date().toISOString(),
            end_date:
              bundle.dates?.end_date ||
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            duration_days: bundle.dates?.duration_days || 30,
            current_day: bundle.dates?.current_day || 1,
            is_active: bundle.dates?.is_active !== false,
            completed_days: bundle.dates?.completed_days || [],
            last_activity: bundle.dates?.last_activity || "",
          },
          habits: (bundle.habits || []).map((habit: any) => ({
            id: habit.id,
            title: habit.title,
            quote: habit.quote,
            description: habit.description,
            relatedDays: habit.relatedDays || [0, 1, 2, 3, 4, 5, 6],
            relatedSalat: habit.relatedSalat || ["fajr"],
            category: habit.category ||
              bundle.category || {
                text: "عام",
                hexColor: "#8B5CF6",
              },
            completed: habit.completed || [],
            streak: habit.streak || 0,
            bestStreak: habit.bestStreak || 0,
          })),
        };

        await createBundle(migratedBundle);
        count++;
      } catch (error) {
        errors.push(`Failed to migrate bundle ${bundle.id}: ${error}`);
      }
    }
  } catch (error) {
    errors.push(`Failed to read bundles from AsyncStorage: ${error}`);
  }

  return { count, errors };
}

/**
 * Check if migration has already been completed
 */
async function isMigrationCompleted(): Promise<boolean> {
  try {
    const migrationFlag = await AsyncStorage.getItem(
      "sqlite_migration_completed"
    );
    return migrationFlag === "true";
  } catch {
    return false;
  }
}

/**
 * Mark migration as completed
 */
async function markMigrationCompleted(): Promise<void> {
  try {
    await AsyncStorage.setItem("sqlite_migration_completed", "true");
  } catch (error) {
    console.error("Failed to mark migration as completed:", error);
  }
}

/**
 * Main migration function
 * Call this once when the app starts to migrate existing data
 */
export async function migrateFromAsyncStorage(): Promise<MigrationResult> {
  console.log("🔄 Starting data migration from AsyncStorage to SQLite...");

  // Check if migration has already been completed
  const alreadyMigrated = await isMigrationCompleted();
  if (alreadyMigrated) {
    console.log("✅ Migration already completed, skipping...");
    return {
      success: true,
      habitsMigrated: 0,
      bundlesMigrated: 0,
      errors: [],
    };
  }

  const result: MigrationResult = {
    success: true,
    habitsMigrated: 0,
    bundlesMigrated: 0,
    errors: [],
  };

  try {
    // Migrate habits
    console.log("📝 Migrating habits...");
    const habitsResult = await migrateHabits();
    result.habitsMigrated = habitsResult.count;
    result.errors.push(...habitsResult.errors);

    // Migrate bundles
    console.log("📦 Migrating bundles...");
    const bundlesResult = await migrateBundles();
    result.bundlesMigrated = bundlesResult.count;
    result.errors.push(...bundlesResult.errors);

    // Mark migration as completed if successful
    if (result.errors.length === 0) {
      await markMigrationCompleted();
      console.log("✅ Data migration completed successfully!");
      console.log(
        `📊 Migrated ${result.habitsMigrated} habits and ${result.bundlesMigrated} bundles`
      );
    } else {
      result.success = false;
      console.warn("⚠️ Migration completed with errors:", result.errors);
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Migration failed: ${error}`);
    console.error("❌ Migration failed:", error);
  }

  return result;
}

/**
 * Clear AsyncStorage data after successful migration
 * Use with caution - this will permanently delete AsyncStorage data
 */
export async function clearAsyncStorageAfterMigration(): Promise<void> {
  try {
    console.log("🧹 Clearing AsyncStorage data after migration...");

    // Only clear if migration was completed
    const migrationCompleted = await isMigrationCompleted();
    if (!migrationCompleted) {
      console.warn("⚠️ Migration not completed, skipping AsyncStorage cleanup");
      return;
    }

    // Clear specific keys related to habits and bundles
    await AsyncStorage.multiRemove(["habits", "bundles"]);
    console.log("✅ AsyncStorage data cleared successfully");
  } catch (error) {
    console.error("❌ Failed to clear AsyncStorage:", error);
  }
}

/**
 * Get migration status
 */
export async function getMigrationStatus(): Promise<{
  isCompleted: boolean;
  hasAsyncStorageData: boolean;
}> {
  try {
    const isCompleted = await isMigrationCompleted();

    // Check if there's data in AsyncStorage
    const habitsData = await AsyncStorage.getItem("habits");
    const bundlesData = await AsyncStorage.getItem("bundles");
    const hasAsyncStorageData = !!(habitsData || bundlesData);

    return {
      isCompleted,
      hasAsyncStorageData,
    };
  } catch (error) {
    console.error("Failed to get migration status:", error);
    return {
      isCompleted: false,
      hasAsyncStorageData: false,
    };
  }
}
