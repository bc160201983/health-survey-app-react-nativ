import React, { useState, useEffect } from "react";

import { View, Text, StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Available from "../components/SurveyList/Available";
import Pending from "../components/SurveyList/Pending";
import Completed from "../components/SurveyList/Completed";
import { globalStyles } from "../styles/global";
import db from "../firebase"; // Adjust the import path as necessary
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useSurveyContext } from "../surveyContext";
import { useDeviceUUID } from "../context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Tab = createMaterialTopTabNavigator();

const Home = ({ navigation }) => {
  const { surveyCounts } = useSurveyContext();
  const { deviceUUID } = useDeviceUUID();

  return (
    <View style={globalStyles.container}>
      <Tab.Navigator>
        <Tab.Screen
          name={`Available (${surveyCounts.available})`}
          component={Available}
          options={{
            tabBarLabel: ({ color }) => (
              <TabBarLabel
                title={`Available`}
                count={surveyCounts.available}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name={`Pending (${surveyCounts.pending})`}
          component={Pending}
          options={{
            tabBarLabel: ({ color }) => (
              <TabBarLabel
                title={`Pending`}
                count={surveyCounts.pending}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name={`Completed (${surveyCounts.completed})`}
          component={Completed}
          options={{
            tabBarLabel: ({ color }) => (
              <TabBarLabel
                title={`Completed`}
                count={surveyCounts.completed}
                color={color}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

const TabBarLabel = ({ title, count, color }) => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <Text style={{ color }}>{title}</Text>
    <View style={styles.countCircle}>
      <Text style={styles.countText}>{count}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  countCircle: {
    marginLeft: 6,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    color: "white",
    fontSize: 12,
  },
});

export default Home;
