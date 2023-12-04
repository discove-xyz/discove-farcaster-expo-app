import React from "react";
import { Image } from "./Image";
import {
  LikeNotificationType,
  MentionNotificationType,
  MixedNotification,
  RecastNotificationType,
  ReplyNotificationType,
} from "@discove/util/types";
import {
  BookmarkButton,
  CommentButton,
  LikeButton,
  RecastButton,
  ShareButton,
} from "./CastItem";
import { Icon } from "./Icon";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Text } from "./Text";
import { TouchableHighlight } from "./TouchableHighlight";
import Colors from "../constants/Colors";
import { useFarcasterIdentity } from "@discove/ui/useFarcasterIdentity";

function NotificationIcon(props: any) {
  return (
    <Icon
      {...props}
      size={24}
      style={{ paddingHorizontal: 4, ...(props.style || {}) }}
    />
  );
}

export function NotificationItem(props: { notification: MixedNotification }) {
  const navigation = useNavigation();
  const { username } = useFarcasterIdentity();

  switch (props.notification.type) {
    case "d-cove-subscription":
      return (
        <FCNotificationItemUI
          isUnseen={props.notification.is_unseen}
          icon={
            <NotificationIcon
              name="bell-ringing"
              style={{ marginTop: -10 }}
              color={Colors.green["500"]}
              boxSize={6}
            />
          }
          onPress={() => {
            navigation.navigate("Root", {
              screen: "Home",
              params: {
                screen: "NamedFeed",
                params: {
                  username: username!,
                  feedname: props.notification.feedname,
                },
              },
            });
          }}
          avatar={null}
          heading={
            <Text
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {props.notification.unread_count} new item
              {props.notification.unread_count > 1 ? "s" : ""} in the cove @
              {username}/{props.notification.feedname}
            </Text>
          }
        />
      );
    case "d-cove-favorite":
      return (
        <FCNotificationItemUI
          isUnseen={props.notification.is_unseen}
          icon={
            <NotificationIcon
              style={{ marginTop: -10 }}
              name="star-filled"
              color={Colors.yellow["500"]}
              boxSize={6}
            />
          }
          onPress={() => {
            navigation.navigate("Root", {
              screen: "Home",
              params: {
                screen: "NamedFeed",
                params: {
                  username: username!,
                  feedname: props.notification.feedname,
                },
              },
            });
          }}
          avatar={null}
          heading={
            <Text
              style={{
                marginTop: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {props.notification.users.length === 1
                ? `Someone favorited your cove @${username}/${props.notification.feedname}`
                : `${props.notification.users.length} people favorited your cove @${username}/${props.notification.feedname}`}
            </Text>
          }
        />
      );
    case "d-cast-mention":
      return (
        <FCNotificationItemUI
          icon={
            <NotificationIcon
              name="at"
              color={Colors.blue["500"]}
              boxSize={6}
            />
          }
          onPress={() => {
            navigation.navigate("Root", {
              screen: "Home",
              params: {
                screen: "Cast",
                params: {
                  castHash: (props.notification as MentionNotificationType)
                    .hash,
                },
              },
            });
          }}
          avatar={
            <FCNotificationItemAvatar
              username={
                props.notification.user.username ||
                String(props.notification.user.fid)
              }
              avatar={props.notification.user.avatar_url || ""}
            />
          }
          isUnseen={props.notification.is_unseen}
          heading={
            <Text
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* <TouchableHighlight
                onPress={() => {
                  navigation.navigate("Root", {
                    screen: "Home",
                    params: {
                      screen: "Profile",
                      params: {
                        username: props.notification.actor.username,
                      },
                    },
                  });
                }}
              > */}
              <Text style={{ fontWeight: "bold" }}>
                {props.notification.user.display_name}
              </Text>
              {/* </TouchableHighlight> */} mentioned you in a cast
            </Text>
          }
          text={props.notification.text}
          actions={
            <View
              style={{
                display: "flex",
                maxWidth: "100%",
                marginTop: 2,
                justifyContent: "space-between",
                flexDirection: "row",
              }}
            >
              <CommentButton
                cast={
                  {
                    hash: props.notification.hash,
                    text: props.notification.text,
                    recasts: 0,
                    reactions: 0,
                    avatar_url: props.notification.user.avatar_url,
                    username:
                      props.notification.user.username ||
                      props.notification.user.username,
                    author_fid:
                      props.notification.user.fid ||
                      props.notification.user.fid,
                    replies: 0,
                  } as any
                }
              />
              <RecastButton
                cast={{
                  hash: props.notification.hash,
                  recasts: 0,
                  author_fid: props.notification.user.fid,
                }}
              />
              <LikeButton
                cast={{
                  hash: props.notification.hash,
                  reactions: 0,
                  author_fid: props.notification.user.fid,
                }}
              />
              <BookmarkButton
                cast={{
                  hash: props.notification.hash,
                  author_fid: props.notification.user.fid,
                }}
              />
              <ShareButton
                cast={{
                  hash: props.notification.hash,
                  text: props.notification.text,
                }}
              />
            </View>
          }
        />
      );
    case "d-cast-reply":
      return (
        <FCNotificationItemUI
          isUnseen={props.notification.is_unseen}
          icon={
            <NotificationIcon
              name="message-circle-2-filled"
              color={Colors.blue["500"]}
              boxSize={6}
            />
          }
          onPress={() => {
            navigation.navigate("Root", {
              screen: "Home",
              params: {
                screen: "Cast",
                params: {
                  castHash: (props.notification as ReplyNotificationType).hash,
                },
              },
            });
          }}
          avatar={
            <FCNotificationItemAvatar
              username={props.notification.user.username || ""}
              avatar={props.notification.user.avatar_url || ""}
            />
          }
          heading={
            <Text
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* <TouchableHighlight
                onPress={() => {
                  navigation.navigate("Root", {
                    screen: "Home",
                    params: {
                      screen: "Profile",
                      params: {
                        username:
                          props.notification.actor.username ?? undefined,
                      },
                    },
                  });
                }}
              > */}
              <Text style={{ fontWeight: "bold" }}>
                {props.notification.user.display_name}
              </Text>
              {/* </TouchableHighlight> */} replied to your cast
            </Text>
          }
          text={props.notification.text}
          actions={
            <View
              style={{
                display: "flex",
                maxWidth: "100%",
                marginTop: 2,
                justifyContent: "space-between",
                flexDirection: "row",
              }}
            >
              <CommentButton
                cast={
                  {
                    hash: props.notification.hash,
                    text: props.notification.text,
                    recasts: 0,
                    avatar_url: props.notification.user.avatar_url,

                    reactions: 0,
                    username: props.notification.user.username,
                    author_fid: props.notification.user.fid,
                    replies: 0,
                  } as any
                }
              />
              <RecastButton
                cast={{
                  hash: props.notification.hash,
                  recasts: 0,
                  author_fid: props.notification.user.fid,
                }}
              />
              <LikeButton
                cast={{
                  hash: props.notification.hash,
                  reactions: 0,
                  author_fid: props.notification.user.fid,
                }}
              />
              <BookmarkButton
                cast={{
                  hash: props.notification.hash,
                  author_fid: props.notification.user.fid,
                }}
              />
              <ShareButton
                cast={{
                  hash: props.notification.hash,
                  text: props.notification.text,
                }}
              />
            </View>
          }
        />
      );
    case "d-follow":
      return (
        <FCNotificationItemUI
          isUnseen={props.notification.is_unseen}
          icon={
            <NotificationIcon
              name="user-plus"
              color={Colors.purple["500"]}
              boxSize={6}
            />
          }
          avatar={
            <View style={{ display: "flex", flexDirection: "row" }}>
              {props.notification.users.slice(0, 8).map((user, i) => (
                <FCNotificationItemAvatar
                  key={user.username || i}
                  isUnseen={user.is_unseen}
                  username={user.username || String(user.fid)}
                  avatar={user.avatar_url || ""}
                />
              ))}
            </View>
          }
          heading={
            props.notification.users.length === 1 ? (
              <Text>
                <Text style={{ fontWeight: "bold" }}>
                  {props.notification.users[0].username}
                </Text>{" "}
                started following you this week
              </Text>
            ) : (
              <Text>
                <Text style={{ fontWeight: "bold" }}>
                  {props.notification.users[0].username}
                </Text>{" "}
                and {props.notification.users.length - 1} other{" "}
                {props.notification.users.length - 1 === 1
                  ? "person"
                  : "people"}{" "}
                started following you this week
              </Text>
            )
          }
        />
      );
    case "d-recast":
      return (
        <FCNotificationItemUI
          icon={
            <NotificationIcon
              name="refresh"
              color={Colors.green["500"]}
              boxSize={6}
            />
          }
          isUnseen={props.notification.is_unseen}
          avatar={
            <View style={{ display: "flex", flexDirection: "row" }}>
              {props.notification.users.slice(0, 8).map((user, i) => (
                <FCNotificationItemAvatar
                  key={`recast--${
                    (props.notification as RecastNotificationType).hash
                  }--${user.username || i}`}
                  isUnseen={user.is_unseen}
                  username={user.username || String(user.fid)}
                  avatar={user.avatar_url || ""}
                />
              ))}
            </View>
          }
          heading={
            props.notification.users.length === 1 ? (
              <Text>
                <Text style={{ fontWeight: "bold" }}>
                  {props.notification.users[0].display_name}
                </Text>{" "}
                recasted your cast
              </Text>
            ) : (
              <Text>
                <Text style={{ fontWeight: "bold" }}>
                  {props.notification.users[0].display_name}
                </Text>{" "}
                and {props.notification.users.length - 1} other{" "}
                {props.notification.users.length - 1 === 1
                  ? "person"
                  : "people"}{" "}
                recasted your cast
              </Text>
            )
          }
          onPress={() => {
            navigation.navigate("Root", {
              screen: "Home",
              params: {
                screen: "Cast",
                params: {
                  castHash: (props.notification as RecastNotificationType).hash,
                },
              },
            });
          }}
          text={props.notification.text}
        />
      );
    case "d-cast-like":
      return (
        <FCNotificationItemUI
          icon={
            <NotificationIcon
              name="heart-filled"
              color={Colors.red["500"]}
              boxSize={6}
            />
          }
          isUnseen={props.notification.is_unseen}
          avatar={
            <View style={{ display: "flex", flexDirection: "row" }}>
              {props.notification.users.slice(0, 8).map((user, i) => (
                <FCNotificationItemAvatar
                  key={`${(props.notification as any).hash}--${user.username}`}
                  username={user.username || String(user.fid)}
                  isUnseen={user.is_unseen}
                  avatar={user.avatar_url || ""}
                />
              ))}
            </View>
          }
          heading={
            props.notification.users.length === 1 ? (
              <Text>
                <Text style={{ fontWeight: "bold" }}>
                  {props.notification.users[0].display_name}
                </Text>{" "}
                liked your cast
              </Text>
            ) : (
              <Text>
                <Text style={{ fontWeight: "bold" }}>
                  {props.notification.users[0].display_name}
                </Text>{" "}
                and {props.notification.users.length - 1} other{" "}
                {props.notification.users.length - 1 === 1
                  ? "person"
                  : "people"}{" "}
                liked your cast
              </Text>
            )
          }
          onPress={() => {
            navigation.navigate("Root", {
              screen: "Home",
              params: {
                screen: "Cast",
                params: {
                  castHash: (props.notification as LikeNotificationType).hash,
                },
              },
            });
          }}
          text={props.notification.text}
        />
      );
    default:
      return null;
  }
}

