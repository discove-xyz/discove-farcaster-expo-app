import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect } from "react";
import { View } from "react-native";
import { HomeTabNavigationProps } from "../navigation/navigation-types";
import { useUserFarcasterProfile } from "@discove/ui/useUserFarcasterProfile";
import {
  feedQueryToFeedQueryWithAllKeysUsingUndefinedFallback,
  normalizeFeedQuery,
} from "@discove/util/params";
import { FeedQuery } from "@discove/util/types";
import { Icon } from "./Icon";
import { Image } from "./Image";
import { Pressable } from "./Pressable";
import { SortHeader } from "./SortHeader";
import { Text } from "./Text";
import { TouchableHighlight } from "./TouchableHighlight";

export function determineHeaderMode(
  params: FeedQuery | undefined = {}
): "filters" | "home" {
  const numParams = Object.values(normalizeFeedQuery(params || {})).length;

  if (
    numParams !== 0 &&
    !(numParams === 1 && params.a) &&
    !(numParams === 2 && params.a && params.s === "24h")
  ) {
    return "filters";
  }

  return "home";
}

export function RoutedFeedHeaderLeft(props: any) {
  const route = useRoute();
  const navigation = useNavigation<HomeTabNavigationProps>();

  const params = (route.params as any) ?? {};
  const userProfile = useUserFarcasterProfile();
  const numParams = Object.values(normalizeFeedQuery(params)).length;
  const hasCustomFilters =
    numParams !== 0 &&
    !(numParams === 1 && params.a) &&
    !(numParams === 2 && params.a === "top" && params.s === "24h");

  if (hasCustomFilters) {
    return (
      <Pressable
        style={{ backgroundColor: "transparent" }}
        size="sm"
        onPress={() => {
          navigation.navigate(
            "RoutedFeed",
            feedQueryToFeedQueryWithAllKeysUsingUndefinedFallback({})
          );
        }}
      >
        <Icon name="x" size={24} />
      </Pressable>
    );
  }

  return (
    <>
      <TouchableHighlight
        onPress={() => {
          props.navigation.navigate("Root", {
            screen: "Home",
            params: {
              screen: "Profile",
              params: {
                username: userProfile?.username ?? undefined,
              },
            },
          });
        }}
      >
        <Image
          type="profile"
          key={userProfile?.avatar_url}
          source={{ uri: userProfile?.avatar_url || "" }}
          width={32}
          height={32}
          style={{ borderRadius: 24, width: 32, height: 32 }}
        />
      </TouchableHighlight>
    </>
  );
}
