/**
 * Database Initialization Hook
 *
 * This hook initializes the SQLite database when the app starts.
 * It should be called early in the app lifecycle to ensure
 * the database is ready before any data operations.
 */

import { useEffect, useState } from "react";
import { initializeAppDatabase } from "../lib/database/index";
import { migrateFromAsyncStorage } from "../lib/database/migration";

export function useDatabaseInitialization() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log("🚀 Starting database initialization...");
        setIsLoading(true);
        setError(null);

        // Initialize database schema
        await initializeAppDatabase();

        // Migrate existing data from AsyncStorage
        console.log("🔄 Starting data migration...");
        const migrationResult = await migrateFromAsyncStorage();

        if (!migrationResult.success) {
          console.warn(
            "⚠️ Migration completed with errors:",
            migrationResult.errors
          );
        }

        console.log("✅ Database initialization and migration completed");
        setIsInitialized(true);
      } catch (err) {
        console.error("❌ Database initialization failed:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  return {
    isInitialized,
    isLoading,
    error,
  };
}
