import { Alert, Button, Linking, StyleSheet, View } from "react-native";
import { Text } from "../components/Text";
import { supabaseClient } from "../lib/supabase";
import * as Application from "expo-application";
import { Pressable } from "../components/Pressable";
import Colors from "../constants/Colors";
import { HomeTabScreenProps } from "../navigation/navigation-types";
import { Sentry } from "../lib/sentry";
import * as Updates from "expo-updates";
import { getAppIcon, setAppIcon } from "expo-dynamic-app-icon";
import { Image } from "expo-image";
import { useState } from "react";

const iconFarcaster = require("../assets/images/icon-fc.png");
const iconDiscove = require("../assets/images/icon.png");

export default function SettingsScreen(props: HomeTabScreenProps<"Settings">) {
  function deleteAccount() {
    Alert.alert(
      "Are you sure you want to permanently delete your Discove account?",
      "",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Permanently delete account",
          onPress: async () => {
            await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}/api/user/delete`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            });

            supabaseClient.auth.signOut();
          },
          style: "destructive",
        },
      ],
      {
        cancelable: true,
        onDismiss: () =>
          Alert.alert(
            "This alert was dismissed by tapping outside of the alert dialog."
          ),
      }
    );
  }
  const [forceUpdate, setForceUpdate] = useState(0);
  const isFarcasterIcon = getAppIcon() === "farcaster";

  return (
    <View style={styles.container}>
      <View>
        <Pressable
          onPress={() => Linking.openURL("tg://davidfurlong")}
          textStyle={{
            color: "white",
          }}
          style={{
            backgroundColor: Colors.indigo["600"],
            borderColor: Colors.indigo["500"],
          }}
        >
          Give me the gift of Discove Feedback 💜
        </Pressable>
        <View
          style={{
            flexDirection: "row",
            display: "flex",
            alignItems: "center",
            marginVertical: 20,
            gap: 10,
          }}
        >
          <Pressable
            variant="ghost"
            style={{ paddingHorizontal: 4, opacity: 0.5 }}
            onPress={() => {
              Linking.openURL("mailto:help@discove.app").catch((error) => {
                console.log(error);
              });
            }}
          >
            <Text>Contact</Text>
          </Pressable>
          <Pressable
            variant="ghost"
            style={{ paddingHorizontal: 4, opacity: 0.5 }}
            onPress={() => {
              deleteAccount();
            }}
          >
            <Text>Delete account</Text>
          </Pressable>

          <Pressable
            variant="ghost"
            style={{ paddingHorizontal: 4, opacity: 0.5 }}
            onPress={() => {
              Linking.openURL("https://www.discove.xyz/privacy-policy").catch(
                (error) => {
                  console.log(error);
                }
              );
            }}
          >
            <Text>Privacy policy</Text>
          </Pressable>
          <Pressable
            variant="ghost"
            style={{ paddingHorizontal: 4, opacity: 0.5 }}
            onPress={async () => {
              await supabaseClient.auth.signOut();
              Sentry.setUser(null);
            }}
          >
            <Text>Logout</Text>
          </Pressable>
        </View>
        <View>
          <Text>App icon</Text>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              margin: 0,
              marginTop: 10,
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Pressable
                variant="ghost"
                style={{
                  borderRadius: 10,
                  margin: 0,
                  paddingVertical: 3,
                  paddingTop: 5,
                  paddingBottom: 0,
                  paddingHorizontal: 3,
                  borderWidth: 2,
                  borderColor: !isFarcasterIcon
                    ? Colors.indigo["300"]
                    : "transparent",
                }}
                onPress={() => {
                  alert(`Switched! It may take a couple hours to change`);
                  if (isFarcasterIcon) setAppIcon("discove");
                  else setAppIcon("farcaster");

                  setForceUpdate(forceUpdate + 1);
                }}
              >
                <Image
                  source={iconDiscove}
                  style={{
                    width: 100,
                    padding: 10,
                    height: 100,
                    borderRadius: 10,
                  }}
                />
              </Pressable>
              <Text>discove</Text>
            </View>
            <View
              style={{
                display: "flex",
                marginLeft: 10,
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Pressable
                variant="ghost"
                style={{
                  borderRadius: 10,
                  margin: 0,
                  paddingVertical: 3,
                  paddingTop: 5,
                  paddingBottom: 0,
                  paddingHorizontal: 3,
                  borderWidth: 2,
                  borderColor: isFarcasterIcon
                    ? Colors.indigo["300"]
                    : "transparent",
                }}
                onPress={() => {
                  alert(`Switched! It may take a couple hours to change`);
                  if (getAppIcon() === "farcaster") setAppIcon("discove");
                  else setAppIcon("farcaster");

                  setForceUpdate(forceUpdate + 1);
                }}
              >
                <Image
                  source={iconFarcaster}
                  style={{
                    width: 100,
                    borderRadius: 10,

                    margin: 0,
                    height: 100,
                  }}
                />
              </Pressable>
              <Text>classic</Text>
            </View>
          </View>
        </View>
      </View>
      <View>
        <Text>Discove</Text>
        <Text>
          Build v{Application.nativeApplicationVersion} 🏗️ {Updates.updateId}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginVertical: 20,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: "SF-Pro-Rounded-Semibold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
