import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";

import { Alert, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AntDesign } from "@expo/vector-icons";
import Home from "./screens/Home";
import Survey from "./screens/Survey";
import StartScreen from "./screens/StartScreen";
import FinishScreen from "./screens/FinishScreen";
import { DeviceUUIDProvider } from "./context";
import { SurveyProvider } from "./surveyContext";
import { useEffect, useRef } from "react";

const Stack = createNativeStackNavigator();
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
  }),
});

export default function App() {
  const responseListener = useRef();

  async function registerForPushNotificationsAsync() {
    let token;

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);

    return token;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
    }),
  });

  useEffect(() => {
    registerForPushNotificationsAsync();
    // Works when app is foregrounded, backgrounded, or killed
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("--- notification tapped ---");
        console.log(response);
        console.log("------");
      });

    // Unsubscribe from events
    return () => {
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  return (
    <DeviceUUIDProvider>
      <SurveyProvider>
        <NavigationContainer independent={true}>
          <Stack.Navigator>
            <Stack.Screen
              options={{
                title: "List of Surveys",
                headerRight: () => (
                  <AntDesign name="bells" size={24} color="black" />
                ),
              }}
              name="Home"
              component={Home}
            />
            <Stack.Screen name="StartScreen" component={StartScreen} />
            <Stack.Screen name="Survey" component={Survey} />
            <Stack.Screen name="FinishScreen" component={FinishScreen} />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </SurveyProvider>
    </DeviceUUIDProvider>
  );
}
