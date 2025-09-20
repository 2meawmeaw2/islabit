/**
 * Database Initialization and Management
 *
 * This module handles:
 * - Database connection and initialization
 * - Schema creation and migrations
 * - Database versioning
 * - Error handling and logging
 */

import * as SQLite from "expo-sqlite";
import {
  DATABASE_NAME,
  DATABASE_VERSION,
  ALL_CREATE_STATEMENTS,
} from "./schema";

// Database instance
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database connection
 * This function is safe to call multiple times
 */
export function initializeDatabase(): SQLite.SQLiteDatabase {
  if (db) {
    return db;
  }

  try {
    db = SQLite.openDatabaseSync(DATABASE_NAME);
    console.log("✅ Database connection established:", DATABASE_NAME);
    return db;
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    throw error;
  }
}

/**
 * Create all database tables and indexes
 * This should be called once when the app starts
 */
export async function createDatabaseSchema(): Promise<void> {
  const database = initializeDatabase();

  try {
    // Enable foreign key constraints for data integrity
    database.execSync("PRAGMA foreign_keys = ON");

    // Create all tables and indexes
    for (const statement of ALL_CREATE_STATEMENTS) {
      database.execSync(statement);
    }

    console.log("✅ Database schema created successfully");
  } catch (error) {
    console.error("❌ Failed to create database schema:", error);
    throw error;
  }
}

/**
 * Get the database instance
 * Returns null if not initialized
 */
export function getDatabase(): SQLite.SQLiteDatabase | null {
  return db;
}

/**
 * Close the database connection
 * Useful for cleanup or testing
 */
export function closeDatabase(): void {
  if (db) {
    db.closeSync();
    db = null;
    console.log("✅ Database connection closed");
  }
}

/**
 * Check if database is initialized
 */
export function isDatabaseInitialized(): boolean {
  return db !== null;
}

/**
 * Execute a transaction with automatic error handling
 * This ensures data consistency and proper error management
 */
export function executeTransaction<T>(
  callback: (tx: SQLite.SQLiteTransaction) => T
): Promise<T> {
  const database = initializeDatabase();

  return new Promise((resolve, reject) => {
    database.transactionAsync(async (tx) => {
      try {
        const result = await callback(tx);
        resolve(result);
      } catch (error) {
        console.error("Transaction error:", error);
        reject(error);
      }
    });
  });
}

/**
 * Execute a single SQL statement with parameters
 * Returns the result set
 */
export function executeQuery<T = any>(
  sql: string,
  params: any[] = []
): Promise<SQLite.SQLiteResultSet<T>> {
  const database = initializeDatabase();

  return new Promise((resolve, reject) => {
    database
      .getAllAsync<T>(sql, params)
      .then((rows) => {
        resolve({
          rows: rows as any,
          insertId: undefined,
          rowsAffected: 0,
        });
      })
      .catch(reject);
  });
}

/**
 * Execute a single SQL statement that modifies data
 * Returns the number of affected rows
 */
export function executeUpdate(
  sql: string,
  params: any[] = []
): Promise<number> {
  const database = initializeDatabase();

  return new Promise((resolve, reject) => {
    database
      .runAsync(sql, params)
      .then((result) => {
        resolve(result.changes);
      })
      .catch(reject);
  });
}

/**
 * Initialize the database on app startup
 * This should be called early in the app lifecycle
 */
export async function initializeAppDatabase(): Promise<void> {
  try {
    console.log("🚀 Initializing Islamic Habit Tracking Database...");

    // Initialize database connection
    initializeDatabase();

    // Create schema
    await createDatabaseSchema();

    console.log("✅ Database initialization completed successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}
