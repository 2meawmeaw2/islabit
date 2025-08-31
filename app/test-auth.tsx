import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth";

export default function TestAuthScreen() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("test123456");
  const [fullName, setFullName] = useState("Test User");
  const { signUp, signIn, user, loading } = useAuth();

  const testSignUp = async () => {
    try {
      console.log("Testing signup...");
      const { error } = await signUp(email, password, fullName);
      if (error) {
        Alert.alert("Signup Error", error.message);
        console.error("Signup error:", error);
      } else {
        Alert.alert("Success", "Signup successful! Check your email.");
      }
    } catch (err) {
      Alert.alert("Exception", String(err));
      console.error("Signup exception:", err);
    }
  };

  const testSignIn = async () => {
    try {
      console.log("Testing signin...");
      const { error } = await signIn(email, password);
      if (error) {
        Alert.alert("Signin Error", error.message);
        console.error("Signin error:", error);
      } else {
        Alert.alert("Success", "Signin successful!");
      }
    } catch (err) {
      Alert.alert("Exception", String(err));
      console.error("Signin exception:", err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#00070A" }}>
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <Text style={{ color: "white", fontSize: 24, marginBottom: 20 }}>
          Auth Test Screen
        </Text>

        <Text style={{ color: "white", marginBottom: 10 }}>
          Current User: {user ? user.email : "None"}
        </Text>

        <Text style={{ color: "white", marginBottom: 10 }}>
          Loading: {loading ? "Yes" : "No"}
        </Text>

        <TextInput
          style={{
            backgroundColor: "#1a1a1a",
            color: "white",
            padding: 15,
            marginBottom: 10,
            borderRadius: 8,
          }}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={{
            backgroundColor: "#1a1a1a",
            color: "white",
            padding: 15,
            marginBottom: 10,
            borderRadius: 8,
          }}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={{
            backgroundColor: "#1a1a1a",
            color: "white",
            padding: 15,
            marginBottom: 20,
            borderRadius: 8,
          }}
          placeholder="Full Name"
          placeholderTextColor="#666"
          value={fullName}
          onChangeText={setFullName}
        />

        <TouchableOpacity
          style={{
            backgroundColor: "#00AEEF",
            padding: 15,
            borderRadius: 8,
            marginBottom: 10,
          }}
          onPress={testSignUp}
        >
          <Text
            style={{ color: "white", textAlign: "center", fontWeight: "bold" }}
          >
            Test Sign Up
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "#00AEEF",
            padding: 15,
            borderRadius: 8,
            marginBottom: 10,
          }}
          onPress={testSignIn}
        >
          <Text
            style={{ color: "white", textAlign: "center", fontWeight: "bold" }}
          >
            Test Sign In
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
