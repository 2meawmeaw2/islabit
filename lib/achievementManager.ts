import { AchievementConfig } from "@/components/time/AchievementFeedback";

// Global achievement manager
class AchievementManager {
  private static instance: AchievementManager;
  private showAchievementCallback:
    | ((config: AchievementConfig) => void)
    | null = null;

  private constructor() {}

  static getInstance(): AchievementManager {
    if (!AchievementManager.instance) {
      AchievementManager.instance = new AchievementManager();
    }
    return AchievementManager.instance;
  }

  setShowAchievement(callback: (config: AchievementConfig) => void) {
    this.showAchievementCallback = callback;
  }

  showAchievement(config: AchievementConfig) {
    if (this.showAchievementCallback) {
      this.showAchievementCallback(config);
    } else {
      console.warn("Achievement system not initialized");
    }
  }
}

// Export singleton instance
export const achievementManager = AchievementManager.getInstance();

// Export convenience function
export const showAchievement = (config: AchievementConfig) => {
  achievementManager.showAchievement(config);
};
