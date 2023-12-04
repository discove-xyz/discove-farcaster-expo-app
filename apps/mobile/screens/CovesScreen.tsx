import { RefreshControl, View, StyleSheet } from "react-native";
import { H1, Text } from "../components/Text";
import { useFavoritedCoves } from "@discove/ui/useFavoritedCoves";
import { MainBottomTabScreenProps } from "../navigation/navigation-types";
import { TouchableHighlight } from "../components/TouchableHighlight";
import React, { useRef, useState } from "react";
import useColorScheme from "../hooks/useColorScheme";
import Colors from "../constants/Colors";
import { Pressable, PressableRaw } from "../components/Pressable";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { usePostHog } from "posthog-react-native";
import { useScrollToTop } from "@react-navigation/native";
import { Icon } from "../components/Icon";
import { useCoveNotifications } from "@discove/ui/useCoveNotifications";
import { CoveFavorite } from "@discove/util/types";
import { useFavoriteCove } from "@discove/ui/useFavoriteCove";

export default function CovesScreen({
  navigation,
}: MainBottomTabScreenProps<"Coves">) {
  const posthog = usePostHog();
  const { favoritedCoves, revalidate } = useFavoritedCoves();
  const colorScheme = useColorScheme();
  const [isValidating, setIsValidating] = useState(false);
  const { data } = useCoveNotifications();
  const ref = useRef<FlashList<any>>(null);

  // on home tab press, this will make sure that it scrolls to the top of the feed automatically.
  useScrollToTop(ref as any);

  return (
    <View style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <FlashList
        ref={ref}
        estimatedItemSize={100}
        ListHeaderComponent={
          <View
            style={{
              height: 150,
              paddingTop: 50,
              display: "flex",
              alignItems: "flex-end",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <H1 style={{ marginLeft: 12 }}>Favorited Coves</H1>
            <PressableRaw
              style={{ padding: 8, marginRight: 8 }}
              onPress={() =>
                navigation.navigate("Root", {
                  screen: "Home",
                  params: {
                    screen: "Bookmarks",
                    params: {},
                  },
                })
              }
            >
              <Icon name="bookmark" size={28} />
            </PressableRaw>
          </View>
        }
        refreshControl={
          <RefreshControl
            //refresh control used for the Pull to Refresh
            refreshing={isValidating}
            onRefresh={async () => {
              Haptics.selectionAsync();
              setIsValidating(true);
              await revalidate();
              setIsValidating(false);
            }}
          />
        }
        keyExtractor={(item: any) => `${item.username}/${item.feedname}`}
        data={favoritedCoves}
        renderItem={({ item }: { item: CoveFavorite }) => {
          const unreadNotifications =
            data?.find(
              (x) =>
                x.username === item.username && x.feedname === item.feedname
            )?.unread_count ?? 0;

          return (
            <TouchableHighlight
              onPress={() =>
                navigation.navigate("Home", {
                  screen: "NamedFeed",
                  params: {
                    // screen: "",
                    username: item.username,
                    feedname: item.feedname,
                  },
                })
              }
            >
              <View
                key={`${item.username}/${item.feedname}`}
                style={{
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor:
                    colorScheme === "dark"
                      ? Colors.dark.borderColor
                      : Colors.light.borderColor,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Icon name={"star-filled"} size={24} color="gold" />

                <Text
                  style={{ fontFamily: "SF-Pro-Rounded-Regular", fontSize: 17 }}
                >
                  {item.title}
                </Text>
                {unreadNotifications > 0 ? (
                  <Text>({unreadNotifications})</Text>
                ) : null}
              </View>
            </TouchableHighlight>
          );
        }}
      />
      <View style={{ paddingBottom: 12 }}>
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 12,
          }}
        >
          <Pressable
            onPress={() => {
              posthog?.capture("discover_community_coves_press");
              navigation.navigate("Home", {
                screen: "NamedFeed",
                params: {
                  // screen: "",
                  username: "df",
                  feedname: "new",
                },
              });
            }}
            size="lg"
            textStyle={{
              color: "white",
            }}
            style={{
              backgroundColor: Colors.indigo["600"],
              borderColor: Colors.indigo["500"],
            }}
          >
            Discover Coves
          </Pressable>
        </View>
        <View
          style={{
            // borderBottomWidth: StyleSheet.hairlineWidth,
            // borderBottomColor:
            //   colorScheme === 'dark'
            //     ? Colors.dark.borderColor
            //     : Colors.light.borderColor,
            paddingHorizontal: 12,
            paddingVertical: 12,
            paddingTop: 6,
          }}
        >
          <Pressable
            size="lg"
            onPress={() => {
              posthog?.capture("create_cove_press");
              navigation.navigate("Home", {
                screen: "FiltersModal",
                params: {},
              });
            }}
          >
            Create a Cove
          </Pressable>
        </View>
      </View>
    </View>
  );
}
