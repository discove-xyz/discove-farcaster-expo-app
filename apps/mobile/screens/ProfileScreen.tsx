import React, { useEffect } from "react";
import { useSWR } from "@discove/ui/useSwr";
import { RoutedFeed } from "../components/Feed";
import { normalizeFeedQuery } from "@discove/util/params";
import { API } from "@discove/util/types";
import { HomeTabScreenProps } from "../navigation/navigation-types";
import { View } from "../components/View";
import Colors from "../constants/Colors";
import { FCProfile, RenderPlugin } from "@discove/util/types";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import { useNavigation } from "@react-navigation/native";
import { HomeTabNavigationProps } from "../navigation/navigation-types";
import { useFCProfileByFid } from "../hooks/useFCProfileByFid";
import * as Linking from "expo-linking";
import { Text } from "../components/Text";
import { Pressable, PressableRaw } from "../components/Pressable";
import { HStack } from "../components/Stack";
import { Image } from "../components/Image";
import { TouchableHighlight } from "../components/TouchableHighlight";
import { Icon } from "../components/Icon";
import RenderPlugins from "../components/RenderPlugins";
import { FormatText } from "../components/FormatText";
import { useFarcasterIdentity } from "@discove/ui/useFarcasterIdentity";
import { useUserProfileInteractions } from "@discove/ui/useUserCastInteractions";
import { useRelativeDate } from "@discove/ui/useRelativeDate";
import { MoreButton } from "../components/ProfileItem";
import { Dimensions, ScrollView, StyleSheet } from "react-native";

const Tab = createMaterialTopTabNavigator();

/** pass either username or fid as a param, if fid, will load the username and add username param **/
export default function ProfileScreen(props: HomeTabScreenProps<"Profile">) {
  const { route, navigation } = props;
  const username = route?.params?.username;

  /** Support fid param for deep linking **/
  const fid = route?.params?.fid ? Number(route?.params?.fid) : undefined;
  const profile = useFCProfileByFid(fid);

  useEffect(() => {
    if (!username && fid && profile) {
      navigation.setParams({
        username: profile.username ?? undefined,
        fid: undefined,
      });
    }
  }, [fid, profile, username, navigation]);

  const { data } = useSWR<API["/api/profiles/:username"]["GET"]>(
    username ? `/api/profiles/${username}` : null
  );

  useEffect(() => {
    if (!(route?.params?.q || "").includes(`(from:${username})`)) {
      navigation.setParams({
        ...normalizeFeedQuery({
          ...route.params,
          q: `(from:${username})`,
        }),
      });
    }
  }, [route.params, username, navigation]);

  useEffect(() => {
    navigation.setOptions({
      // headerLargeTitle: true,

      // headerTitle: () =>
      //   data?.profile ? (
      //     <ProfileItemOnProfilePage
      //       profile={data?.profile}
      //       showTheirFeedButton
      //     />
      //   ) : (
      //     ""
      //   ),
      headerRight: () =>
        data?.profile ? (
          <>
            <MoreButton profile={data?.profile} />
            <PressableRaw
              style={{ padding: 8 }}
              onPress={() => props.navigation.navigate("Settings", {})}
            >
              <Icon name="settings" size={24} />
            </PressableRaw>
          </>
        ) : null,
    });
  }, [data?.profile, navigation, props.navigation]);

  if (!data) return null;

  return (
    <View style={{ flex: 1 }}>
      <ProfileItemOnProfilePage profile={data?.profile} showTheirFeedButton />
      <Tab.Navigator
        initialRouteName="Hot"
        initialLayout={{
          width: Dimensions.get("window").width,
        }}
      >
        <Tab.Screen
          name="Hot"
          initialParams={{ a: "hot", q: `(from:${data.profile.username})` }}
          component={RoutedFeed}
          options={{
            tabBarLabelStyle: {
              fontSize: 15,
              fontFamily: "SF-Pro-Rounded-Semibold",
            },
            tabBarLabel: "Hot",
          }}
        />
        <Tab.Screen
          name="New"
          initialParams={{ a: "new", q: `(from:${data.profile.username})` }}
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
          initialParams={{
            a: "top",
            s: "alltime",
            q: `(from:${data.profile.username})`,
          }}
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
    </View>
  );
}

