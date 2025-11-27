import LayoutSlice from "./Reducers/LayoutSlice";
import ThemeCustomizerSlice from "./Reducers/ThemeCustomizerSlice";
import BookmarkTabSlice from "./Reducers/BookmarkTabSlice";
import ToDoSlice from "./Reducers/ToDoSlice";

//Thyrio Code
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

import notesSlice from "./features/notes/notesSlice";
import { apiSlice } from "./features/api/apiSlice";
import authSlice from "./features/auth/authSlice";
import goalSlice from "./features/goals/goalSlice";
import sidebarSlice from "./features/sidebar/sidebarSlice";
import DocumentSlice from "./features/document/DocumentSlice";
import moodSlice from "./features/mood/moodSlice";

const createNoopStorage = () => ({
  getItem: () => Promise.resolve(null),
  setItem: (_key, value) => Promise.resolve(value),
  removeItem: () => Promise.resolve(),
});

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  auth: authSlice,
  goal: goalSlice,
  mood: moodSlice,
  sidebar: sidebarSlice,
  documents: DocumentSlice,
  notes: notesSlice,
  //Theme Reducers
  layout: LayoutSlice,
  themeCustomizer: ThemeCustomizerSlice,
  bookmarkTab: BookmarkTabSlice,
  todo: ToDoSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(apiSlice.middleware),
  });

  const persistor = typeof window !== "undefined" ? persistStore(store) : null;

  return { store, persistor };
};
