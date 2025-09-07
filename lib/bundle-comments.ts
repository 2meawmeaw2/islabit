import { supabase } from "@/utils/supabase";

export interface BundleComment {
  id: string;
  userId: string;
  text: string;
  userName: string;
  createdAt: string;
}

export async function addBundleComment(bundleId: string, commentText: string) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { error: "يجب تسجيل الدخول أولاً" };

    const { data: bundle, error: fetchError } = await supabase
      .from("bundles")
      .select("comments")
      .eq("id", bundleId)
      .single();

    if (fetchError || !bundle) return { error: "Bundle not found" };

    const comments = bundle.comments || [];
    const newComment = {
      id: Date.now().toString() + Math.random().toString(36), // Simple unique ID
      userId: user.id,
      text: commentText,
      userName: user.user_metadata?.full_name || "مستخدم",
      createdAt: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("bundles")
      .update({ comments: [newComment, ...comments] })
      .eq("id", bundleId);

    if (updateError) {
      console.error("Update error:", updateError);
      return { error: "فشل في إضافة التعليق" };
    }

    return { success: true };
  } catch (err) {
    console.error("Exception in addBundleComment:", err);
    return { error: "حدث خطأ غير متوقع" };
  }
}

export async function getBundleComments(bundleId: string) {
  const { data } = await supabase
    .from("bundles")
    .select("comments")
    .eq("id", bundleId)
    .single();

  return data?.comments || [];
}

export function formatCommentTime(timestamp: string): string {
  const now = new Date();
  const commentTime = new Date(timestamp);
  const diffInMinutes = Math.floor(
    (now.getTime() - commentTime.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 4) {
    return "الآن";
  } else if (diffInMinutes < 60) {
    return `منذ ${diffInMinutes} دقيقة`;
  } else if (diffInMinutes < 1440) {
    // 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `منذ ${hours} ساعة`;
  } else if (diffInMinutes < 525600) {
    // 365 days (1 year)
    const days = Math.floor(diffInMinutes / 1440);
    return `منذ ${days} يوم`;
  } else {
    const years = Math.floor(diffInMinutes / 525600);
    return `منذ ${years} سنة`;
  }
}
