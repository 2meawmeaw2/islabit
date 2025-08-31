import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/utils/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          router.replace("/sign");
        } else {
          // Successfully authenticated, redirect to main app
          console.log("Authentication successful");
          router.replace("/(tabs)/home");
        }
      } catch (err) {
        console.error("Auth callback exception:", err);
        router.replace("/sign");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>جاري معالجة تسجيل الدخول...</Text>
    </View>
  );
}
