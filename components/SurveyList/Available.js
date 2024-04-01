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
import { useSurveyContext } from "../../surveyContext";

const Available = ({ navigation }) => {
  const { surveys, isRefreshing, handleRefresh } = useSurveyContext();

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
