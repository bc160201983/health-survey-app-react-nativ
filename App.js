import db from "./firebase";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import Home from "./screens/Home";
import Survey from "./screens/Survey";
import StartScreen from "./screens/StartScreen";
import FinishScreen from "./screens/FinishScreen";
import { DeviceUUIDProvider } from "./context";
import { SurveyProvider, useSurveyContext } from "./surveyContext";
import BellIconWithBadge from "./components/BellIconWithBadge";
import NotificationListScreen from "./screens/NotificationListScreen";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
  }),
});
export default function App() {
  async function saveTokenToFirebase(token, deviceUUID) {
    // Get a reference to the Firestore collection
    const notificationTokenCollection = collection(db, "notificationToken");

    try {
      // Check if the device already exists in the Firestore collection
      const deviceDoc = await getDoc(
        doc(notificationTokenCollection, deviceUUID)
      );

      if (deviceDoc.exists()) {
        // If the device exists, update the token
        await updateDoc(doc(notificationTokenCollection, deviceUUID), {
          token,
        });
        console.log("Token updated successfully for device:", deviceUUID);
      } else {
        // If the device doesn't exist, create a new document with the token
        console.log(deviceUUID);
        await setDoc(doc(notificationTokenCollection, deviceUUID), { token });
        console.log("Token saved successfully for new device:", deviceUUID);
      }
    } catch (error) {
      console.error("Error saving token to Firestore:", error);
    }
  }
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

    try {
      const deviceUUID = await AsyncStorage.getItem("deviceUUID");
      await saveTokenToFirebase(token, deviceUUID);
      // Save token and device UUID to Firestore here
    } catch (error) {
      console.log("Error:", error);
    }

    return token;
  }

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);
  return (
    <DeviceUUIDProvider>
      <SurveyProvider>
        <NavigationContainer independent={true}>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen
              options={{
                title: "List of Surveys",
                headerRight: ({ navigation }) => (
                  <BellIconWithBadge navigation={navigation} />
                ),
              }}
              name="Home"
              component={Home}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationListScreen}
              options={{ title: "Notifications" }}
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
