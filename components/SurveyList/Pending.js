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
import { useSurveyContext } from "../../surveyContext";

const Pending = ({ navigation }) => {
  const { pendingSurveys, isRefreshing, handleRefresh } = useSurveyContext();

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
