/**
 * Habits Data Access Layer
 *
 * This module provides CRUD operations for habits with Islamic tracking principles:
 * - Prayer-based completion tracking
 * - Day-based habit scheduling
 * - Streak calculation
 * - Performance-optimized queries
 */

import { executeQuery, executeUpdate, executeTransaction } from "./index";
import type { HabitProps, CompletionRecord } from "@/types/habit";

// Database interfaces for habits
export interface HabitDB {
  id: string;
  title: string;
  quote?: string;
  description?: string;
  streak: number;
  best_streak: number;
  category_text?: string;
  category_hex_color?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface HabitCompletionDB {
  id: number;
  habit_id: string;
  date: string;
  prayer: string;
  completed_at: string;
}

export interface HabitRelatedDayDB {
  id: number;
  habit_id: string;
  day_number: number;
}

export interface HabitRelatedSalatDB {
  id: number;
  habit_id: string;
  prayer: string;
}

/**
 * Create a new habit with related days and salat
 */
export async function createHabit(
  habit: Omit<HabitProps, "completed">
): Promise<void> {
  await executeTransaction(async (tx) => {
    // Insert main habit record
    await tx.runAsync(
      `
      INSERT INTO habits (
        id, title, quote, description, streak, best_streak,
        category_text, category_hex_color, color
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        habit.id,
        habit.title,
        habit.quote || null,
        habit.description || null,
        habit.streak || 0,
        habit.bestStreak || 0,
        habit.category?.text || null,
        habit.category?.hexColor || null,
        habit.color || null,
      ]
    );

    // Insert related days
    for (const day of habit.relatedDays) {
      await tx.runAsync(
        `
        INSERT INTO habit_related_days (habit_id, day_number)
        VALUES (?, ?)
      `,
        [habit.id, day]
      );
    }

    // Insert related salat
    for (const prayer of habit.relatedSalat) {
      await tx.runAsync(
        `
        INSERT INTO habit_related_salat (habit_id, prayer)
        VALUES (?, ?)
      `,
        [habit.id, prayer]
      );
    }
  });
}

/**
 * Get all habits with their related data
 */
export async function getAllHabits(): Promise<HabitProps[]> {
  const habits = await executeQuery<HabitDB>(`
    SELECT * FROM habits
    ORDER BY created_at DESC
  `);

  const result: HabitProps[] = [];

  for (const habit of habits.rows) {
    // Get related days
    const relatedDays = await executeQuery<HabitRelatedDayDB>(
      `
      SELECT day_number FROM habit_related_days
      WHERE habit_id = ?
      ORDER BY day_number
    `,
      [habit.id]
    );

    // Get related salat
    const relatedSalat = await executeQuery<HabitRelatedSalatDB>(
      `
      SELECT prayer FROM habit_related_salat
      WHERE habit_id = ?
      ORDER BY prayer
    `,
      [habit.id]
    );

    // Get completion records
    const completions = await executeQuery<HabitCompletionDB>(
      `
      SELECT * FROM habit_completions
      WHERE habit_id = ?
      ORDER BY date DESC, prayer
    `,
      [habit.id]
    );

    // Convert to HabitProps format
    result.push({
      id: habit.id,
      title: habit.title,
      quote: habit.quote || undefined,
      description: habit.description || undefined,
      streak: habit.streak,
      bestStreak: habit.best_streak,
      completed: completions.rows.map((c) => ({
        date: c.date,
        prayer: c.prayer,
      })),
      relatedSalat: relatedSalat.rows.map((s) => s.prayer as any),
      relatedDays: relatedDays.rows.map((d) => d.day_number),
      category: habit.category_text
        ? {
            text: habit.category_text,
            hexColor: habit.category_hex_color || "#8B5CF6",
          }
        : undefined,
      color: habit.color || undefined,
    });
  }

  return result;
}

/**
 * Get a single habit by ID
 */
export async function getHabitById(id: string): Promise<HabitProps | null> {
  const habits = await executeQuery<HabitDB>(
    `
    SELECT * FROM habits WHERE id = ?
  `,
    [id]
  );

  if (habits.rows.length === 0) {
    return null;
  }

  const habit = habits.rows[0];

  // Get related data
  const relatedDays = await executeQuery<HabitRelatedDayDB>(
    `
    SELECT day_number FROM habit_related_days
    WHERE habit_id = ?
    ORDER BY day_number
  `,
    [id]
  );

  const relatedSalat = await executeQuery<HabitRelatedSalatDB>(
    `
    SELECT prayer FROM habit_related_salat
    WHERE habit_id = ?
    ORDER BY prayer
  `,
    [id]
  );

  const completions = await executeQuery<HabitCompletionDB>(
    `
    SELECT * FROM habit_completions
    WHERE habit_id = ?
    ORDER BY date DESC, prayer
  `,
    [id]
  );

  return {
    id: habit.id,
    title: habit.title,
    quote: habit.quote || undefined,
    description: habit.description || undefined,
    streak: habit.streak,
    bestStreak: habit.best_streak,
    completed: completions.rows.map((c) => ({
      date: c.date,
      prayer: c.prayer,
    })),
    relatedSalat: relatedSalat.rows.map((s) => s.prayer as any),
    relatedDays: relatedDays.rows.map((d) => d.day_number),
    category: habit.category_text
      ? {
          text: habit.category_text,
          hexColor: habit.category_hex_color || "#8B5CF6",
        }
      : undefined,
    color: habit.color || undefined,
  };
}

/**
 * Update habit completion for a specific date and prayer
 */
export async function updateHabitCompletion(
  habitId: string,
  date: string,
  prayer: string,
  completed: boolean
): Promise<void> {
  if (completed) {
    // Insert completion record (ignore if already exists)
    await executeUpdate(
      `
      INSERT OR IGNORE INTO habit_completions (habit_id, date, prayer)
      VALUES (?, ?, ?)
    `,
      [habitId, date, prayer]
    );
  } else {
    // Remove completion record
    await executeUpdate(
      `
      DELETE FROM habit_completions
      WHERE habit_id = ? AND date = ? AND prayer = ?
    `,
      [habitId, date, prayer]
    );
  }

  // Update habit's updated_at timestamp
  await executeUpdate(
    `
    UPDATE habits SET updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
    [habitId]
  );
}

/**
 * Update habit streak information
 */
export async function updateHabitStreak(
  habitId: string,
  streak: number,
  bestStreak?: number
): Promise<void> {
  await executeUpdate(
    `
    UPDATE habits 
    SET streak = ?, best_streak = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
    [streak, bestStreak || 0, habitId]
  );
}

/**
 * Update habit basic information
 */
export async function updateHabit(
  habitId: string,
  updates: Partial<
    Pick<HabitProps, "title" | "quote" | "description" | "color">
  >
): Promise<void> {
  const fields = [];
  const values = [];

  if (updates.title !== undefined) {
    fields.push("title = ?");
    values.push(updates.title);
  }
  if (updates.quote !== undefined) {
    fields.push("quote = ?");
    values.push(updates.quote);
  }
  if (updates.description !== undefined) {
    fields.push("description = ?");
    values.push(updates.description);
  }
  if (updates.color !== undefined) {
    fields.push("color = ?");
    values.push(updates.color);
  }

  if (fields.length === 0) return;

  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(habitId);

  await executeUpdate(
    `
    UPDATE habits 
    SET ${fields.join(", ")}
    WHERE id = ?
  `,
    values
  );
}

/**
 * Delete a habit and all related data
 */
export async function deleteHabit(habitId: string): Promise<void> {
  await executeUpdate(
    `
    DELETE FROM habits WHERE id = ?
  `,
    [habitId]
  );
}

/**
 * Get habit completions for a specific date range
 */
export async function getHabitCompletionsInRange(
  habitId: string,
  startDate: string,
  endDate: string
): Promise<CompletionRecord[]> {
  const result = await executeQuery<HabitCompletionDB>(
    `
    SELECT * FROM habit_completions
    WHERE habit_id = ? AND date BETWEEN ? AND ?
    ORDER BY date, prayer
  `,
    [habitId, startDate, endDate]
  );

  return result.rows.map((c) => ({
    date: c.date,
    prayer: c.prayer,
  }));
}

/**
 * Check if habit is completed for specific date and prayer
 */
export async function isHabitCompleted(
  habitId: string,
  date: string,
  prayer: string
): Promise<boolean> {
  const result = await executeQuery(
    `
    SELECT 1 FROM habit_completions
    WHERE habit_id = ? AND date = ? AND prayer = ?
    LIMIT 1
  `,
    [habitId, date, prayer]
  );

  return result.rows.length > 0;
}
