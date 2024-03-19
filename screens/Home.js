import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Available from "../components/SurveyList/Available";
import Pending from "../components/SurveyList/Pending";
import Completed from "../components/SurveyList/Completed";
import { globalStyles } from "../styles/global";
import db from "../firebase"; // Adjust the import path as necessary
import { collection, query, where, getDocs } from "firebase/firestore";

const Tab = createMaterialTopTabNavigator();

const Home = ({ navigation }) => {
  const [surveyCounts, setSurveyCounts] = useState({
    available: 0,
    pending: 0,
    completed: 0,
  });

  const fetchSurveyCounts = async () => {
    // Firestore collection reference
    const surveysCollectionRef = collection(db, "Surveys");

    // Function to fetch count by status
    const fetchCountByStatus = async (status) => {
      const q = query(surveysCollectionRef, where("status", "==", status));
      const querySnapshot = await getDocs(q);
      return querySnapshot.size; // Returns the count of documents in the querySnapshot
    };

    // Fetch counts for each status
    const availableCount = await fetchCountByStatus("available");
    const pendingCount = await fetchCountByStatus("pending");
    const completedCount = await fetchCountByStatus("completed");

    // Set the state with the fetched counts
    setSurveyCounts({
      available: availableCount,
      pending: pendingCount,
      completed: completedCount,
    });
  };

  useEffect(() => {
    fetchSurveyCounts();
  }, [surveyCounts]);

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
