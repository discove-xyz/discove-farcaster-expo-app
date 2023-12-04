import "react-native-gesture-handler";

import { useContext, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import useColorScheme from "./hooks/useColorScheme";
import {
  AuthedButNoSignerNavigator,
  AuthedNavigator,
  NoAuthNavigation,
} from "./navigation";
import * as Sentry from "sentry-expo";
import {
  SessionContext,
  SessionContextProvider,
} from "./contexts/SessionContext";
import { FavoriteContextProvider } from "@discove/ui/FavoriteContext";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FarcasterIdentityContextProvider } from "@discove/ui/FarcasterIdentityContext";
import { ErrorBoundary } from "@sentry/react-native";
import FallbackComponent from "./components/ErrorFallback";
import { useFarcasterIdentity } from "@discove/ui/useFarcasterIdentity";
import { UpdatesAvailableModal } from "./components/UpdatesAvailableModal";
import * as SplashScreen from "expo-splash-screen";
import { preload, SWRConfig } from "swr";
import { AppState } from "react-native";
import { unauthedFetcher } from "@discove/ui/useSwr";
// import { AppState } from "react-native";
// import { SWRConfig, preload } from "swr";
import type { Cache } from "swr";
import { MMKV } from "react-native-mmkv";
import { AppSharedProvider } from "@discove/ui/AppShared";
import { config } from "./lib/config";
import { supabaseClient } from "./lib/supabase";

const mmkv = new MMKV();

const cacheProvider = (cache: Cache) => {
  const swrCache: Cache = {
    keys: new Set([...cache.keys(), ...mmkv.getAllKeys()]).keys,
    get: (key: string) => {
      const valueFromMap = cache.get(key);

      if (valueFromMap) {
        return valueFromMap;
      }

      if (typeof key === "string" && mmkv.contains(key)) {
        const value = mmkv.getString(key);
        return value ? JSON.parse(value) : undefined;
      }

      return undefined;
    },
    set: (key: string, value) => {
      cache.set(key, value);

      if (typeof key === "string") {
        mmkv.set(key, JSON.stringify(value));
      }
    },
    delete: (key: string) => {
      cache.delete(key);

      if (typeof key === "string" && mmkv.contains(key)) {
        mmkv.delete(key);
      }
    },
  };

  return swrCache;
};
// // import { ActionSheetProvider } from "@expo/react-native-action-sheet";

// use Sentry.Native.captureException(error); from @sentry/react-native

SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: "https://389b7a88c5054beaa7285a8c7738181c@o4504084014563328.ingest.sentry.io/4504084017381376",
  enableInExpoDevelopment: true,
  debug: false, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
});

export default function App() {
  return (
    <AppSharedProvider
      apiUrl={config.apiUrl}
      supabaseClient={supabaseClient}
      sentry={Sentry.Native}
    >
      <SWRConfig
        value={{
          provider: cacheProvider,
          isVisible: () => {
            return true;
          },
          initFocus(callback) {
            let appState = AppState.currentState;
            const fetcher = (urlOrPath: string, options: RequestInit = {}) =>
              unauthedFetcher(config.apiUrl, urlOrPath, options);

            const onAppStateChange = (nextAppState: any) => {
              /* If it's resuming from background or inactive mode to active one */
              if (
                appState.match(/inactive|background/) &&
                nextAppState === "active"
              ) {
                preload("/api/feeds", fetcher);
                preload("/api/feeds?a=new", fetcher);
                preload("/api/feeds?a=top&s=24h", fetcher);

                callback();
              }
              appState = nextAppState;
            };

            // Subscribe to the app state change events
            const subscription = AppState.addEventListener(
              "change",
              onAppStateChange
            );

            return () => {
              subscription.remove();
            };
          },
        }}
      >
        <ErrorBoundary fallback={FallbackComponent}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SessionContextProvider>
              <FavoriteContextProvider>
                <FarcasterIdentityContextProvider>
                  <SafeAreaProvider>
                    <ConditionalAuthNavigator />
                  </SafeAreaProvider>
                </FarcasterIdentityContextProvider>
              </FavoriteContextProvider>
            </SessionContextProvider>
          </GestureHandlerRootView>
        </ErrorBoundary>
      </SWRConfig>
    </AppSharedProvider>
  );
}

function ConditionalAuthNavigator() {
  const colorScheme = useColorScheme();
  const { session } = useContext(SessionContext);
  const { has_signed, isLoading } = useFarcasterIdentity();
  const [fontsLoaded] = useFonts({
    "tabler-icons": require("./assets/fonts/tabler-icons.ttf"),
    // 'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
    "Inter-Bold": require("./assets/fonts/Inter-Bold.ttf"),
    "SF-Pro-Rounded-Regular": require("./assets/fonts/SF-Pro-Rounded-Regular.otf"),
    "SF-Pro-Rounded-Semibold": require("./assets/fonts/SF-Pro-Rounded-Semibold.otf"),
  });

  useEffect(() => {
    async function f() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    }

    f();
  }, [fontsLoaded]);

  const ActiveNav =
    session?.user && has_signed
      ? AuthedNavigator
      : session?.user
      ? AuthedButNoSignerNavigator
      : isLoading
      ? null
      : NoAuthNavigation;

  if (!ActiveNav || !fontsLoaded) return null;

  return (
    <>
      {fontsLoaded && <UpdatesAvailableModal />}
      <ActiveNav colorScheme={colorScheme} />
    </>
  );
}
