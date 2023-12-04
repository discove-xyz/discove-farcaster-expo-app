import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Icon } from "./Icon";
import Colors from "../constants/Colors";
import { View } from "./View";
import { usePostHog } from "posthog-react-native";
import * as Haptics from "expo-haptics";
import { Pressable } from "./Pressable";

export function FloatingCastButton() {
  const navigation = useNavigation();
  const posthog = usePostHog();

  return (
    <View
      style={{
        zIndex: 99,
        alignItems: "center",
        justifyContent: "center",
        // width: 70,
        position: "absolute",
        display: "flex",
        bottom: 10,
        right: 10,
        width: 64,
        height: 64,
        // height: 70,
        borderRadius: 100,
      }}
    >
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();

          posthog?.capture("floating_cast_button_pressed");
          navigation.navigate("Root", {
            screen: "Home",
            params: {
              screen: "NewCastModal",
              params: {},
            },
          });
        }}
        style={{
          borderWidth: 1,
          backgroundColor: Colors.indigo["600"],
          borderColor: Colors.indigo["500"],
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 100,
        }}
      >
        <Icon name="plus" size={30} color="white" />
      </Pressable>
    </View>
  );
}
