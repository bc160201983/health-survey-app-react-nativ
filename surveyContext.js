// SurveyContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

import db from "./firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useDeviceUUID } from "./context";
import { Alert } from "react-native";

const SurveyContext = createContext();

export const SurveyProvider = ({ children }) => {
  const [surveys, setSurveys] = useState([]);
  const [pendingSurveys, setPendingSurveys] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { deviceUUID } = useDeviceUUID();

  const [surveyCounts, setSurveyCounts] = useState({
    available: 0,
    pending: 0,
    completed: 0,
  });

  const fetchAvailableSurveys = async () => {
    try {
      const surveySnapshot = await getDocs(collection(db, "Surveys"));
      const allSurveys = surveySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const completedResponsesSnapshot = await getDocs(
        query(
          collection(db, "SurveyResponses"),
          where("deviceUUID", "==", deviceUUID),
          where("status", "==", "completed")
        )
      );

      const completedSurveyIds = completedResponsesSnapshot.docs.map(
        (doc) => doc.data().surveyId
      );

      const availableSurveys = allSurveys.filter(
        (survey) => !completedSurveyIds.includes(survey.id)
      );

      setSurveys(availableSurveys);
    } catch (error) {
      console.error("Error fetching surveys:", error);
      throw error;
    }
  };
  useEffect(() => {
    // Firestore collection references
    const surveysCollectionRef = collection(db, "Surveys");
    const surveyResponsesCollectionRef = collection(db, "SurveyResponses");

    // Function to create a real-time listener for count by status
    const createCountListener = (status) => {
      if (status === "available") {
        const q = query(surveysCollectionRef, where("status", "==", status));
        return onSnapshot(q, (querySnapshot) => {
          setSurveyCounts((prevCounts) => ({
            ...prevCounts,
            available: querySnapshot.size,
          }));
        });
      } else {
        const q = query(
          surveyResponsesCollectionRef,
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

  const fetchSurveys = async () => {
    setIsRefreshing(true); // Set refreshing to true when fetching starts

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
    fetchAvailableSurveys();
    fetchSurveys();
  }, [deviceUUID]);

  const handleRefresh = () => {
    fetchAvailableSurveys();
    fetchSurveys();
  };

  return (
    <SurveyContext.Provider
      value={{
        surveys,
        pendingSurveys,
        isRefreshing,
        fetchAvailableSurveys,
        fetchSurveys,
        handleRefresh,
        surveyCounts,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurveyContext = () => useContext(SurveyContext);
