import { useNavigation } from "@react-navigation/native";
import React, { RefObject } from "react";
import { StyleSheet, useColorScheme } from "react-native";
import Colors from "../constants/Colors";
import { useFavoritedCoves } from "@discove/ui/useFavoritedCoves";
import { useFavoriteCove } from "@discove/ui/useFavoriteCove";
import { CoveWithFavorites, FeedItem } from "@discove/util/types";
import { Icon } from "./Icon";
import { PressableRaw } from "./Pressable";
import { Text } from "./Text";
import { View } from "./View";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { TouchableHighlight } from "./TouchableHighlight";
import { usePostHog } from "posthog-react-native";

export function CoveItem(props: {
  authedUserFcAddress?: string;
  item: CoveWithFavorites;
  listRef: RefObject<FlashList<FeedItem> | null>;
}) {
  const navigation = useNavigation<any>();
  const { favoriteCove } = useFavoriteCove();

  const { favoritedCoves, revalidate } = useFavoritedCoves();
  const isFavorited = favoritedCoves.find(
    (c) =>
      c.username === props.item.username && c.feedname === props.item.feedname
  );
  const colorScheme = useColorScheme();
  const posthog = usePostHog();
  return (
    <View
      style={{
        backgroundColor:
          colorScheme === "dark"
            ? Colors.dark.background
            : Colors.light.background,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor:
          colorScheme === "dark"
            ? Colors.dark.borderColor
            : Colors.light.borderColor,
        paddingHorizontal: 20,
        paddingVertical: 12,
        display: "flex",
        maxWidth: "100%",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 20,
      }}
    >
      <View
        style={{
          display: "flex",
          backgroundColor:
            colorScheme === "dark"
              ? Colors.dark.background
              : Colors.light.background,
          alignItems: "center",
          gap: 5,
          justifyContent: "flex-start",
        }}
      >
        <PressableRaw
          onPress={() => {
            Haptics.selectionAsync();
            posthog?.capture("favorite_cove");

            favoriteCove(
              props.item.config.t ??
                `@${props.item.username}/${props.item.feedname}`,
              props.item.username,
              props.item.feedname,
              !!isFavorited
            );
          }}
        >
          <Icon
            name={isFavorited ? "star-filled" : "star"}
            size={24}
            color="gold"
          />
        </PressableRaw>
        <Text>{props.item.favorites}</Text>
      </View>
      <TouchableHighlight
        style={{
          marginRight: 10,
          flex: 1,
          maxWidth: 300,
        }}
        key={`${props.item.username}/${props.item.feedname}`}
        onPress={() =>
          navigation.navigate("Home", {
            screen: "NamedFeed",
            params: {
              username: props.item.username,
              feedname: props.item.feedname,
            },
          })
        }
      >
        <View
          style={{
            flex: 1,
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <Text
              numberOfLines={2}
              style={{ fontFamily: "SF-Pro-Rounded-Regular", fontSize: 17 }}
            >
              {props.item.config.t}
            </Text>
          </View>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "SF-Pro-Rounded-Regular",
              fontSize: 17,
              color: "gray",
            }}
          >
            @{props.item.username}/{props.item.feedname}
          </Text>
          {props.item.config.d ? (
            <Text
              numberOfLines={3}
              style={{
                marginTop: 10,
                color: "gray",
                display: props.item.config.d === "" ? "none" : "flex",
              }}
            >
              {props.item.config.d}
            </Text>
          ) : null}
        </View>
      </TouchableHighlight>
    </View>
  );
}
