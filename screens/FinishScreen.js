// FinishScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

const FinishScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const handleReturnHome = () => {
    setLoading(true);
    // Navigate back to the home screen or survey list
    navigation.popToTop();
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thank You!</Text>
      <Text style={styles.description}>
        We appreciate your time spent taking our survey. Your response has been
        recorded.
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" animating={loading} />
      ) : (
        <Button title="Return Home" onPress={handleReturnHome} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
});

export default FinishScreen;
