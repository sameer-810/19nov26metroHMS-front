// MUST be the very first import — react-native-gesture-handler requires this
// at the top of the entry file for gestures to work reliably.
import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { registerRootComponent } from "expo";
import { ScrollView, Text } from "react-native";
import * as SplashScreen from "expo-splash-screen";

/*
 * Startup safety net. A release build that fails while loading App (a module that throws
 * on import) or with an uncaught error shows only a blank splash background, which tells
 * nobody anything. This catches both and prints the error on screen instead.
 */

type ErrorListener = (error: Error) => void;
const listeners = new Set<ErrorListener>();
let firstError: Error | null = null;

function report(error: unknown) {
  const err = error instanceof Error ? error : new Error(String(error));
  if (!firstError) firstError = err;
  listeners.forEach((listener) => listener(err));
}

type GlobalHandler = (error: Error, isFatal?: boolean) => void;
const errorUtils = (
  globalThis as {
    ErrorUtils?: {
      getGlobalHandler: () => GlobalHandler;
      setGlobalHandler: (handler: GlobalHandler) => void;
    };
  }
).ErrorUtils;
const defaultHandler = errorUtils?.getGlobalHandler();
errorUtils?.setGlobalHandler((error, isFatal) => {
  report(error);
  // A fatal error would close the app before anyone can read it; keep it open to show it.
  if (!isFatal) defaultHandler?.(error, isFatal);
});

let App: React.ComponentType | null = null;
try {
  // Loaded with require so an error thrown while importing App is caught here.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  App = require("./App").default as React.ComponentType;
} catch (error) {
  report(error);
}

function StartupError({ error }: { error: Error }) {
  useEffect(() => {
    void SplashScreen.hideAsync().catch(() => undefined);
  }, []);
  return React.createElement(
    ScrollView,
    {
      style: { flex: 1, backgroundColor: "#ffffff" },
      contentContainerStyle: { padding: 24, paddingTop: 64 },
    },
    React.createElement(
      Text,
      { style: { fontSize: 20, fontWeight: "600", color: "#b42318" } },
      "Metro Hospital could not start",
    ),
    React.createElement(
      Text,
      { style: { marginTop: 12, fontSize: 14, color: "#101828" } },
      String(error.message || error),
    ),
    React.createElement(
      Text,
      { style: { marginTop: 12, fontSize: 11, color: "#475467" } },
      error.stack?.split("\n").slice(0, 15).join("\n") ?? "",
    ),
  );
}

function Root() {
  const [error, setError] = useState<Error | null>(firstError);

  useEffect(() => {
    const listener: ErrorListener = (err) =>
      setError((current) => current ?? err);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  // firstError also covers an error raised between the first render and the listener attaching.
  const shown = error ?? firstError;
  if (shown || !App) {
    return React.createElement(StartupError, {
      error: shown ?? new Error("App failed to load"),
    });
  }
  return React.createElement(App);
}

registerRootComponent(Root);
