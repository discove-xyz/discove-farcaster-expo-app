import { useNavigation } from "@react-navigation/native";
import React, { RefObject } from "react";
import { Alert, LayoutChangeEvent, Share, StyleSheet } from "react-native";
import { mutate } from "swr";
import Colors from "../constants/Colors";
import { useUser } from "../contexts/SessionContext";
import useColorScheme from "../hooks/useColorScheme";
import { Sentry } from "../lib/sentry";
import { supabaseClient } from "../lib/supabase";
import { useRelativeDate } from "@discove/ui/useRelativeDate";
import {
  useUserCastInteractions,
  useUserProfileInteractions,
} from "@discove/ui/useUserCastInteractions";
import { FCCast, FeedItem, RenderPlugin } from "@discove/util/types";
import { FormatText } from "./FormatText";
import { Icon } from "./Icon";
import { Image } from "./Image";
import RenderPlugins from "./RenderPlugins";
import { Text } from "./Text";
import { TouchableHighlight } from "./TouchableHighlight";
import { View } from "./View";
import * as Haptics from "expo-haptics";
import { FlashList } from "@shopify/flash-list";

const CastActionButton = (props: {
  iconName: string;
  iconColor?: string;
  text?: string;
  onPress: () => void;
}) => (
  // Hitslop isn't working here. Because the background is pressable too? We use padding instead.
  <TouchableHighlight
    style={{ paddingVertical: 4, paddingHorizontal: 8 }}
    onPress={props.onPress}
  >
    <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
      <Icon
        name={props.iconName}
        size={20}
        darkColor={props.iconColor ?? Colors.dark.mutedText}
        lightColor={props.iconColor ?? Colors.light.mutedText}
      />
      {props.text && (
        <Text
          style={{ minWidth: 10 }}
          darkColor={Colors.dark.mutedText}
          lightColor={Colors.light.mutedText}
        >
          {props.text}
        </Text>
      )}
    </View>
  </TouchableHighlight>
);

export const CommentButton = (props: { cast: FCCast }) => {
  const navigation = useNavigation();
  return (
    <CastActionButton
      iconName="message-circle-2"
      text={
        props.cast.replies && props.cast.replies !== 0
          ? String(props.cast.replies)
          : undefined
      }
      onPress={() => {
        Haptics.selectionAsync();

        navigation.navigate("Root", {
          screen: "Home",
          params: {
            screen: "NewCastModal",
            params: {
              replyToCast: props.cast,
            },
          },
        });
      }}
    />
  );
};

export const BookmarkButton = (props: {
  cast: Pick<FCCast, "hash" | "author_fid">;
}) => {
  const { hasBookmarked, bookmark } = useUserCastInteractions(
    props.cast.hash,
    Number(props.cast.author_fid)
  );
  return (
    <CastActionButton
      iconName={"bookmark"}
      iconColor={hasBookmarked ? "purple" : undefined}
      text={undefined}
      onPress={async () => {
        try {
          Haptics.selectionAsync();

          await bookmark();
        } catch (err) {
          console.log(err);
          alert(err);
        }
      }}
    />
  );
};

export const RecastButton = (props: {
  cast: Pick<FCCast, "hash" | "author_fid" | "recasts">;
}) => {
  const { hasRecast, recast } = useUserCastInteractions(
    props.cast.hash,
    Number(props.cast.author_fid)
  );
  const sum = Number(props.cast.recasts) + (hasRecast ? 1 : 0);
  return (
    <CastActionButton
      iconName="refresh"
      iconColor={hasRecast ? "green" : undefined}
      text={sum !== 0 ? String(sum) : undefined}
      onPress={async () => {
        try {
          Haptics.selectionAsync();

          await recast();
        } catch (err) {
          console.log(err);
          alert(err);
        }
      }}
    />
  );
};

export const LikeButton = (props: {
  cast: Pick<FCCast, "hash" | "author_fid" | "reactions">;
}) => {
  const { hasLiked, like } = useUserCastInteractions(
    props.cast.hash,
    Number(props.cast.author_fid)
  );
  const sum = Number(props.cast.reactions) + (hasLiked ? 1 : 0);
  return (
    <CastActionButton
      iconName={hasLiked ? "heart-filled" : "heart"}
      iconColor={hasLiked ? "red" : undefined}
      text={sum !== 0 ? String(sum) : " "}
      onPress={async () => {
        try {
          Haptics.selectionAsync();
          await like();
        } catch (err) {
          console.log(err);
          alert(err);
        }
      }}
    />
  );
};

