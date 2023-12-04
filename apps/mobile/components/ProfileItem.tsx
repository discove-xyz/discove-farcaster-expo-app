import * as Linking from "expo-linking";
import React, { RefObject } from "react";
import { FormatText } from "./FormatText";
import { FCProfile, FeedItem, RenderPlugin } from "@discove/util/types";
import { useRelativeDate } from "@discove/ui/useRelativeDate";
import { Alert, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { HomeTabNavigationProps } from "../navigation/navigation-types";
import { Text } from "./Text";
import { Pressable } from "./Pressable";
import { HStack } from "./Stack";
import { Image } from "./Image";
import { TouchableHighlight } from "./TouchableHighlight";
import Colors from "../constants/Colors";
import { useUserProfileInteractions } from "@discove/ui/useUserCastInteractions";
import { useFarcasterIdentity } from "@discove/ui/useFarcasterIdentity";
import { Icon } from "./Icon";
import RenderPlugins from "./RenderPlugins";
import { useUser } from "../contexts/SessionContext";
import { supabaseClient } from "../lib/supabase";
import { mutate } from "swr";
import { Sentry } from "../lib/sentry";
import { Share } from "react-native";
import { FlashList } from "@shopify/flash-list";

export const MoreButton = (props: { profile: FCProfile }) => {
  const user = useUser();

  if (!user) return null;

  return (
    <Text
      onPress={async () => {
        try {
          Alert.alert(
            "Profile Actions",
            "",
            [
              {
                text: "Close menu",
                onPress: () => {},
                style: "cancel",
              },
              {
                text: "Report Profile",
                onPress: async () => {
                  const { error } = await supabaseClient
                    .from("profile_reports")
                    .insert({
                      reported_by_user_id: user.id,
                      reported_user_fid: props.profile.fid,
                    });

                  if (error) {
                    Sentry.captureException(error);
                    Alert.alert("An unknown error occurred");
                  }
                },
                style: "destructive",
              },
              {
                text: "Share profile",
                onPress: async () => {
                  try {
                    const result = await Share.share({
                      url: `https://www.discove.xyz/@${props.profile.username}`,
                    });
                  } catch (err) {}
                },
              },
              {
                text: "Mute user",
                onPress: async () => {
                  const { error } = await supabaseClient
                    .from("muted_users")
                    .insert({
                      muted_by_user_id: user.id,
                      muted_user_fid: props.profile.fid,
                    });

                  if (error) {
                    Sentry.captureException(error);
                    Alert.alert("An unknown error occurred");
                  } else {
                    await mutate("/api/fc/interactions");
                  }
                },
                style: "destructive",
              },
            ],
            {
              cancelable: true,
              onDismiss: () => {},
            }
          );
        } catch (error: any) {
          Alert.alert(error.message);
        }
      }}
      darkColor={Colors.dark.mutedText}
      lightColor={Colors.light.mutedText}
    >
      <Icon name="dots-vertical" size={16} />
    </Text>
  );
};

export default function ProfileItem(props: {
  authedUserFcAddress?: string;
  profile: FCProfile;
  q?: string;
  listRef: RefObject<FlashList<FeedItem> | null>;
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
    <View style={{ display: "flex", flexDirection: "row", padding: 8 }}>
      <TouchableHighlight
        onPress={() => {
          props.listRef?.current?.recordInteraction();
          navigation.navigate("Profile", { username: props.profile.username! });
        }}
      >
        <Image
          type="profile"
          key={props.profile.avatar_url}
          source={{ uri: props.profile.avatar_url || "" }}
          width={48}
          height={48}
          style={{ borderRadius: 24, height: 48, width: 48 }}
        />
      </TouchableHighlight>
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          flexShrink: 1,
          paddingLeft: 8,
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableHighlight
            onPress={() => {
              props.listRef?.current?.recordInteraction();

              navigation.navigate("Profile", {
                username: props.profile.username!,
              });
            }}
          >
            <Text style={{ fontFamily: "Inter-Bold" }}>
              {props.profile.display_name}
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={() => {
              props.listRef?.current?.recordInteraction();
              navigation.navigate("Profile", {
                username: props.profile.username!,
              });
            }}
          >
            <Text> @{props.profile.username}</Text>
          </TouchableHighlight>
        </View>
        <HStack style={{ alignItems: "center", marginVertical: 4 }}>
          {Number(props.profile.fid) === Number(fid) ? null : (
            <Pressable
              size="sm"
              _light={{
                backgroundColor: isFollowing
                  ? Colors.blackAlpha["300"]
                  : Colors.indigo["600"],
              }}
              _dark={{
                backgroundColor: isFollowing
                  ? Colors.whiteAlpha["200"]
                  : Colors.indigo["600"],
              }}
              color="white"
              onPress={() => {
                Linking.openURL(`farcaster://profiles/${props.profile.fid}`);
              }}
            >
              {isFollowing ? "Following" : "Follow"}
            </Pressable>
          )}
          {isFollowedBy ? (
            <Text style={{ color: "green" }}>
              <Icon
                name="check"
                color="green"
                style={{
                  position: "relative",
                  top: 2,
                  marginRight: 8,
                }}
              />{" "}
              Follows you
            </Text>
          ) : null}
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
        <View>
          <FormatText text={props.profile.bio || ""} q={props.q} />
        </View>
        <View style={{ display: "flex", flexDirection: "row" }}>
          <TouchableHighlight
            onPress={() => {
              props.listRef?.current?.recordInteraction();
              navigation.navigate("RoutedFeed", {
                u: props.profile.username!,
                type: "profile",
              });
            }}
          >
            <Text>
              <Text style={{ fontFamily: "Inter-Bold" }}>
                {props.profile.following}
              </Text>{" "}
              following{" "}
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={() => {
              props.listRef?.current?.recordInteraction();
              navigation.navigate("RoutedFeed", {
                h: "1",
                t: `Followers of @${props.profile.username}`,
                sql: `select * from profiles where fid in (select follower_fid from following where following_fid=${props.profile.fid}) order by custom_metrics->'new' desc`,
                type: "profile",
              });
            }}
          >
            <Text>
              <Text style={{ fontFamily: "Inter-Bold" }}>
                {props.profile.followers}
              </Text>{" "}
              followers{" "}
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            onPress={() => {
              props.listRef?.current?.recordInteraction();
              navigation.navigate("Profile", {
                username: props.profile.username!,
              });
            }}
          >
            <Text>
              <Text style={{ fontFamily: "Inter-Bold" }}>
                {props.profile.custom_metrics?.total_casts}
              </Text>{" "}
              cast
              {props.profile.custom_metrics?.total_casts !== 1 ? "s" : ""}{" "}
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
      <MoreButton profile={props.profile} />
    </View>
  );
}