function FCNotificationItemAvatar(props: {
  avatar: string;
  username: string;
  isUnseen?: boolean;
}) {
  const navigation = useNavigation();
  return (
    <View style={{ marginRight: 6, marginBottom: 2, maxWidth: "100%" }}>
      <TouchableHighlight
        onPress={() => {
          navigation.navigate("Root", {
            screen: "Home",
            params: {
              screen: "Profile",
              params: {
                username: props.username ?? undefined,
              },
            },
          });
        }}
      >
        <Image
          key={props.avatar}
          source={{
            uri: props.avatar,
          }}
          style={{
            borderRadius: 1000,
            height: 48,
            width: 48,
          }}
          width={48}
          type="profile"
          height={48}
        />
      </TouchableHighlight>
    </View>
  );
}

function FCNotificationItemUI(props: {
  avatar: React.ReactNode;
  heading: string | React.ReactNode;
  text?: string | React.ReactNode;
  onPress?: () => void;
  isUnseen?: boolean;
  icon: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <TouchableHighlight
      onPress={() => {
        props.onPress?.();
      }}
      style={{
        borderBottomWidth: StyleSheet.hairlineWidth,
        flex: 1,
        paddingRight: 20,
        paddingVertical: 4,
        overflow: "hidden",
      }}
      _dark={{
        borderBottomColor: Colors.dark.borderColor,
      }}
      _light={{
        borderBottomColor: Colors.light.borderColor,
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          padding: 8,
          flex: 1,
        }}
      >
        <View style={{ paddingTop: 14, paddingRight: 10 }}>{props.icon}</View>
        <View style={{ flexShrink: 1, flexGrow: 1 }}>
          {props.avatar}
          <Text style={{ paddingVertical: 5 }}>{props.heading}</Text>
          {props.text && (
            <Text
              darkColor={Colors.dark.slightlyMutedText}
              lightColor={Colors.light.slightlyMutedText}
            >
              {props.text}
            </Text>
          )}
          {props.actions ? (
            <View style={{ marginVertical: 4, marginLeft: -8 }}>
              {props.actions}
            </View>
          ) : null}
        </View>
      </View>
    </TouchableHighlight>
  );
}
