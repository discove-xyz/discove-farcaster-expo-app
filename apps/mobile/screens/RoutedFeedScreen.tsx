import { RoutedFeed } from "../components/Feed";
import { HomeTabScreenProps } from "../navigation/navigation-types";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo } from "react";
import { Dimensions, View } from "react-native";
import { HomeTabNavigationProps } from "../navigation/navigation-types";
import { useUserFarcasterProfile } from "@discove/ui/useUserFarcasterProfile";
import {
  feedQueryToFeedQueryWithAllKeysUsingUndefinedFallback,
  normalizeFeedQuery,
} from "@discove/util/params";
import { FeedQuery } from "@discove/util/types";
import { Icon } from "../components/Icon";
import { Image } from "../components/Image";
import { Pressable } from "../components/Pressable";
import { Text } from "../components/Text";
import { TouchableHighlight } from "../components/TouchableHighlight";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { FloatingCastButton } from "../components/FloatingCastButton";
import { shortenText } from "@discove/util/text";
import Colors from "../constants/Colors";

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

const Tab = createMaterialTopTabNavigator();

export default function RoutedFeedScreen(
  props: HomeTabScreenProps<"RoutedFeed">
) {
  const route = useRoute();
  const navigation = useNavigation<HomeTabNavigationProps>();
  const params = useMemo(() => (route.params as any) ?? {}, [route.params]);
  const numParams = Object.values(normalizeFeedQuery(params)).length;
  const hasCustomFilters =
    numParams !== 0 &&
    !(numParams === 1 && params.a) &&
    !(numParams === 2 && params.a === "top" && params.s === "24h");
  let text = "";
  if (hasCustomFilters) {
    text = `${numParams} filter${numParams > 1 ? "s" : ""} applied`;
  }
  if (params.q) {
    text = shortenText(params.q, 25);
  }

  const headerMode = determineHeaderMode(params);

  useEffect(() => {
    if (headerMode === "filters")
      navigation.setOptions({
        headerShadowVisible: true,
        headerTitle: () => (
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ fontFamily: "SF-Pro-Rounded-Semibold" }}>
              {text}
            </Text>
            <Pressable
              size="md"
              variant="solid"
              color="white"
              style={{ marginLeft: 12, backgroundColor: Colors.indigo["600"] }}
              onPress={() => {
                navigation.navigate("SaveCoveForm", {
                  ...params,
                });
              }}
            >
              Save Cove
            </Pressable>
          </View>
        ),
      });
    else
      navigation.setOptions({
        headerShadowVisible: false,
        headerTitle: "",
      });
  }, [headerMode, navigation, text, params]);

  return (
    <>
      <FloatingCastButton />
      {headerMode === "filters" ? (
        <RoutedFeed />
      ) : (
        <Tab.Navigator
          initialRouteName="Hot"
          initialLayout={{
            width: Dimensions.get("window").width,
          }}
        >
          <Tab.Screen
            name="Hot"
            initialParams={{ a: "hot" }}
            component={RoutedFeed}
            options={{
              tabBarLabelStyle: {
                fontSize: 15,
                fontFamily: "SF-Pro-Rounded-Semibold",
              },
              tabBarLabel: "Hot",
              // tabBarStyle: {
              //   borderBottomWidth: 1,
              //   borderBottomColor: Colors.light.borderColor,
              // },
            }}
          />
          <Tab.Screen
            name="New"
            initialParams={{ a: "new" }}
            component={RoutedFeed}
            options={{
              tabBarLabel: "New",
              tabBarLabelStyle: {
                fontSize: 15,
                fontFamily: "SF-Pro-Rounded-Semibold",
              },
            }}
          />
          <Tab.Screen
            name="Top"
            initialParams={{ a: "top", s: "24h" }}
            component={RoutedFeed}
            options={{
              tabBarLabel: "Top",
              tabBarLabelStyle: {
                fontSize: 15,
                fontFamily: "SF-Pro-Rounded-Semibold",
              },
            }}
          />
        </Tab.Navigator>
      )}
    </>
  );
}
