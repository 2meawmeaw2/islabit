import { supabase } from "@/utils/supabase";

// Type definitions for bundles
export interface BundleHabit {
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  relatedDays: number[];
  relatedSalat: string[];
}

export interface BundleComment {
  id: string;
  user: string;
  text: string;
}

export interface UserCommitedBundles {
  id: string;
  started_at: string;
  ends_at: string;
}
export interface BundleCategory {
  text: string;
  hexColor: string;
}

export interface Bundle {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  color: string;
  category: BundleCategory;
  habits: BundleHabit[];
  benefits: string[];
  comments: BundleComment[];
  rating?: number;
  likes?: string[];
  user_has_liked?: boolean;
  enrolled_users: string[];
  created_at: string;
  updated_at: string;
}

// Fetch all bundles from Supabase
export const fetchBundles = async (): Promise<Bundle[]> => {
  try {
    const { data, error } = await supabase
      .from("bundles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bundles:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchBundles:", error);
    throw error;
  }
};

// Fetch a single bundle by ID
export const fetchBundleById = async (id: string): Promise<Bundle | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;

    const { data, error } = await supabase
      .from("bundles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching bundle:", error);
      throw error;
    }

    // Check if user has liked this bundle
    if (data && userId) {
      const likes = data.likes || [];
      data.user_has_liked = likes.includes(userId);
    }

    return data;
  } catch (error) {
    console.error("Error in fetchBundleById:", error);
    throw error;
  }
};

// Update bundle rating
export const updateBundleRating = async (
  bundleId: string,
  newRating: number
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("bundles")
      .update({ rating: newRating })
      .eq("id", bundleId);

    if (error) {
      console.error("Error updating bundle rating:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in updateBundleRating:", error);
    throw error;
  }
};

// Add user to bundle's enrolled_users list (idempotent)
export const addUserToBundleEnrolledUsers = async (
  bundleId: string,
  userId: string
): Promise<void> => {
  try {
    if (!userId || !bundleId) return;

    // Get current enrolled users for the bundle
    const { data: bundle, error: fetchError } = await supabase
      .from("bundles")
      .select("enrolled_users")
      .eq("id", bundleId)
      .single();

    if (fetchError) {
      console.error("Error fetching bundle enrolled_users:", fetchError);
      throw fetchError;
    }

    const current = (bundle?.enrolled_users || []) as string[];
    if (current.includes(userId)) return; // already enrolled

    const updated = [...current, userId];

    const { error: updateError } = await supabase
      .from("bundles")
      .update({ enrolled_users: updated })
      .eq("id", bundleId);

    if (updateError) {
      console.error("Error updating enrolled_users:", updateError);
      throw updateError;
    }
  } catch (error) {
    console.error("Error in addUserToBundleEnrolledUsers:", error);
    throw error;
  }
};

// Add a comment to a bundle
export const addBundleComment = async (
  bundleId: string,
  comment: Omit<BundleComment, "id">
): Promise<void> => {
  try {
    const { data: bundle } = await supabase
      .from("bundles")
      .select("comments")
      .eq("id", bundleId)
      .single();

    if (bundle) {
      const updatedComments = [
        ...(bundle.comments || []),
        { ...comment, id: `comment_${Date.now()}` },
      ];

      const { error } = await supabase
        .from("bundles")
        .update({ comments: updatedComments })
        .eq("id", bundleId);

      if (error) {
        console.error("Error adding comment:", error);
        throw error;
      }
    }
  } catch (error) {
    console.error("Error in addBundleComment:", error);
    throw error;
  }
};

// ADD bundle to user's commited bundles
export const addBundleToUserCommitedBundles = async (
  userId: string,
  id: string,
  ends_at: string
): Promise<void> => {
  try {
    // First, get the user's current committed bundles
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("commited_bundles")
      .eq("id", userId)
      .single(); // Use single() since we're getting one user

    if (fetchError) {
      console.error("Error fetching user data:", fetchError);
      throw fetchError;
    }

    // Extract the committed bundles array, or initialize as empty array if none exist
    const currentBundles = userData?.commited_bundles || [];

    // Create the new bundle entry
    const newBundle = { id, enrolled_at: new Date().toISOString(), ends_at };

    // Add the new bundle to the existing array
    const updatedBundles = [...currentBundles, newBundle];

    // Update the user's committed bundles
    const { error: updateError } = await supabase
      .from("users")
      .update({ commited_bundles: updatedBundles })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user's committed bundles:", updateError);
      throw updateError;
    }

    console.log("Successfully added bundle to user's committed bundles");
  } catch (error) {
    console.error("Error in addBundleToUserCommitedBundles:", error);
    throw error;
  }
};

// Toggle like for a bundle
export const toggleBundleLike = async (
  bundleId: string,
  isLiked: boolean
): Promise<void> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not authenticated");

    const userId = user.user.id;

    // Get current bundle data
    const { data: bundle, error: fetchError } = await supabase
      .from("bundles")
      .select("likes")
      .eq("id", bundleId)
      .single();

    if (fetchError) {
      console.error("Error fetching bundle:", fetchError);
      throw fetchError;
    }

    // Initialize likes array if it doesn't exist
    const currentLikes = bundle?.likes || [];

    // Update likes array based on action
    let updatedLikes;
    if (isLiked) {
      // Add user to likes if not already present
      if (!currentLikes.includes(userId)) {
        updatedLikes = [...currentLikes, userId];
      } else {
        updatedLikes = currentLikes;
      }
    } else {
      // Remove user from likes
      updatedLikes = currentLikes.filter((id: string) => id !== userId);
    }

    // Update the bundle with new likes data
    const { error: updateError } = await supabase
      .from("bundles")
      .update({
        likes: updatedLikes,
      })
      .eq("id", bundleId);

    if (updateError) {
      console.error("Error updating bundle likes:", updateError);
      throw updateError;
    }

    console.log("Successfully updated bundle likes");
  } catch (error) {
    console.error("Error in toggleBundleLike:", error);
    throw error;
  }
};
