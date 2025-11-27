import React, { useState, useEffect } from "react";
import App from "./App";
import NetInfo from "@react-native-community/netinfo";
import CustomModal from "./components/Modal";
// import messaging from "@react-native-firebase/messaging";

export default function Setup() {
  const [connected, setConnected] = useState(true);

  // useEffect(() => {
  //   requestUserPermission();
  // }, []);

  // async function requestUserPermission() {
  //   const authStatus = await messaging().requestPermission();
  //   const enabled =
  //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  //   if (enabled) {
  //     // console.log("Authorization status:", authStatus);
  //   }
  // }
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        setConnected(true);
      } else {
        setConnected(false);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <React.Fragment>
      <App />
      <CustomModal
        isLoading={!connected}
        onRequestCloseCallback={() => {}}
        message="Trying to connect to the network..."
      />
    </React.Fragment>
  );
}
