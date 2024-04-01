import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import db from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { useDeviceUUID } from "../../context"; // Adjust import path as needed
import SurveyItem from "../SurveyItem";

const Completed = () => {
  const [completedSurveys, setCompletedSurveys] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { deviceUUID } = useDeviceUUID(); // Assume this hook provides the device UUID

  const fetchCompletedSurveys = async () => {
    try {
      // Query for completed survey responses for the current device
      const responseQuery = query(
        collection(db, "SurveyResponses"),
        where("deviceUUID", "==", deviceUUID),
        where("status", "==", "completed")
      );
      const querySnapshot = await getDocs(responseQuery);

      const surveys = await Promise.all(
        querySnapshot.docs.map(async (responseDoc) => {
          const surveyId = responseDoc.data().surveyId;
          const surveyDocRef = doc(db, "Surveys", surveyId); // More accurately named variable
          const surveyDoc = await getDoc(surveyDocRef);
          return surveyDoc.exists()
            ? { id: surveyDoc.id, ...surveyDoc.data() }
            : null;
        })
      );

      setCompletedSurveys(surveys.filter((survey) => survey !== null));
    } catch (error) {
      console.error("Error fetching completed surveys:", error);
      Alert.alert(
        "Error",
        "An error occurred while fetching completed surveys."
      );
    }
  };

  useEffect(() => {
    fetchCompletedSurveys();
  }, [deviceUUID]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCompletedSurveys();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={completedSurveys}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SurveyItem survey={item} />
          // <View style={styles.item}>
          //   <Text style={styles.title}>{item.title}</Text>
          //   <Text style={styles.description}>{item.description}</Text>
          // </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

// ... (styles remain the same)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
  },
});

export default Completed;
