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
        <Link href="/all-habits" className="my-10">
          <Text className="text-lg text-blue-500">Habit</Text>
        </Link>

        <Link href="/signIn" className="my-10">
          <Text className="text-lg text-blue-500">Login</Text>
        </Link>

        <Link href="/signUp" className="my-10">
          <Text className="text-lg text-blue-500">Sign Up</Text>
        </Link>
      </ImageBackground>
    </View>
  );
}
