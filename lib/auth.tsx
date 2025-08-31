import React, { useState, useEffect, createContext, useContext } from "react";
import { Session, User, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { Platform } from "react-native";

// Types
export interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: AuthError | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  checkEmailConfirmation: () => Promise<{
    confirmed: boolean;
    error: AuthError | null;
  }>;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign Up with email and password
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log("Attempting signup with:", email);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error("Signup error:", error);
      } else {
        console.log("Signup successful, check email for confirmation");
      }

      return { error };
    } catch (err) {
      console.error("Signup exception:", err);
      return { error: err as AuthError };
    }
  };

  // Sign In with email and password
  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting signin with:", email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Signin error:", error);
      } else {
        console.log("Signin successful");
      }

      return { error };
    } catch (err) {
      console.error("Signin exception:", err);
      return { error: err as AuthError };
    }
  };

  // Sign In with Google using Expo OAuth
  const signInWithGoogle = async () => {
    try {
      console.log("Starting Google OAuth flow...");

      // Create the redirect URI for OAuth
      const redirectUri = makeRedirectUri({
        scheme: "myapp",
        path: "auth/callback",
      });

      console.log("Redirect URI:", redirectUri);

      // Start OAuth flow with Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Google OAuth error:", error);

        // Check if it's the "provider not enabled" error
        if (error.message?.includes("provider is not enabled")) {
          return {
            error: {
              message:
                "Google authentication is not configured yet. Please enable Google OAuth in your Supabase dashboard under Authentication → Providers → Google",
            } as AuthError,
          };
        }

        return { error };
      }

      if (data?.url) {
        console.log("Opening OAuth URL:", data.url);

        // Open the OAuth URL in browser
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri
        );

        console.log("OAuth result:", result);

        if (result.type === "success") {
          // Handle successful authentication
          console.log("Google OAuth successful");
          return { error: null };
        } else if (result.type === "cancel") {
          console.log("Google OAuth cancelled by user");
          return {
            error: { message: "Authentication cancelled" } as AuthError,
          };
        } else {
          console.error("Google OAuth failed:", result);
          return { error: { message: "Authentication failed" } as AuthError };
        }
      }

      return { error: { message: "No OAuth URL received" } as AuthError };
    } catch (err) {
      console.error("Google signin error:", err);
      return { error: err as AuthError };
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      console.log("Signout successful");
    } catch (err) {
      console.error("Signout error:", err);
    }
  };

  // Reset Password
  const resetPassword = async (email: string) => {
    try {
      const redirectUri = makeRedirectUri({
        scheme: "myapp",
        path: "auth/reset-password",
      });

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUri,
      });
      return { error };
    } catch (err) {
      console.error("Reset password error:", err);
      return { error: err as AuthError };
    }
  };

  // Update Password
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      return { error };
    } catch (err) {
      console.error("Update password error:", err);
      return { error: err as AuthError };
    }
  };

  // Check Email Confirmation Status
  const checkEmailConfirmation = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        return { confirmed: false, error };
      }
      return { confirmed: !!user?.email_confirmed_at, error: null };
    } catch (err) {
      console.error("Check email confirmation error:", err);
      return { confirmed: false, error: err as AuthError };
    }
  };

  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    checkEmailConfirmation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Utility functions
export const getErrorMessage = (error: AuthError | null): string => {
  if (!error) return "";

  console.log("Error message:", error.message);

  switch (error.message) {
    case "Invalid login credentials":
      return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
    case "Email not confirmed":
      return "يرجى تأكيد بريدك الإلكتروني أولاً";
    case "User already registered":
      return "هذا البريد الإلكتروني مسجل بالفعل";
    case "Password should be at least 6 characters":
      return "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    case "Unable to validate email address: invalid format":
      return "صيغة البريد الإلكتروني غير صحيحة";
    case "Signup disabled":
      return "إنشاء الحسابات معطل حالياً";
    case "Signup not allowed":
      return "إنشاء الحسابات غير مسموح به";
    case "Authentication cancelled":
      return "تم إلغاء عملية تسجيل الدخول";
    case "Authentication failed":
      return "فشل في عملية تسجيل الدخول";
    default:
      return error.message || "حدث خطأ غير متوقع";
  }
};
