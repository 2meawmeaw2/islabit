/**
 * Bundles Data Access Layer
 *
 * This module provides CRUD operations for bundles with Islamic tracking principles:
 * - Bundle completion logic based on all habits being completed
 * - Prayer-based completion tracking for bundle habits
 * - Bundle day completion calculation
 * - Performance-optimized queries
 */

import { executeQuery, executeUpdate, executeTransaction } from "./index";
import type {
  BundleLocal,
  BundleHabitLocal,
  BundleDates,
} from "@/store/bundlesStore";

// Database interfaces for bundles
export interface BundleDB {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category_text: string;
  category_hex_color: string;
  image_url?: string;
  color: string;
  enrolled_at: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  current_day: number;
  is_active: boolean;
  last_activity?: string;
  created_at: string;
  updated_at: string;
}

export interface BundleHabitDB {
  id: string;
  bundle_id: string;
  title: string;
  quote?: string;
  description: string;
  streak: number;
  best_streak: number;
  category_text: string;
  category_hex_color: string;
}

export interface BundleHabitCompletionDB {
  id: number;
  bundle_habit_id: string;
  date: string;
  prayer: string;
  completed_at: string;
}

export interface BundleCompletedDayDB {
  id: number;
  bundle_id: string;
  date: string;
  completed_at: string;
}

/**
 * Create a new bundle with its habits
 */
export async function createBundle(bundle: BundleLocal): Promise<void> {
  await executeTransaction(async (tx) => {
    // Insert main bundle record
    await tx.runAsync(
      `
      INSERT INTO bundles (
        id, title, subtitle, description, category_text, category_hex_color,
        image_url, color, enrolled_at, start_date, end_date, duration_days,
        current_day, is_active, last_activity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        bundle.id,
        bundle.title,
        bundle.subtitle,
        bundle.description,
        bundle.category.text,
        bundle.category.hexColor,
        bundle.image_url || null,
        bundle.color,
        bundle.dates.enrolled_at,
        bundle.dates.start_date,
        bundle.dates.end_date,
        bundle.dates.duration_days,
        bundle.dates.current_day,
        bundle.dates.is_active ? 1 : 0,
        bundle.dates.last_activity || null,
      ]
    );

    // Insert bundle habits
    for (const habit of bundle.habits) {
      await tx.runAsync(
        `
        INSERT INTO bundle_habits (
          id, bundle_id, title, quote, description, streak, best_streak,
          category_text, category_hex_color
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          habit.id,
          bundle.id,
          habit.title,
          habit.quote || null,
          habit.description,
          habit.streak,
          habit.bestStreak,
          habit.category.text,
          habit.category.hexColor,
        ]
      );

      // Insert related days for this habit
      for (const day of habit.relatedDays) {
        await tx.runAsync(
          `
          INSERT INTO bundle_habit_related_days (bundle_habit_id, day_number)
          VALUES (?, ?)
        `,
          [habit.id, day]
        );
      }

      // Insert related salat for this habit
      for (const prayer of habit.relatedSalat) {
        await tx.runAsync(
          `
          INSERT INTO bundle_habit_related_salat (bundle_habit_id, prayer)
          VALUES (?, ?)
        `,
          [habit.id, prayer]
        );
      }

      // Insert completion records
      for (const completion of habit.completed) {
        if (typeof completion === "string") {
          // Legacy format - treat as date only
          await tx.runAsync(
            `
            INSERT OR IGNORE INTO bundle_habit_completions (bundle_habit_id, date, prayer)
            VALUES (?, ?, 'fajr')
          `,
            [habit.id, completion]
          );
        } else {
          // New format with prayer
          await tx.runAsync(
            `
            INSERT OR IGNORE INTO bundle_habit_completions (bundle_habit_id, date, prayer)
            VALUES (?, ?, ?)
          `,
            [habit.id, completion.date, completion.prayer]
          );
        }
      }
    }
  });
}

/**
 * Get all bundles with their habits and completion data
 */
