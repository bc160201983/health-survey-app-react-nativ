import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Button,
  Alert,
} from "react-native";
import db from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import RadioButton from "../components/RadioButton";
import { useDeviceUUID } from "../context";

const Survey = ({ route, navigation }) => {
  const { surveyId, questions, surveyTitle } = route.params;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const { deviceUUID } = useDeviceUUID();
  const responseId = `${deviceUUID}_${surveyId}`; // Consistent responseId across the component

  useEffect(() => {
    const fetchExistingAnswers = async () => {
      const responseRef = doc(db, "SurveyResponses", responseId);
      const docSnap = await getDoc(responseRef);
      if (docSnap.exists()) {
        setAnswers(docSnap.data().answers || []);
      } else {
        console.log("No existing answers or new survey session");
        setAnswers({}); // Initialize with an empty object
      }
    };

    if (responseId) {
      fetchExistingAnswers();
    }
  }, [responseId]);

  const handleAnswerUpdate = async (questionId, updatedAnswer) => {
    const responseRef = responseId
      ? doc(db, "SurveyResponses", responseId)
      : doc(db, "SurveyResponses", `${deviceUUID}_${surveyId}`);
    const newAnswers = { ...answers, [questionId]: updatedAnswer };

    try {
      await setDoc(
        responseRef,
        { answers: newAnswers, deviceUUID, surveyId, timestamp: new Date() },
        { merge: true }
      );
      setAnswers(newAnswers);
    } catch (error) {
      console.error("Error updating survey answer: ", error);
    }
  };

  const handleAnswer = (questionId, option) => {
    if (!answers) {
      // If answers is undefined, initialize it with an empty array
      setAnswers([
        {
          questionId,
          selectedOptions: [option],
        },
      ]);
      return;
    }

    const existingAnswerIndex = answers.findIndex(
      (answer) => answer.questionId === questionId
    );

    if (existingAnswerIndex !== -1) {
      // Update the existing answer object
      const updatedAnswers = [...answers];
      updatedAnswers[existingAnswerIndex] = {
        questionId,
        selectedOptions: [
          ...updatedAnswers[existingAnswerIndex].selectedOptions,
          option,
        ],
      };
      setAnswers(updatedAnswers);
    } else {
      // Add a new answer object
      const newAnswer = {
        questionId,
        selectedOptions: [option],
      };
      setAnswers([...answers, newAnswer]);
    }
  };
  const saveSurveyResponses = async () => {
    try {
      await setDoc(
        doc(db, "SurveyResponses", responseId),
        { answers, deviceUUID, surveyId, timestamp: new Date() },
        { merge: true }
      );
      Alert.alert("Success", "Survey responses saved successfully.");
    } catch (error) {
      console.error("Error saving survey responses: ", error);
      Alert.alert("Error", "Failed to save your responses. Please try again.");
    }
  };

  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionTitle}>{question.question}</Text>
        <RadioButton
          options={question.options}
          selectedOption={answers[question.id]}
          onSelect={(option) => handleAnswer(question.id, option)}
        />
      </View>
    );
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      saveSurveyResponses().then(() => {
        navigation.navigate("FinishScreen");
      });
    }
  };
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const renderProgressBar = () => {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    return (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.surveyTitle}>{surveyTitle}</Text>
      {renderProgressBar()}
      {questions && questions.length > 0 && renderQuestion()}
      <View style={styles.buttonContainer}>
        {currentQuestionIndex > 0 && (
          <Button title="Back" onPress={handlePreviousQuestion} />
        )}
        <Button
          title={
            currentQuestionIndex < questions.length - 1 ? "Next" : "Finish"
          }
          onPress={handleNextQuestion}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  surveyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10, // Adjusted for spacing
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 20,
    width: "100%",
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginVertical: 20,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "blue",
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default Survey;
