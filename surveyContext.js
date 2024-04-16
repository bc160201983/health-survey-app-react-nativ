// SurveyContext.js
import db from "./firebase";
import { useDeviceUUID } from "./context";
import React, { createContext, useContext, useState, useEffect } from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SurveyContext = createContext();

export const SurveyProvider = ({ children }) => {
  const { deviceUUID } = useDeviceUUID();
  const [surveys, setSurveys] = useState([]);
  const [pendingSurveys, setPendingSurveys] = useState([]);
  const [notiCount, setNotiCount] = useState(0);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [surveyCounts, setSurveyCounts] = useState({
    available: 0,
    pending: 0,
    completed: 0,
  });
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

          const unseenCount = unseenNotifications?.length;
          setNotiCount(unseenCount);
        } else {
          console.log("Bellicon: No such document! in firebase");
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
  }, []);

  useEffect(() => {
    // Function to create a real-time listener for count by status
    const createCountListener = (status) => {
      if (status === "available") {
        const q = query(collection(db, "Surveys"));
        return onSnapshot(q, async (surveySnapshot) => {
          const allSurveys = surveySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const responseQueries = allSurveys.map((survey) =>
            query(
              collection(db, "SurveyResponses"),
              where("deviceUUID", "==", deviceUUID),
              where("surveyId", "==", survey.id),
              where("status", "in", ["pending", "completed"])
            )
          );

          const responseSnapshots = await Promise.all(
            responseQueries.map((q) => getDocs(q))
          );

          const availableSurveys = allSurveys.filter(
            (survey, index) => responseSnapshots[index].empty
          );

          setSurveyCounts((prevCounts) => ({
            ...prevCounts,
            available: availableSurveys.length,
          }));
        });
      } else {
        const q = query(
          collection(db, "SurveyResponses"),
          where("deviceUUID", "==", deviceUUID),
          where("status", "==", status)
        );
        return onSnapshot(q, (querySnapshot) => {
          setSurveyCounts((prevCounts) => ({
            ...prevCounts,
            [status]: querySnapshot.size,
          }));
        });
      }
    };
    // Create real-time listeners for each status
    const availableListener = createCountListener("available");
    const pendingListener = createCountListener("pending");
    const completedListener = createCountListener("completed");

    // Clean up the listeners when the component unmounts
    return () => {
      availableListener();
      pendingListener();
      completedListener();
    };
  }, [deviceUUID]);

  useEffect(() => {
    let unsubscribeAvailableSurveys;
    let unsubscribeSurveys;
    const fetchAvailableSurveys = () => {
      const surveyQuery = query(collection(db, "Surveys"));
      return onSnapshot(surveyQuery, async (surveySnapshot) => {
        const allSurveys = surveySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const responseQueries = allSurveys.map((survey) =>
          query(
            collection(db, "SurveyResponses"),
            where("deviceUUID", "==", deviceUUID),
            where("surveyId", "==", survey.id),
            where("status", "in", ["pending", "completed"])
          )
        );

        const responseSnapshots = await Promise.all(
          responseQueries.map((q) => getDocs(q))
        );

        const availableSurveys = allSurveys.filter(
          (survey, index) => responseSnapshots[index].empty
        );

        setSurveys(availableSurveys);
      });
    };

    const fetchSurveys = async () => {
      const responsesQuery = query(
        collection(db, "SurveyResponses"),
        where("deviceUUID", "==", deviceUUID),
        where("status", "==", "pending")
      );

      const responseSnapshot = await getDocs(responsesQuery);
      const pendingSurveysData = await Promise.all(
        responseSnapshot.docs.map(async (responseDoc) => {
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
    };

    unsubscribeAvailableSurveys = fetchAvailableSurveys();
    unsubscribeSurveys = fetchSurveys();

    return () => {
      if (typeof unsubscribeAvailableSurveys === "function") {
        unsubscribeAvailableSurveys();
      }
      if (typeof unsubscribeSurveys === "function") {
        unsubscribeSurveys();
      }
    };
  }, [deviceUUID, surveyCounts]);

  return (
    <SurveyContext.Provider
      value={{
        notiCount,
        surveys,
        pendingSurveys,
        isRefreshing,
        surveyCounts,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurveyContext = () => useContext(SurveyContext);
