import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AntDesign } from "@expo/vector-icons";
import Home from "./screens/Home";
import Survey from "./screens/Survey";
import StartScreen from "./screens/StartScreen";
import FinishScreen from "./screens/FinishScreen";
import { DeviceUUIDProvider } from "./context";
import { SurveyProvider } from "./surveyContext";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <DeviceUUIDProvider>
      <SurveyProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              options={{
                title: "List of Survey",
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
