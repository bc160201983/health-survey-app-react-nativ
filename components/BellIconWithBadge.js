import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { useSurveyContext } from "../surveyContext";

import { doc, onSnapshot } from "firebase/firestore";
import db from "../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BellIconWithBadge = () => {
  const { notiCount } = useSurveyContext();
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("Notifications")}
      style={styles.container}
    >
      <View>
        <FontAwesome name="bell-o" size={24} color="black" />
        {notiCount > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{notiCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
  },
  badgeContainer: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
  },
});

export default BellIconWithBadge;
