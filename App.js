import db from "./firebase";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Home from "./screens/Home";
import Survey from "./screens/Survey";
import StartScreen from "./screens/StartScreen";
import FinishScreen from "./screens/FinishScreen";
import { DeviceUUIDProvider } from "./context";
import { SurveyProvider, useSurveyContext } from "./surveyContext";
import BellIconWithBadge from "./components/BellIconWithBadge";
import NotificationListScreen from "./screens/NotificationListScreen";
import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Button, Platform, Text, View } from "react-native";

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  async function saveTokenToFirebase(token) {
    const deviceUUID = await AsyncStorage.getItem("deviceUUID");
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

        await setDoc(doc(notificationTokenCollection, deviceUUID), { token });
        console.log("Token saved successfully for new device:", deviceUUID);
      }
    } catch (error) {
      console.error("Error saving token to Firestore:", error);
    }
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then(async (token) => {
      await saveTokenToFirebase(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // useEffect(() => {
  //   registerForPushNotificationsAsync();
  // }, []);

  console.log("expoPushToken", expoPushToken);
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

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: "Here is the notification body",
      data: { data: "goes here" },
    },
    trigger: { seconds: 2 },
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
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
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "5fc300eb-c930-4fc4-96b3-832c49e05f64",
      })
    ).data;
    console.log(token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}
