import { StatusBar } from "expo-status-bar";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AntDesign } from "@expo/vector-icons";
import { Badge } from "react-native-elements"; // Import the Badge component
import Home from "./screens/Home";
import Survey from "./screens/Survey";
import StartScreen from "./screens/StartScreen";
import FinishScreen from "./screens/FinishScreen";
import { DeviceUUIDProvider } from "./context";
import { SurveyProvider } from "./surveyContext";
import BellIconWithBadge from "./components/BellIconWithBadge";
import NotificationListScreen from "./screens/NotificationListScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const notificationCount = 3;
  const notifications = ["Notification 1", "Notification 2", "Notification 3"]; // Replace this with your list of notifications

  return (
    <DeviceUUIDProvider>
      <SurveyProvider>
        <NavigationContainer independent={true}>
          <Stack.Navigator>
            <Stack.Screen
              options={{
                title: "List of Surveys",
                headerRight: ({ navigation }) => (
                  <BellIconWithBadge
                    navigation={navigation}
                    count={notificationCount}
                    notifications={notifications}
                  />
                ),
              }}
              name="Home"
              component={Home}
            />
            <Stack.Screen name="StartScreen" component={StartScreen} />
            <Stack.Screen name="Survey" component={Survey} />
            <Stack.Screen name="FinishScreen" component={FinishScreen} />
            <Stack.Screen
              name="Notifications"
              component={NotificationListScreen}
              options={{ title: "Notifications" }}
            />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </SurveyProvider>
    </DeviceUUIDProvider>
  );
}
