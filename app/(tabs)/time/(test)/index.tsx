import Animated from "react-native-reanimated";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { Button } from "react-native";
const Stack = createNativeStackNavigator();

function One({ navigation }: { navigation: any }) {
  return (
    <>
      <Animated.View sharedTransitionTag="sharedTag" />
      <Button title="Two" onPress={() => navigation.navigate("Two")} />
    </>
  );
}

function Two({ navigation }: { navigation: any }) {
  return (
    <>
      <Animated.View sharedTransitionTag="sharedTag" />
      <Button title="One" onPress={() => navigation.navigate("One")} />
    </>
  );
}

export default function SharedElementExample() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        <Stack.Screen name="One" component={One} />
        <Stack.Screen name="Two" component={Two} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
