import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const Checkbox = ({ options, selectedOptions, onSelect }) => {
  const toggleSelection = (option) => {
    let newSelection;
    if (selectedOptions.includes(option)) {
      // If already selected, remove from selections
      newSelection = selectedOptions.filter((selected) => selected !== option);
    } else {
      // Otherwise, add to selections
      newSelection = [...selectedOptions, option];
    }
    onSelect(newSelection); // Update the state in the parent component
  };

  return (
    <View style={styles.container}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={styles.optionContainer}
          onPress={() => toggleSelection(option)}
        >
          <View style={styles.checkbox}>
            {selectedOptions.includes(option) && (
              <View style={styles.checked} />
            )}
          </View>
          <Text style={styles.text}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkbox: {
    height: 20,
    width: 20,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#ACACAC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checked: {
    width: 14,
    height: 14,
    backgroundColor: "#794F9B",
  },
  text: {
    fontSize: 16,
  },
});

export default Checkbox;
