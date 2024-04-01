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
      }
    };

    if (deviceUUID && surveyId) {
      fetchExistingAnswers();
    }
  }, [deviceUUID, surveyId]);

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

  const handleAnswer = (option) => {
    const question = questions[currentQuestionIndex];
    const questionId = question.questionId; // Use questionId instead of id

    if (typeof questionId === "undefined") {
      console.error("Question ID is undefined for current question", question);
      return;
    }
    // Determine if an answer for this question already exists
    const existingAnswerIndex = answers.findIndex(
      (answer) => answer.questionId === questionId
    );

    if (existingAnswerIndex !== -1) {
      // Update existing answer
      const updatedAnswers = [...answers];
      updatedAnswers[existingAnswerIndex].selectedOptions = [option]; // Replace with new option since only one can be selected
      setAnswers(updatedAnswers);
    } else {
      // Add a new answer
      const newAnswer = {
        questionId,
        selectedOptions: [option],
      };
      setAnswers((prevAnswers) => [...prevAnswers, newAnswer]);
    }
  };

  const saveSurveyResponses = async () => {
    // Debug: Log the data you're about to save
    console.log("Saving survey responses with data:", {
      answers,
      deviceUUID,
      surveyId,
    });

    // Ensure all data is defined and valid
    if (
      !deviceUUID ||
      !surveyId ||
      !Array.isArray(answers) ||
      answers.length === 0
    ) {
      console.error("Attempting to save invalid data", {
        deviceUUID,
        surveyId,
        answers,
      });
      Alert.alert("Error", "Cannot save responses due to invalid data.");
      return;
    }

    // Ensure each answer is valid
    for (const answer of answers) {
      if (
        typeof answer.questionId === "undefined" ||
        !Array.isArray(answer.selectedOptions) ||
        answer.selectedOptions.length === 0
      ) {
        console.error("Invalid answer found", answer);
        Alert.alert(
          "Error",
          "Cannot save responses due to invalid answer data."
        );
        return;
      }
    }

    // Data seems valid; proceed to save
    const surveyResponsesData = {
      answers,
      deviceUUID,
      surveyId,
      timestamp: new Date(),
      status: "completed", // Update status to 'completed'
    };

    try {
      await setDoc(
        doc(db, "SurveyResponses", `${deviceUUID}_${surveyId}`),
        surveyResponsesData,
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
    const currentAnswer =
      answers.find((answer) => answer.questionId === question.questionId)
        ?.selectedOptions[0] || "";

    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionTitle}>{question.question}</Text>
        <RadioButton
          options={question.options}
          selectedOption={currentAnswer}
          onSelect={(option) => handleAnswer(option)}
        />
      </View>
    );
  };

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers.find(
      (answer) => answer.questionId === currentQuestion.questionId
    );

    if (!currentAnswer || currentAnswer.selectedOptions.length === 0) {
      Alert.alert(
        "Please select an option",
        "You must select an option before proceeding to the next question."
      );
      return;
    }

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
