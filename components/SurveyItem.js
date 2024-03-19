import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const SurveyItem = ({ survey, onPress, navigation }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.itemContainer}>
      <Text style={styles.title}>{survey.title}</Text>
      <Text style={styles.description}>{survey.description}</Text>
      <Text style={styles.time}>Estimated Time: {survey.time} mins</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  time: {
    fontSize: 12,
    color: "#999",
    marginTop: 10,
  },
});

export default SurveyItem;
