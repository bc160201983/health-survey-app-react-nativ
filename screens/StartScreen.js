import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import db from "../firebase"; // Adjust the import path as necessary
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useDeviceUUID } from "../context";

const StartScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const { surveyId, surveyTitle, surveyDescription, questions } = route.params;

  const { deviceUUID } = useDeviceUUID(); // Use context to get device UUID

  const handleStartSurvey = async () => {
    const responseId = `${deviceUUID}_${surveyId}`;
    const surveyResponseRef = doc(db, "SurveyResponses", responseId);
    setLoading(true);
    try {
      const docSnapshot = await getDoc(surveyResponseRef);

      if (docSnapshot.exists()) {
        // Pending survey response already exists, navigate to the Survey screen
        navigation.navigate("Survey", {
          surveyId,
          surveyTitle,
          surveyDescription,
          questions,
          responseId,
        });
      } else {
        // Create a new survey response entry
        await setDoc(
          surveyResponseRef,
          {
            surveyId,
            deviceUUID,
            status: "pending",
            startTime: new Date(),
          },
          { merge: true }
        );

        // Navigate to the Survey screen with the new response ID
        navigation.navigate("Survey", {
          surveyId,
          surveyTitle,
          surveyDescription,
          questions,
          responseId,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error starting survey: ", error);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to {surveyTitle}</Text>
      <Text style={styles.description}>
        {surveyDescription || "No description available"}
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" animating={loading} />
      ) : (
        <Button title="Start Survey" onPress={handleStartSurvey} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
});

export default StartScreen;
