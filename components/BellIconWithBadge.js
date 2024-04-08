import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const BellIconWithBadge = ({ count, navigation, notifications }) => {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("Notifications", { notifications })}
      style={styles.container}
    >
      <View>
        <AntDesign name="bells" size={24} color="black" />
        {count > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{count}</Text>
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
