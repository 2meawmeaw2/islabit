import { addHabitToShop } from "./habits-shop-api";
import { HabitsShopHabit, DEFAULT_CATEGORIES } from "@/types/habit";

// Sample habits for the shop
const sampleHabits: Omit<HabitsShopHabit, "id">[] = [
  {
    title: "قراءة القرآن الكريم",
    benefit: [
      "زيادة الحسنات والثواب",
      "البركة في الوقت والرزق",
      "الهدوء والطمأنينة النفسية",
      "تحسين الذاكرة والتركيز",
    ],
    quote: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",
    description:
      "عادة يومية لقراءة جزء من القرآن الكريم مع التدبر والتفكر في معانيه",
    suggestedRelatedSalat: ["fajr", "isha"],
    suggestedRelatedDays: ["0", "1", "2", "3", "4", "5", "6"], // 0-6 for days of week
    categories: [DEFAULT_CATEGORIES[0]], // روحاني
    color: "#8B5CF6",
  },
  {
    title: "الاستيقاظ قبل الفجر",
    benefit: [
      "البركة في اليوم",
      "وقت هادئ للعبادة والتفكر",
      "تحسين جودة النوم",
      "زيادة الإنتاجية",
    ],
    quote: "اللَّهُمَّ بَارِكْ لِأُمَّتِي فِي بُكُورِهَا",
    description: "الاستيقاظ قبل صلاة الفجر بساعة للعبادة والاستعداد ليوم جديد",
    suggestedRelatedSalat: ["fajr"],
    suggestedRelatedDays: ["0", "1", "2", "3", "4", "5", "6"],
    categories: [DEFAULT_CATEGORIES[0]], // روحاني
    color: "#8B5CF6",
  },
  {
    title: "المشي اليومي",
    benefit: [
      "تحسين صحة القلب",
      "تقوية العضلات والعظام",
      "تحسين المزاج",
      "زيادة الطاقة",
    ],
    quote: "وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ",
    description: "مشي يومي لمدة 30 دقيقة للحفاظ على الصحة البدنية",
    suggestedRelatedSalat: ["asr", "maghrib"],
    suggestedRelatedDays: ["0", "1", "2", "3", "4", "5", "6"],
    categories: [DEFAULT_CATEGORIES[1]], // صحي
    color: "#10B981",
  },
  {
    title: "تعلم كلمة إنجليزية جديدة",
    benefit: [
      "تطوير المهارات اللغوية",
      "فتح آفاق جديدة للتعلم",
      "تحسين فرص العمل",
      "زيادة الثقة بالنفس",
    ],
    quote: "وَمَن يَسْعَ فِي خَيْرٍ نُسَاعِدْهُ",
    description: "تعلم كلمة إنجليزية جديدة يومياً مع معناها واستخدامها في جملة",
    suggestedRelatedSalat: ["dhuhr"],
    suggestedRelatedDays: ["0", "1", "2", "3", "4", "5", "6"],
    categories: [DEFAULT_CATEGORIES[2]], // تعليمي
    color: "#3B82F6",
  },
  {
    title: "الزكاة الشهرية",
    benefit: [
      "تنقية المال والقلب",
      "مساعدة المحتاجين",
      "زيادة البركة في الرزق",
      "إرضاء الله تعالى",
    ],
    quote: "وَمَا أَنفَقْتُم مِّن شَيْءٍ فَهُوَ يُخْلِفُهُ",
    description: "إخراج الزكاة الشهرية للمحتاجين والمستحقين",
    suggestedRelatedSalat: ["dhuhr"],
    suggestedRelatedDays: ["0"], // أول كل شهر
    categories: [DEFAULT_CATEGORIES[4]], // مالي
    color: "#EF4444",
  },
  {
    title: "قضاء وقت مع العائلة",
    benefit: [
      "تقوية الروابط الأسرية",
      "خلق ذكريات جميلة",
      "تعليم الأطفال القيم",
      "الاستقرار النفسي",
    ],
    quote: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا",
    description: "قضاء وقت مخصص يومياً مع أفراد العائلة للحديث واللعب",
    suggestedRelatedSalat: ["maghrib", "isha"],
    suggestedRelatedDays: ["0", "1", "2", "3", "4", "5", "6"],
    categories: [DEFAULT_CATEGORIES[5]], // عائلي
    color: "#EC4899",
  },
];

// Function to seed the habits shop with sample data
export async function seedHabitsShop(): Promise<void> {
  try {
    console.log("Starting to seed habits shop...");

    for (const habit of sampleHabits) {
      try {
        await addHabitToShop(habit);
        console.log(`Added habit: ${habit.title}`);
      } catch (error) {
        console.error(`Error adding habit ${habit.title}:`, error);
      }
    }

    console.log("Finished seeding habits shop");
  } catch (error) {
    console.error("Error seeding habits shop:", error);
    throw error;
  }
}

// Function to clear all habits from shop (for testing)
export async function clearHabitsShop(): Promise<void> {
  // This would require admin access to Supabase
  // For now, we'll just log the intention
  console.log("Clear habits shop function - requires admin access");
}
