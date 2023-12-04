import { useNavigation, useRoute } from "@react-navigation/native";
import React, { FC } from "react";
import { useColorScheme } from "react-native";
import Colors from "../constants/Colors";
import {
  HomeTabNavigationProps,
  RoutedFeedScreenRouteProp,
} from "../navigation/navigation-types";
import { feedQueryToFeedQueryWithAllKeysUsingUndefinedFallback } from "@discove/util/params";
import { defaultFeedQueryValues } from "@discove/util/types";
import { Text } from "./Text";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { usePostHog } from "posthog-react-native";

export const SelectableText = (props: {
  isSelected?: boolean;
  children: string;
}) => {
  const scheme = useColorScheme() ?? "light";
  return (
    <Text
      style={{
        color: Colors[scheme].text,
      }}
    >
      {props.children}
    </Text>
  );
};

const sortOptions = ["hot", "new", "top"];

export function SortHeader() {
  const posthog = usePostHog();
  const navigation = useNavigation<HomeTabNavigationProps>();
  const route = useRoute<RoutedFeedScreenRouteProp>();
  let currentlySelectedAlgo = route.params?.a || defaultFeedQueryValues.a;
  return (
    // @ts-ignore
    <SegmentedControl
      style={{ height: 30, width: 200 }}
      values={sortOptions}
      selectedIndex={sortOptions.indexOf(currentlySelectedAlgo)}
      onChange={(event: any) => {
        const value = sortOptions[event.nativeEvent.selectedSegmentIndex];
        if (value === "top") {
          posthog?.capture("feed_sort_by_top");
          navigation.navigate(
            "RoutedFeed",
            feedQueryToFeedQueryWithAllKeysUsingUndefinedFallback({
              a: "top",
              s: "24h",
            })
          );
        } else {
          posthog?.capture("feed_sort_by_" + value);
          navigation.navigate(
            "RoutedFeed",
            feedQueryToFeedQueryWithAllKeysUsingUndefinedFallback({
              a: value,
            })
          );
        }
      }}
    />
  );
}