export async function getAllBundles(): Promise<BundleLocal[]> {
  const bundles = await executeQuery<BundleDB>(`
    SELECT * FROM bundles
    ORDER BY created_at DESC
  `);

  const result: BundleLocal[] = [];

  for (const bundle of bundles.rows) {
    // Get bundle habits
    const habits = await executeQuery<BundleHabitDB>(
      `
      SELECT * FROM bundle_habits
      WHERE bundle_id = ?
      ORDER BY id
    `,
      [bundle.id]
    );

    const bundleHabits: BundleHabitLocal[] = [];

    for (const habit of habits.rows) {
      // Get related days
      const relatedDays = await executeQuery(
        `
        SELECT day_number FROM bundle_habit_related_days
        WHERE bundle_habit_id = ?
        ORDER BY day_number
      `,
        [habit.id]
      );

      // Get related salat
      const relatedSalat = await executeQuery(
        `
        SELECT prayer FROM bundle_habit_related_salat
        WHERE bundle_habit_id = ?
        ORDER BY prayer
      `,
        [habit.id]
      );

      // Get completion records
      const completions = await executeQuery<BundleHabitCompletionDB>(
        `
        SELECT * FROM bundle_habit_completions
        WHERE bundle_habit_id = ?
        ORDER BY date DESC, prayer
      `,
        [habit.id]
      );

      bundleHabits.push({
        id: habit.id,
        title: habit.title,
        quote: habit.quote || undefined,
        description: habit.description,
        relatedDays: relatedDays.rows.map((d: any) => d.day_number),
        relatedSalat: relatedSalat.rows.map((s: any) => s.prayer),
        category: {
          text: habit.category_text,
          hexColor: habit.category_hex_color,
        },
        completed: completions.rows.map((c) => ({
          date: c.date,
          prayer: c.prayer,
        })),
        streak: habit.streak,
        bestStreak: habit.best_streak,
      });
    }

    // Get completed days
    const completedDays = await executeQuery<BundleCompletedDayDB>(
      `
      SELECT date FROM bundle_completed_days
      WHERE bundle_id = ?
      ORDER BY date
    `,
      [bundle.id]
    );

    const bundleDates: BundleDates = {
      enrolled_at: bundle.enrolled_at,
      start_date: bundle.start_date,
      end_date: bundle.end_date,
      duration_days: bundle.duration_days,
      current_day: bundle.current_day,
      is_active: bundle.is_active,
      completed_days: completedDays.rows.map((c) => c.date),
      last_activity: bundle.last_activity || "",
    };

    result.push({
      id: bundle.id,
      title: bundle.title,
      subtitle: bundle.subtitle,
      description: bundle.description,
      category: {
        text: bundle.category_text,
        hexColor: bundle.category_hex_color,
      },
      image_url: bundle.image_url || "",
      dates: bundleDates,
      habits: bundleHabits,
      color: bundle.color,
    });
  }

  return result;
}

/**
 * Get a single bundle by ID
 */
export async function getBundleById(id: string): Promise<BundleLocal | null> {
  const bundles = await executeQuery<BundleDB>(
    `
    SELECT * FROM bundles WHERE id = ?
  `,
    [id]
  );

  if (bundles.rows.length === 0) {
    return null;
  }

  const bundle = bundles.rows[0];

  // Get bundle habits (same logic as getAllBundles)
  const habits = await executeQuery<BundleHabitDB>(
    `
    SELECT * FROM bundle_habits
    WHERE bundle_id = ?
    ORDER BY id
  `,
    [id]
  );

  const bundleHabits: BundleHabitLocal[] = [];

  for (const habit of habits.rows) {
    const relatedDays = await executeQuery(
      `
      SELECT day_number FROM bundle_habit_related_days
      WHERE bundle_habit_id = ?
      ORDER BY day_number
    `,
      [habit.id]
    );

    const relatedSalat = await executeQuery(
      `
      SELECT prayer FROM bundle_habit_related_salat
      WHERE bundle_habit_id = ?
      ORDER BY prayer
    `,
      [habit.id]
    );

    const completions = await executeQuery<BundleHabitCompletionDB>(
      `
      SELECT * FROM bundle_habit_completions
      WHERE bundle_habit_id = ?
      ORDER BY date DESC, prayer
    `,
      [habit.id]
    );

    bundleHabits.push({
      id: habit.id,
      title: habit.title,
      quote: habit.quote || undefined,
      description: habit.description,
      relatedDays: relatedDays.rows.map((d: any) => d.day_number),
      relatedSalat: relatedSalat.rows.map((s: any) => s.prayer),
      category: {
        text: habit.category_text,
        hexColor: habit.category_hex_color,
      },
      completed: completions.rows.map((c) => ({
        date: c.date,
        prayer: c.prayer,
      })),
      streak: habit.streak,
      bestStreak: habit.best_streak,
    });
  }

  const completedDays = await executeQuery<BundleCompletedDayDB>(
    `
    SELECT date FROM bundle_completed_days
    WHERE bundle_id = ?
    ORDER BY date
  `,
    [id]
  );

  const bundleDates: BundleDates = {
    enrolled_at: bundle.enrolled_at,
    start_date: bundle.start_date,
    end_date: bundle.end_date,
    duration_days: bundle.duration_days,
    current_day: bundle.current_day,
    is_active: bundle.is_active,
    completed_days: completedDays.rows.map((c) => c.date),
    last_activity: bundle.last_activity || "",
  };

  return {
    id: bundle.id,
    title: bundle.title,
    subtitle: bundle.subtitle,
    description: bundle.description,
    category: {
      text: bundle.category_text,
      hexColor: bundle.category_hex_color,
    },
    image_url: bundle.image_url || "",
    dates: bundleDates,
    habits: bundleHabits,
    color: bundle.color,
  };
}

