/**
 * SQLite Database Schema for Islamic Habit Tracking App
 *
 * This schema is designed to maintain the Islamic principles of:
 * - Salat-based time tracking
 * - Intention-driven habits
 * - Prayer-based completion records
 * - Bundle completion logic
 */

export const DATABASE_NAME = "islabit.db";
export const DATABASE_VERSION = 1;

// SQL statements for creating tables
export const CREATE_TABLES = {
  // Core habits table
  habits: `
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      quote TEXT,
      description TEXT,
      streak INTEGER DEFAULT 0,
      best_streak INTEGER DEFAULT 0,
      category_text TEXT,
      category_hex_color TEXT,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  // Habit completion records (prayer-based)
  habit_completions: `
    CREATE TABLE IF NOT EXISTS habit_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      prayer TEXT NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
      UNIQUE(habit_id, date, prayer)
    )
  `,

  // Habit related days (which days of week)
  habit_related_days: `
    CREATE TABLE IF NOT EXISTS habit_related_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id TEXT NOT NULL,
      day_number INTEGER NOT NULL CHECK (day_number >= 0 AND day_number <= 6),
      FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
      UNIQUE(habit_id, day_number)
    )
  `,

  // Habit related salat (which prayers)
  habit_related_salat: `
    CREATE TABLE IF NOT EXISTS habit_related_salat (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id TEXT NOT NULL,
      prayer TEXT NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
      UNIQUE(habit_id, prayer)
    )
  `,

  // Bundles table
  bundles: `
    CREATE TABLE IF NOT EXISTS bundles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      description TEXT NOT NULL,
      category_text TEXT NOT NULL,
      category_hex_color TEXT NOT NULL,
      image_url TEXT,
      color TEXT NOT NULL,
      enrolled_at TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      duration_days INTEGER NOT NULL,
      current_day INTEGER DEFAULT 1,
      is_active BOOLEAN DEFAULT 1,
      last_activity TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  // Bundle habits (habits within bundles)
  bundle_habits: `
    CREATE TABLE IF NOT EXISTS bundle_habits (
      id TEXT PRIMARY KEY,
      bundle_id TEXT NOT NULL,
      title TEXT NOT NULL,
      quote TEXT,
      description TEXT NOT NULL,
      streak INTEGER DEFAULT 0,
      best_streak INTEGER DEFAULT 0,
      category_text TEXT NOT NULL,
      category_hex_color TEXT NOT NULL,
      FOREIGN KEY (bundle_id) REFERENCES bundles (id) ON DELETE CASCADE
    )
  `,

  // Bundle habit completion records
  bundle_habit_completions: `
    CREATE TABLE IF NOT EXISTS bundle_habit_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bundle_habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      prayer TEXT NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bundle_habit_id) REFERENCES bundle_habits (id) ON DELETE CASCADE,
      UNIQUE(bundle_habit_id, date, prayer)
    )
  `,

  // Bundle habit related days
  bundle_habit_related_days: `
    CREATE TABLE IF NOT EXISTS bundle_habit_related_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bundle_habit_id TEXT NOT NULL,
      day_number INTEGER NOT NULL CHECK (day_number >= 0 AND day_number <= 6),
      FOREIGN KEY (bundle_habit_id) REFERENCES bundle_habits (id) ON DELETE CASCADE,
      UNIQUE(bundle_habit_id, day_number)
    )
  `,

  // Bundle habit related salat
  bundle_habit_related_salat: `
    CREATE TABLE IF NOT EXISTS bundle_habit_related_salat (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bundle_habit_id TEXT NOT NULL,
      prayer TEXT NOT NULL,
      FOREIGN KEY (bundle_habit_id) REFERENCES bundle_habits (id) ON DELETE CASCADE,
      UNIQUE(bundle_habit_id, prayer)
    )
  `,

  // Bundle completed days tracking
  bundle_completed_days: `
    CREATE TABLE IF NOT EXISTS bundle_completed_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bundle_id TEXT NOT NULL,
      date TEXT NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bundle_id) REFERENCES bundles (id) ON DELETE CASCADE,
      UNIQUE(bundle_id, date)
    )
  `,
};

// Indexes for better performance
export const CREATE_INDEXES = {
  // Habits indexes
  habits_created_at:
    "CREATE INDEX IF NOT EXISTS idx_habits_created_at ON habits(created_at)",
  habits_updated_at:
    "CREATE INDEX IF NOT EXISTS idx_habits_updated_at ON habits(updated_at)",

  // Habit completions indexes
  habit_completions_habit_id:
    "CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id)",
  habit_completions_date:
    "CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(date)",
  habit_completions_prayer:
    "CREATE INDEX IF NOT EXISTS idx_habit_completions_prayer ON habit_completions(prayer)",

  // Bundle indexes
  bundles_created_at:
    "CREATE INDEX IF NOT EXISTS idx_bundles_created_at ON bundles(created_at)",
  bundles_is_active:
    "CREATE INDEX IF NOT EXISTS idx_bundles_is_active ON bundles(is_active)",

  // Bundle habit indexes
  bundle_habits_bundle_id:
    "CREATE INDEX IF NOT EXISTS idx_bundle_habits_bundle_id ON bundle_habits(bundle_id)",

  // Bundle habit completions indexes
  bundle_habit_completions_habit_id:
    "CREATE INDEX IF NOT EXISTS idx_bundle_habit_completions_habit_id ON bundle_habit_completions(bundle_habit_id)",
  bundle_habit_completions_date:
    "CREATE INDEX IF NOT EXISTS idx_bundle_habit_completions_date ON bundle_habit_completions(date)",

  // Bundle completed days indexes
  bundle_completed_days_bundle_id:
    "CREATE INDEX IF NOT EXISTS idx_bundle_completed_days_bundle_id ON bundle_completed_days(bundle_id)",
  bundle_completed_days_date:
    "CREATE INDEX IF NOT EXISTS idx_bundle_completed_days_date ON bundle_completed_days(date)",
};

// All SQL statements combined for easy execution
export const ALL_CREATE_STATEMENTS = [
  ...Object.values(CREATE_TABLES),
  ...Object.values(CREATE_INDEXES),
];
