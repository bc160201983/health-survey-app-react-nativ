import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

const RadioButton = ({ selectedOption, onSelect, options }) => {
  return (
    <View style={styles.container}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={styles.optionContainer}
          onPress={() => onSelect(option)}
        >
          <View style={styles.circle}>
            {selectedOption === option && <View style={styles.checkedCircle} />}
          </View>
          <Text style={styles.text}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default RadioButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
  },
  optionContainer: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  circle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ACACAC",
    alignItems: "center",
    justifyContent: "center",
  },
  checkedCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#794F9B",
  },
  text: {
    marginLeft: 10,
  },
});
