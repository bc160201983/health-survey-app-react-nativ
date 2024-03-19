import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import db from "../../firebase"; // Adjust the import path as necessary
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { useDeviceUUID } from "../../context";
import SurveyItem from "../SurveyItem"; // Adjust the import path as necessary

const Available = ({ navigation }) => {
  const [surveys, setSurveys] = useState([]);
  const { deviceUUID } = useDeviceUUID();
  const [isRefreshing, setIsRefreshing] = useState(false); // Add a state for refreshing
  console.log(deviceUUID);

  // Ensure this hook correctly provides the device UUID
  const handlePress = (survey) => {
    // Navigate to the StartScreen with the survey details
    navigation.navigate("StartScreen", {
      surveyId: survey.id,
      surveyTitle: survey.title,
      surveyDescription: survey.description,
      questions: survey.questions, // Ensure questions are part of your survey document or fetched here
    });
  };
  const fetchAvailableSurveys = async () => {
    setIsRefreshing(true); // Set refreshing to true when fetching starts

    try {
      const responsesQuery = query(
        collection(db, "SurveyResponses"),
        where("deviceUUID", "==", deviceUUID),
        where("status", "in", ["pending", "available"])
      );
      const responsesSnapshot = await getDocs(responsesQuery);
      const pendingSurveyIds = responsesSnapshot.docs.map(
        (doc) => doc.data().surveyId
      );

      let availableSurveys = [];

      if (pendingSurveyIds.length > 0) {
        // Fetch all available surveys and exclude pending ones
        const surveysQuery = query(
          collection(db, "Surveys"),
          where("status", "==", "available")
        );
        const surveysSnapshot = await getDocs(surveysQuery);

        availableSurveys = surveysSnapshot.docs
          .filter((doc) => !pendingSurveyIds.includes(doc.id))
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
      } else {
        // Fetch all available surveys without filtering, as no pending surveys are found
        const surveysQuery = query(
          collection(db, "Surveys"),
          where("status", "==", "available")
        );
        const surveysSnapshot = await getDocs(surveysQuery);

        availableSurveys = surveysSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      setSurveys(availableSurveys);
      setIsRefreshing(false); // Set refreshing to false when fetching is done
    } catch (error) {
      console.error("Error fetching surveys:", error);
      Alert.alert(
        "Error Fetching Surveys",
        "An error occurred while fetching surveys."
      );
    }
  };
  useEffect(() => {
    fetchAvailableSurveys();
  }, [deviceUUID]); // Dependency on deviceUUID to refetch when it changes

  const handleRefresh = () => {
    fetchAvailableSurveys();
  };

  return (
    <View style={styles.container}>
      {isRefreshing ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={surveys}
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

export default Available;
