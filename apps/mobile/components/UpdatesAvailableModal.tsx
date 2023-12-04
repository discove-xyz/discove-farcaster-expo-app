import React, { useRef } from "react";
import { useEffect, useState } from "react";
import {
  Button,
  Text,
  Modal,
  SafeAreaView,
  View,
  AppState,
} from "react-native";
import * as Updates from "expo-updates";
import Constants from "expo-constants";
import { Sentry } from "../lib/sentry";
import { Pressable } from "./Pressable";
import Colors from "../constants/Colors";

export const UpdatesAvailableModal = () => {
  const [hide, setHide] = useState<boolean>(false);
  const [hasExpoUpdate, setHasExpoUpdate] = useState<boolean>(false);
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        checkForUpdate();
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  async function checkForUpdate() {
    Updates.checkForUpdateAsync()
      .then(async (result) => {
        if (result && result.isAvailable) {
          // if an update is available, download it immediately
          Updates.fetchUpdateAsync()
            .then(() => {
              setHasExpoUpdate(true);
            })
            .catch(() => {
              setHasExpoUpdate(false);
            });
        } else {
          setHasExpoUpdate(false);
        }
      })
      .catch((err) => {
        setHasExpoUpdate(false);
      });
  }

  useEffect(() => {
    // the expo-updates library doesn't work in Expo Go
    if (Constants.appOwnership !== "expo") {
      // check for Expo updates
      checkForUpdate();
    }
  }, []);

  if (!hasExpoUpdate) return null;

  return (
    <Modal presentationStyle="pageSheet" animationType="slide" visible={!hide}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: Colors.dark.background }}
      >
        <View style={{ paddingVertical: 16 }}>
          <Text
            style={{
              textAlign: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: 20,
            }}
          >
            A new version is available
          </Text>
        </View>
        <View style={{ flex: 1, marginHorizontal: 16, marginTop: 32 }}>
          <View style={{ height: 40 }} />

          <Pressable
            size="lg"
            style={{ backgroundColor: Colors.indigo["700"] }}
            textStyle={{ color: "white" }}
            onPress={async () => {
              // restart the app to install the update
              try {
                await Updates.reloadAsync();
              } catch (err) {
                Sentry.captureException(err);
              }
            }}
          >
            Reload App Now
          </Pressable>
          <View style={{ height: 10 }} />
          <Button
            title="No Thanks"
            onPress={() => {
              setHide(true);
            }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};
