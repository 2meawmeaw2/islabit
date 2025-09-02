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
  rating: number;
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
    const { data, error } = await supabase
      .from("bundles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching bundle:", error);
      throw error;
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

// Increment enrolled count when user enrolls in a bundle
export const incrementEnrolledCount = async (
  bundleId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("bundles")
      .update({
        enrolled_count: supabase.rpc("increment_enrolled_count", {
          bundle_id: bundleId,
        }),
      })
      .eq("id", bundleId);

    if (error) {
      console.error("Error incrementing enrolled count:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in incrementEnrolledCount:", error);
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
