import { Link } from "expo-router";
import { ImageBackground, Text, View } from "react-native";
import { BlurView } from "expo-blur";
export default function Index() {
  return (
    <View className="flex-1 bg-bg">
      <ImageBackground
        source={require("@/assets/images/startbg.jpg")}
        className=" relative w-full h-1/2  border-white justify-end items-center"
        resizeMode="contain"
      >
        <Link href="/habit">
          <Text className="text-lg text-blue-500">Habit</Text>
        </Link>

        <Link href="/settings">
          <Text className="text-lg text-blue-500">Settings</Text>
        </Link>

        <Link href="/signIn">
          <Text className="text-lg text-blue-500">Login</Text>
        </Link>

        <Link href="/signUp">
          <Text className="text-lg text-blue-500">Sign Up</Text>
        </Link>
      </ImageBackground>
    </View>
  );
}
