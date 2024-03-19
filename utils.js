import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";

export const getDeviceUUID = async () => {
  let deviceUUID = await SecureStore.getItemAsync("deviceUUID");
  if (!deviceUUID) {
    deviceUUID = Crypto.randomUUID();
    await SecureStore.setItemAsync("deviceUUID", deviceUUID);
  }
  return deviceUUID;
};
