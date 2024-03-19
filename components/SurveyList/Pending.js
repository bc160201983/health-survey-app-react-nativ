import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
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
import SurveyItem from "../SurveyItem";
import { useDeviceUUID } from "../../context"; // Ensure this path points to your actual context file

const Pending = ({ navigation }) => {
  const [pendingSurveys, setPendingSurveys] = useState([]);
  const { deviceUUID } = useDeviceUUID(); // Ensure this hook correctly provides the device UUID
  const [isRefreshing, setIsRefreshing] = useState(false); // Add a state for refreshing
  const fetchSurveys = async () => {
    setIsRefreshing(true); // Set refreshing to true when fetching starts
    if (!deviceUUID) {
      console.warn("Device UUID is unavailable.");
      Alert.alert(
        "Error",
        "Device UUID is unavailable. Please try again later."
      );
      return;
    }

    try {
      const responsesQuery = query(
        collection(db, "SurveyResponses"),
        where("deviceUUID", "==", deviceUUID),
        where("status", "==", "pending")
      );

      const querySnapshot = await getDocs(responsesQuery);
      const pendingSurveysData = await Promise.all(
        querySnapshot.docs.map(async (responseDoc) => {
          const surveyId = responseDoc.data().surveyId;
          const surveyDocSnap = await getDoc(doc(db, "Surveys", surveyId));
          if (surveyDocSnap.exists()) {
            const surveyData = surveyDocSnap.data();
            return {
              id: surveyDocSnap.id,
              ...surveyData,
              responseId: responseDoc.id, // Include the response ID
            };
          }
          return null;
        })
      );

      setPendingSurveys(pendingSurveysData.filter((survey) => survey !== null));
      setIsRefreshing(false); // Set refreshing to false when fetching ends
    } catch (error) {
      Alert.alert("Error", "An error occurred while fetching pending surveys.");
      console.error("Error fetching surveys:", error);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, [deviceUUID]);
  const handleRefresh = () => {
    fetchSurveys();
  };
  const handlePress = (survey) => {
    navigation.navigate("Survey", {
      surveyId: survey.id,
      surveyTitle: survey.title,
      questions: survey.questions,
      responseId: survey.responseId,
    });
  };

  return (
    <View style={styles.container}>
      {isRefreshing ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={pendingSurveys}
          renderItem={({ item }) => (
            <SurveyItem survey={item} onPress={() => handlePress(item)} />
          )}
          keyExtractor={(item) => item.id.toString()}
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
});

export default Pending;
