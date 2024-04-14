import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const DeviceUUIDContext = createContext("");

export const DeviceUUIDProvider = ({ children }) => {
  const [deviceUUID, setDeviceUUID] = useState("");

  useEffect(() => {
    const fetchUUID = async () => {
      try {
        let uuid = await AsyncStorage.getItem("deviceUUID");
        if (!uuid) {
          uuid = Crypto.randomUUID();
          await AsyncStorage.setItem("deviceUUID", uuid);
        }
        setDeviceUUID(uuid);
      } catch (error) {
        console.error("Error fetching or setting the device UUID:", error);
      }
    };
    fetchUUID();
  }, []);
  // console.log("context", deviceUUID);
  return (
    <DeviceUUIDContext.Provider value={{ deviceUUID }}>
      {children}
    </DeviceUUIDContext.Provider>
  );
};

export const useDeviceUUID = () => useContext(DeviceUUIDContext);
