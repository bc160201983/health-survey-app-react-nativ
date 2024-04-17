import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useSurveyContext } from "../surveyContext";
import moment from "moment"; // Import moment library for date formatting
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { useDeviceUUID } from "../context";
import db from "../firebase";

const NotificationListScreen = ({ navigation }) => {
  const { pendingSurveys, surveys } = useSurveyContext();
  const [notifications, setNotiofications] = useState([]);
  const { deviceUUID } = useDeviceUUID();
  const markNotificationAsSeen = async (deviceUUID, notificationId) => {
    const notificationRef = doc(db, "notificationToken", deviceUUID);

    try {
      const docSnap = await getDoc(notificationRef);
      if (docSnap.exists()) {
        const notifications = docSnap.data().notifications || [];

        // Find the index of the notification ID in the array
        const index = notifications?.findIndex(
          (notification) => notification.notificationId === notificationId
        );

        if (index !== -1) {
          // Update the 'seen' property of the found notification object
          notifications[index].seen = true;

          // Update the document with the modified 'notifications' array
          await updateDoc(notificationRef, {
            notifications: notifications,
          });

          console.log("Notification marked as seen successfully");
        } else {
          console.log("Notification ID not found in the array");
        }
      } else {
        console.log("No such document found for deviceUUID:", deviceUUID);
      }
    } catch (error) {
      console.error("Error marking notification as seen:", error);
      throw error;
    }
  };

  const handleNotificationPress = async (surveyId, notificationId) => {
    try {
      // Mark the notification as seen
      await markNotificationAsSeen(deviceUUID, notificationId);

      // Check if the survey is pending
      const pendingSurvey = pendingSurveys.find(
        (survey) => survey.id === surveyId
      );
      const availableSurvey = surveys.find((survey) => survey.id === surveyId);

      if (pendingSurvey) {
        // If the survey is pending, navigate to the Survey screen with pending survey data
        navigation.navigate("Survey", {
          surveyId: pendingSurvey.id,
          surveyTitle: pendingSurvey.title,
          questions: pendingSurvey.questions,
          responseId: pendingSurvey.responseId,
        });
      } else {
        navigation.navigate("Survey", {
          surveyId: availableSurvey.id,
          surveyTitle: availableSurvey.title,
          questions: availableSurvey.questions,
          responseId: availableSurvey.responseId,
        });
        // If the survey is not pending, it is available
        // You can handle available surveys here, such as showing a message or navigating to a different screen
        console.log("Available Survey:", surveyId);
        // For example:
        // navigation.navigate("AvailableSurveyScreen", { surveyId });
      }
    } catch (error) {
      console.error("Error handling notification press:", error);
    }
  };

  async function getNotifications() {
    try {
      const deviceID = await AsyncStorage.getItem("deviceUUID");
      const tokenNotiRef = doc(db, "notificationToken", deviceID);
      const unsubscribe = onSnapshot(tokenNotiRef, (docSnap) => {
        if (docSnap.exists()) {
          const notificationsData = docSnap.data().notifications || [];
          // Sort notifications by timestamp in descending order
          const sortedNotifications = notificationsData.sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
          });
          setNotiofications(sortedNotifications);
        } else {
          console.log("NotificationListScreen", "No such document!");
          setNotiofications([]);
        }
      });

      // Return the unsubscribe function to detach the listener when needed
      return unsubscribe;
    } catch (error) {
      console.error("Error getting notifications:", error);
      throw error;
    }
  }

  useEffect(() => {
    getNotifications();
  }, [deviceUUID]);
  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              handleNotificationPress(item.surveyId, item.notificationId)
            }
          >
            <View
              style={[
                styles.notificationContainer,
                { backgroundColor: item.seen ? "#f0f0f0" : "#e0e0e0" },
              ]}
            >
              <View style={styles.TileAndTime}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationTimestamp}>
                  {moment(item.timestamp).format("MMMM Do YYYY, h:mm:ss a")}
                </Text>
              </View>
              <Text style={styles.notificationBody}>{item.body}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => item.surveyId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  TileAndTime: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationContainer: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  notificationTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  notificationTimestamp: {
    fontSize: 12,
    marginBottom: 5,
    color: "gray",
  },
  notificationBody: {
    fontSize: 16,
  },
});

export default NotificationListScreen;
