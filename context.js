// DeviceUUIDProvider.js
import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

const DeviceUUIDContext = createContext("");

export const DeviceUUIDProvider = ({ children }) => {
  const [deviceUUID, setDeviceUUID] = useState("");

  useEffect(() => {
    const fetchUUID = async () => {
      try {
        let uuid = await SecureStore.getItemAsync("deviceUUID");
        if (!uuid) {
          uuid = Crypto.randomUUID();
          await SecureStore.setItemAsync("deviceUUID", uuid);
        }
        setDeviceUUID(uuid);
      } catch (error) {
        console.error("Error fetching or setting the device UUID:", error);
      }
    };
    fetchUUID();
  }, []);

  return (
    <DeviceUUIDContext.Provider value={{ deviceUUID }}>
      {children}
    </DeviceUUIDContext.Provider>
  );
};

export const useDeviceUUID = () => useContext(DeviceUUIDContext);
