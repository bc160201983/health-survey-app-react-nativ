import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { useSurveyContext } from "../surveyContext";
import { useDeviceUUID } from "../context";
import { doc, onSnapshot } from "firebase/firestore";
import db from "../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BellIconWithBadge = () => {
  const [notiCount, setNotiCount] = useState(0);
  const { deviceUUID } = useDeviceUUID();

  const navigation = useNavigation();

  async function getUnseenNotificationCount() {
    const deviceUUID = await AsyncStorage.getItem("deviceUUID");
    try {
      const tokenNotiRef = doc(db, "notificationToken", deviceUUID);
      const unsubscribe = onSnapshot(tokenNotiRef, (docSnap) => {
        if (docSnap.exists()) {
          const notifications = docSnap.data().notifications || [];
          console.log(notifications.length);
          const unseenNotifications = notifications.filter(
            (notification) => !notification.seen
          );

          const unseenCount = unseenNotifications.length;
          setNotiCount(unseenCount);
        } else {
          console.log("No such document!");
          setNotiCount(0);
        }
      });

      // Return the unsubscribe function to detach the listener when needed
      return unsubscribe;
    } catch (error) {
      console.error("Error getting unseen notification count:", error);
      throw error;
    }
  }

  useEffect(() => {
    getUnseenNotificationCount();
  }, [deviceUUID]);
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
