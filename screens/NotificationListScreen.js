import React from "react";
import { View, Text } from "react-native";

const NotificationListScreen = ({ notifications }) => {
  return (
    <View>
      <Text>List of Notifications:</Text>
      {notifications.map((notification, index) => (
        <Text key={index}>{notification}</Text>
      ))}
    </View>
  );
};

export default NotificationListScreen;
