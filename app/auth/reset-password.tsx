import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/utils/supabase";

export default function ResetPasswordCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleResetCallback = async () => {
      try {
        // Handle the password reset callback
        const { error } = await supabase.auth.getSession();

        if (error) {
          console.error("Reset callback error:", error);
          router.replace("/sign");
        } else {
          // Successfully reset password, redirect to sign in
          console.log("Password reset successful");
          router.replace("/sign");
        }
      } catch (err) {
        console.error("Reset callback exception:", err);
        router.replace("/sign");
      }
    };

    handleResetCallback();
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>جاري معالجة إعادة تعيين كلمة المرور...</Text>
    </View>
  );
}