/**
 * Update bundle habit completion
 */
export async function updateBundleHabitCompletion(
  bundleHabitId: string,
  date: string,
  prayer: string,
  completed: boolean
): Promise<void> {
  if (completed) {
    await executeUpdate(
      `
      INSERT OR IGNORE INTO bundle_habit_completions (bundle_habit_id, date, prayer)
      VALUES (?, ?, ?)
    `,
      [bundleHabitId, date, prayer]
    );
  } else {
    await executeUpdate(
      `
      DELETE FROM bundle_habit_completions
      WHERE bundle_habit_id = ? AND date = ? AND prayer = ?
    `,
      [bundleHabitId, date, prayer]
    );
  }
}

/**
 * Mark a bundle day as completed
 */
export async function markBundleDayCompleted(
  bundleId: string,
  date: string
): Promise<void> {
  await executeUpdate(
    `
    INSERT OR IGNORE INTO bundle_completed_days (bundle_id, date)
    VALUES (?, ?)
  `,
    [bundleId, date]
  );
}

/**
 * Remove bundle day completion
 */
export async function removeBundleDayCompletion(
  bundleId: string,
  date: string
): Promise<void> {
  await executeUpdate(
    `
    DELETE FROM bundle_completed_days
    WHERE bundle_id = ? AND date = ?
  `,
    [bundleId, date]
  );
}

/**
 * Update bundle current day
 */
export async function updateBundleCurrentDay(
  bundleId: string,
  currentDay: number
): Promise<void> {
  await executeUpdate(
    `
    UPDATE bundles 
    SET current_day = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
    [currentDay, bundleId]
  );
}

/**
 * Update bundle last activity
 */
export async function updateBundleLastActivity(
  bundleId: string,
  lastActivity: string
): Promise<void> {
  await executeUpdate(
    `
    UPDATE bundles 
    SET last_activity = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
    [lastActivity, bundleId]
  );
}

/**
 * Delete a bundle and all related data
 */
export async function deleteBundle(bundleId: string): Promise<void> {
  await executeUpdate(
    `
    DELETE FROM bundles WHERE id = ?
  `,
    [bundleId]
  );
}

/**
 * Check if a bundle day is completed (all habits completed for all prayers)
 */
export async function isBundleDayCompleted(
  bundleId: string,
  date: string
): Promise<boolean> {
  // Get all bundle habits
  const habits = await executeQuery<BundleHabitDB>(
    `
    SELECT id FROM bundle_habits WHERE bundle_id = ?
  `,
    [bundleId]
  );

  if (habits.rows.length === 0) {
    return false;
  }

  // For each habit, check if all its related salat are completed for this date
  for (const habit of habits.rows) {
    // Get related salat for this habit
    const relatedSalat = await executeQuery(
      `
      SELECT prayer FROM bundle_habit_related_salat
      WHERE bundle_habit_id = ?
    `,
      [habit.id]
    );

    // Get completed prayers for this habit on this date
    const completedPrayers = await executeQuery(
      `
      SELECT prayer FROM bundle_habit_completions
      WHERE bundle_habit_id = ? AND date = ?
    `,
      [habit.id, date]
    );

    // Check if all related salat are completed
    const requiredPrayers = relatedSalat.rows.map((s: any) => s.prayer);
    const completedPrayerList = completedPrayers.rows.map((c: any) => c.prayer);

    for (const prayer of requiredPrayers) {
      if (!completedPrayerList.includes(prayer)) {
        return false; // At least one prayer is missing
      }
    }
  }

  return true; // All habits completed for all their prayers
}
