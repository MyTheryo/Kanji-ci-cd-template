"use client";
import { Provider } from "react-redux";
import { useRef } from "react";
import { makeStore } from "../Redux/Store";
import { PersistGate } from "redux-persist/integration/react";

export function Providers({ children }) {
  const storeRef = useRef();

  if (!storeRef.current) {
    // Create the store and persistor instances the first time this renders
    const { store, persistor } = makeStore();
    storeRef.current = { store, persistor };
  }

  return (
    <Provider store={storeRef.current.store}>
      <PersistGate
        // loading={"Loading..."}
        persistor={storeRef.current.persistor}
      >
        {children}
      </PersistGate>
    </Provider>
  );
}