function ProfileItemOnProfilePage(props: {
  authedUserFcAddress?: string;
  profile: FCProfile;
  q?: string;
  borderBottom?: boolean;
  plugins?: RenderPlugin[];
  showTheirFeedButton?: boolean;
}) {
  const { fid } = useFarcasterIdentity();
  const { isFollowedBy, isFollowing, follow, isMuted } =
    useUserProfileInteractions(Number(props.profile.fid));
  const navigation = useNavigation<HomeTabNavigationProps>();
  const lastActive = useRelativeDate(
    props.profile.custom_metrics?.last_known_active
      ? new Date(props.profile.custom_metrics?.last_known_active)
      : null
  );

  if (isMuted) {
    return (
      <View>
        <Text>
          You have muted @{props.profile?.username}, so their profile is hidden
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        paddingBottom: 8,
        marginHorizontal: 20,
        gap: 4,
      }}
    >
      <HStack
        style={{
          alignItems: "center",
          marginVertical: 4,
          justifyContent: "space-between",
        }}
      >
        <TouchableHighlight
          onPress={() => {
            navigation.navigate("FullScreenImageModal", {
              imageUrl: props.profile.avatar_url!,
            });
          }}
        >
          <Image
            type="profile"
            key={props.profile.avatar_url}
            source={{ uri: props.profile.avatar_url || "" }}
            width={64}
            height={64}
            style={{ borderRadius: 64, height: 64, width: 64 }}
          />
        </TouchableHighlight>
        {Number(props.profile.fid) === Number(fid) ? null : (
          <View>
            <Pressable
              style={{ flexGrow: 0, borderWidth: StyleSheet.hairlineWidth }}
              size="md"
              _textLight={{
                color: isFollowing ? Colors.black : Colors.white,
              }}
              _textDark={{
                color: isFollowing ? Colors.black : Colors.white,
              }}
              _light={{
                backgroundColor: isFollowing
                  ? Colors.blackAlpha["500"]
                  : Colors.indigo["600"],
              }}
              _dark={{
                backgroundColor: isFollowing
                  ? Colors.whiteAlpha["200"]
                  : Colors.indigo["600"],
              }}
              // _textDark={isFollowing ? "transparent" : Colors.indigo["600"]}
              onPress={() => {
                Linking.openURL(`farcaster://profiles/${props.profile.fid}`);
              }}
            >
              {isFollowing ? "Following" : "Follow"}
            </Pressable>
          </View>
        )}

        {/** No space for this on mobile **/}
        {/* {props.showTheirFeedButton ? (
            <Pressable
              size="sm"
              onPress={() => {
                navigation.navigate("RoutedFeed", {e
                  u: props.profile.username,
                });
              }}
            >
              View their feed
            </Pressable>
          ) : null} */}
      </HStack>
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          flexShrink: 1,
          gap: 6,
        }}
      >
        <TouchableHighlight
          onPress={() => {
            navigation.navigate("Profile", {
              username: props.profile.username!,
            });
          }}
        >
          <Text
            style={{
              fontSize: 24,
              // paddingVertical: 12,
              fontFamily: "SF-Pro-Rounded-Semibold",
            }}
          >
            {props.profile.display_name}
          </Text>
        </TouchableHighlight>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            flexShrink: 1,
            gap: 6,
          }}
        >
          <Text
            lightColor={Colors.light.slightlyMutedText}
            darkColor={Colors.dark.slightlyMutedText}
          >
            @{props.profile.username}{" "}
          </Text>
          {isFollowedBy ? (
            <View
              style={{ paddingHorizontal: 2, paddingVertical: 1 }}
              _dark={{ backgroundColor: Colors.whiteAlpha["100"] }}
              _light={{ backgroundColor: Colors.blackAlpha["100"] }}
            >
              <Text
                style={{ fontSize: 14 }}
                lightColor={Colors.gray["700"]}
                darkColor={Colors.gray["200"]}
              >
                Follows you
              </Text>
            </View>
          ) : null}
        </View>
        <View style={{ marginTop: 8 }}>
          <FormatText text={props.profile.bio || ""} q={props.q} />
        </View>
        <View style={{ display: "flex", flexDirection: "row" }}>
          <TouchableHighlight
            onPress={() => {
              navigation.navigate("RoutedFeed", {
                u: props.profile.username!,
                type: "profile",
              });
            }}
          >
            <Text>
              <Text style={{ fontFamily: "SF-Pro-Rounded-Semibold" }}>
                {props.profile.following}
              </Text>{" "}
              <Text
                lightColor={Colors.light.slightlyMutedText}
                darkColor={Colors.dark.slightlyMutedText}
              >
                following
              </Text>
            </Text>
          </TouchableHighlight>
          <Text>{" · "}</Text>
          <TouchableHighlight
            onPress={() => {
              navigation.navigate("RoutedFeed", {
                h: "1",
                t: `Followers of @${props.profile.username}`,
                sql: `select * from profiles where fid in (select follower_fid from following where following_fid=${props.profile.fid}) order by custom_metrics->'new' desc`,
                type: "profile",
              });
            }}
          >
            <Text>
              <Text style={{ fontFamily: "SF-Pro-Rounded-Semibold" }}>
                {props.profile.followers}
              </Text>{" "}
              <Text
                lightColor={Colors.light.slightlyMutedText}
                darkColor={Colors.dark.slightlyMutedText}
              >
                followers
              </Text>
            </Text>
          </TouchableHighlight>
          <Text>{" · "}</Text>
          <TouchableHighlight
            onPress={() => {
              navigation.navigate("Profile", {
                username: props.profile.username!,
              });
            }}
          >
            <Text>
              <Text style={{ fontFamily: "SF-Pro-Rounded-Semibold" }}>
                {props.profile.custom_metrics?.total_casts}
              </Text>{" "}
              <Text
                lightColor={Colors.light.slightlyMutedText}
                darkColor={Colors.dark.slightlyMutedText}
              >
                cast
                {props.profile.custom_metrics?.total_casts !== 1 ? "s" : ""}
              </Text>
            </Text>
          </TouchableHighlight>
        </View>
        {lastActive ? (
          <Text
            lightColor={Colors.light.mutedText}
            darkColor={Colors.dark.mutedText}
          >
            Last active {lastActive}
          </Text>
        ) : null}

        {props.plugins && (
          <RenderPlugins
            text={props.profile.bio ?? ""}
            type={"profile"}
            item={props.profile}
            q={props.q}
            plugins={props.plugins}
          />
        )}
      </View>
    </View>
  );
}