export const MoreButton = (props: {
  cast: Pick<FCCast, "hash" | "author_fid">;
}) => {
  const user = useUser();

  if (!user) return null;

  return (
    <View>
      <Text
        onPress={async () => {
          try {
            Alert.alert(
              "Cast Actions",
              "",
              [
                {
                  text: "Close menu",
                  onPress: () => {},
                  style: "cancel",
                },
                {
                  text: "Report Cast",
                  onPress: async () => {
                    const { error } = await supabaseClient
                      .from("cast_reports")
                      .insert({
                        reported_by_user_id: user.id,
                        reported_cast_hash: props.cast.hash,
                      });

                    if (error) {
                      Sentry.captureException(error);
                      Alert.alert("An unknown error occurred");
                    }
                  },
                  style: "destructive",
                },
                {
                  text: "Mute user",
                  onPress: async () => {
                    const { error } = await supabaseClient
                      .from("muted_users")
                      .insert({
                        muted_by_user_id: user.id,
                        muted_user_fid: props.cast.author_fid,
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
        <Icon
          name="dots-vertical"
          size={16}
          darkColor={Colors.dark.mutedText}
          lightColor={Colors.light.mutedText}
        />
      </Text>
    </View>
  );
};

export const ShareButton = (props: { cast: Pick<FCCast, "hash" | "text"> }) => {
  return (
    <CastActionButton
      iconName="upload"
      onPress={async () => {
        try {
          Haptics.selectionAsync();

          const result = await Share.share({
            message: props.cast.text,
            url: `https://www.discove.xyz/casts/${props.cast.hash}`,
          });
          if (result.action === Share.sharedAction) {
            if (result.activityType) {
              // shared with activity type of result.activityType
            } else {
              // shared
            }
          } else if (result.action === Share.dismissedAction) {
            // dismissed
          }
        } catch (error: any) {
          Alert.alert(error.message);
        }
      }}
    />
  );
};

export function VerticalLine() {
  return (
    <View
      style={{
        position: "absolute",
        zIndex: 0,
        height: "100%",
        top: 20,
        width: 10,
        left: 43,
      }}
    >
      <View
        style={{
          borderLeftWidth: StyleSheet.hairlineWidth,
          height: "100%",
          zIndex: 1,
          position: "relative",
          left: 0,
          width: StyleSheet.hairlineWidth,
        }}
        _dark={{
          borderColor: Colors.dark.borderColor,
        }}
        _light={{
          borderColor: Colors.light.borderColor,
        }}
      />
    </View>
  );
}

export const CastItem = (props: {
  cast: FCCast;
  plugins?: RenderPlugin[];
  isThreadPage?: boolean;
  verticalLines?: boolean;
  listRef?: RefObject<FlashList<FeedItem> | null>;
  fullPageMode?: boolean;
  itemOnLayout?: ((event: LayoutChangeEvent) => void) | undefined;
  hideReplyTo?: boolean;
  noBorderBottom?: boolean;
  q?: string;
}) => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const { isMuted } = useUserProfileInteractions(
    Number(props.cast?.author_fid)
  );
  const publishedAt = useRelativeDate(new Date(props.cast.published_at));
  if (!props.cast) return null;

  if (isMuted) {
    return (
      <View
        style={{
          padding: 20,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: props.noBorderBottom
            ? "transparent"
            : colorScheme === "dark"
            ? Colors.dark.borderColor
            : Colors.light.borderColor,
        }}
      >
        <Text>
          You have muted @{props.cast?.username}, so this Cast by them is hidden
        </Text>
      </View>
    );
  }

  // race condition on our indexer
  if (
    props.cast.text.startsWith("recast:farcaster://casts/") &&
    !props.cast.recast_data
  )
    return null;

  const WrapperComponent = props.isThreadPage ? View : TouchableHighlight;
  const wrapperComponentProps = props.isThreadPage
    ? {}
    : {
        onPress: () => {
          navigation.navigate("Root", {
            screen: "Home",
            params: {
              screen: "Thread",
              params: {
                castHash: props.cast.hash,
                threadHash: props.cast.thread_hash,
              },
            },
          });
        },
      };

  return (
    <View
      style={{
        position: "relative",
        maxWidth: "100%",
      }}
      onLayout={props.itemOnLayout}
    >
      {props.cast.reply_parent_hash &&
      props.cast.reply_to_data &&
      !props.hideReplyTo &&
      props.fullPageMode ? (
        <View style={{ position: "relative" }}>
          <VerticalLine />
          <CastItem
            cast={props.cast.reply_to_data}
            noBorderBottom
            listRef={props.listRef}
          />
        </View>
      ) : null}
      <View>
        {props.cast.reply_parent_hash &&
        props.cast.reply_to_data &&
        !props.hideReplyTo &&
        !props.fullPageMode ? (
          <TouchableHighlight
            onPress={() => {
              props.listRef?.current?.recordInteraction();
              navigation.navigate("Root", {
                screen: "Home",
                params: {
                  screen: "Thread",
                  params: {
                    threadHash: props.cast.thread_hash,
                    castHash: props.cast.hash,
                  },
                },
              });
            }}
          >
            <View>
              <VerticalLine />
              <CastItem
                listRef={props.listRef}
                cast={props.cast.reply_to_data}
                noBorderBottom
                hideReplyTo
              />
            </View>
          </TouchableHighlight>
        ) : null}
        <WrapperComponent {...wrapperComponentProps}>
          <View>
            <View
              style={{
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: props.noBorderBottom
                  ? "transparent"
                  : colorScheme === "dark"
                  ? Colors.dark.borderColor
                  : Colors.light.borderColor,
                padding: 8,
              }}
            >
              <View style={{ display: "flex", flexDirection: "row" }}>
                {!(props.cast.is_recast && props.cast.recast_data) ? (
                  <View
                    style={{
                      position: "relative",
                      paddingRight: 8,
                      paddingLeft: 12,
                      paddingTop: 3,
                    }}
                  >
                    <TouchableHighlight
                      onPress={() => {
                        props.listRef?.current?.recordInteraction();
                        navigation.navigate("Root", {
                          screen: "Home",
                          params: {
                            screen: "Profile",
                            params: {
                              username: props.cast?.username ?? undefined,
                            },
                          },
                        });
                      }}
                    >
                      <Image
                        type="profile"
                        width={48}
                        height={48}
                        key={props.cast.avatar_url}
                        style={{
                          borderRadius: 24,
                          width: 48,
                          height: 48,
                        }}
                        source={{ uri: props.cast.avatar_url || "" }}
                      />
                    </TouchableHighlight>
                  </View>
                ) : null}
                <View style={{ flexGrow: 1, flex: 1, paddingRight: 8 }}>
                  <Text>
                    {!(props.cast.is_recast && props.cast.recast_data) ? (
                      <Text
                        onPress={() => {
                          props.listRef?.current?.recordInteraction();
                          navigation.navigate("Root", {
                            screen: "Home",
                            params: {
                              screen: "Profile",
                              params: {
                                username: props.cast?.username ?? undefined,
                              },
                            },
                          });
                        }}
                        style={{ fontFamily: "Inter-Bold", lineHeight: 20 }}
                      >
                        {props.cast.display_name || ""}
                      </Text>
                    ) : null}{" "}
                    {!(props.cast.is_recast && props.cast.recast_data) ? (
                      <Text
                        darkColor={Colors.dark.mutedText}
                        lightColor={Colors.light.mutedText}
                        onPress={() => {
                          navigation.navigate("Root", {
                            screen: "Home",
                            params: {
                              screen: "Profile",
                              params: {
                                username: props.cast.username ?? undefined,
                              },
                            },
                          });
                        }}
                      >
                        @{props.cast.username}
                      </Text>
                    ) : null}
                    {props.cast.is_recast && props.cast.recast_data && (
                      <Text>
                        <Icon name="refresh" size={16} /> Recast by{" "}
                        <Text
                          onPress={() => {
                            props.listRef?.current?.recordInteraction();
                            navigation.navigate("Root", {
                              screen: "Home",
                              params: {
                                screen: "Profile",
                                params: {
                                  username: props.cast.username ?? undefined,
                                },
                              },
                            });
                          }}
                        >
                          @{props.cast.display_name}
                        </Text>{" "}
                      </Text>
                    )}
                    {/* {props.cast.reply_parent_hash &&
                    props.cast.reply_to_data &&
                    !props.fullPageMode ? (
                      <Text>
                        {" "}
                        replying to @{props.cast.reply_to_data.username}
                      </Text>
                    ) : null} */}
                    {!(props.cast.is_recast && props.cast.recast_data) ? (
                      <Text
                        darkColor={Colors.dark.mutedText}
                        lightColor={Colors.light.mutedText}
                      >
                        {" "}
                        · {publishedAt}
                      </Text>
                    ) : null}
                  </Text>
                  <View>
                    {props.cast.text.startsWith("recast:farcaster://casts/") &&
                    props.cast.recast_data ? (
                      <CastItem
                        cast={props.cast.recast_data}
                        noBorderBottom
                        listRef={props.listRef}
                      />
                    ) : (
                      <FormatText text={props.cast.text} q={props.q} />
                    )}
                  </View>
                  {props.plugins && (
                    <RenderPlugins
                      text={props.cast.text}
                      type={"cast"}
                      item={props.cast}
                      q={props.q}
                      plugins={props.plugins}
                    />
                  )}
                  {!(props.cast.is_recast && props.cast.recast_data) ? (
                    <View
                      style={{
                        display: "flex",
                        maxWidth: "100%",
                        marginTop: 8,
                        marginLeft: -8,
                        justifyContent: "space-between",
                        flexDirection: "row",
                      }}
                    >
                      <CommentButton cast={props.cast} />
                      <RecastButton cast={props.cast} />
                      <LikeButton cast={props.cast} />
                      <BookmarkButton cast={props.cast} />
                      <ShareButton cast={props.cast} />
                    </View>
                  ) : null}
                </View>
                {!(props.cast.is_recast && props.cast.recast_data) ? (
                  <MoreButton cast={props.cast} />
                ) : null}
              </View>
            </View>
            {/** Render cast replies */}
            {props.cast.reply_data ? (
              <View>
                {props.cast.reply_data.map((cast) => (
                  <CastItem
                    listRef={props.listRef}
                    cast={cast}
                    verticalLines={props.verticalLines}
                    fullPageMode={props.fullPageMode}
                    noBorderBottom={props.fullPageMode}
                    key={cast.hash}
                    hideReplyTo={props.fullPageMode || props.hideReplyTo}
                  />
                ))}
              </View>
            ) : null}
          </View>
        </WrapperComponent>
      </View>
    </View>
  );
};
