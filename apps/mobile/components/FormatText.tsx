import React, { ReactElement, useContext, useState } from "react";
// import { GlobalModalContext } from "../contexts/GlobalModalContext";
import * as Linking from "expo-linking";
import { Text } from "./Text";
import { Image } from "./Image";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import Colors from "../constants/Colors";
import { View } from "./View";
import {
  StructuredCastUnit,
  convertCastPlainTextToStructured,
  StructuredCastPlaintext,
  StructuredCastUrl,
  StructuredCastImageUrl,
  StructuredCastMention,
  StructuredCastTextcut,
  StructuredCastNewline,
  StructuredCastDoubleBrackets,
  StructuredCastVideo,
} from "@discove/util/structure-cast";
import { HomeTabNavigationProps } from "../navigation/navigation-types";
import { Pressable } from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { Icon } from "./Icon";

function CreateAnchor({ url, text }: { url: string; text: string }) {
  return (
    <Text
      lightColor={Colors.light.link}
      darkColor={Colors.dark.link}
      onPress={() => {
        Linking.openURL(url.startsWith("http") ? url : `https://${url}`);
      }}
    >
      <Text lightColor={Colors.light.link} darkColor={Colors.dark.link}>
        {text}
      </Text>
    </Text>
  );
}

function InlineVideo(props: { src: string }) {
  const video = React.useRef<any>(null);
  const [status, setStatus] = React.useState<AVPlaybackStatus | null>(null);

  const totalSecLeft = status?.durationMillis
    ? status?.durationMillis / 1000 - status?.positionMillis / 1000
    : 0;
  const minLeft = Math.round(totalSecLeft / 60);
  let secLeft = String(Math.round(totalSecLeft % 60));
  if (secLeft.length === 1) secLeft = `0${secLeft}`;

  return (
    <View
      style={{
        padding: 0,
        margin: 0,
        height: 300,
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        gap: 4,
        flexDirection: "column",
      }}
    >
      <View
        _dark={{
          backgroundColor: Colors.whiteAlpha["200"],
        }}
        _light={{
          backgroundColor: Colors.slate["100"],
        }}
        style={{
          width: "100%",
          padding: 0,
          borderRadius: 10,
        }}
      >
        <Video
          ref={video}
          rate={1.0}
          volume={1.0}
          isMuted={true}
          resizeMode={ResizeMode.COVER}
          shouldPlay={true}
          isLooping
          style={{
            height: "100%",
            borderRadius: 10,
          }}
          source={{
            uri: props.src,
          }}
          useNativeControls
          onPlaybackStatusUpdate={(s) => setStatus(() => s)}
        />
      </View>
      <View
        style={{
          backgroundColor: Colors.blackAlpha["700"],
          position: "relative",
          // flexShrink: 1,
          flexGrow: 1,
          borderRadius: 5,
          paddingVertical: 2,
          paddingHorizontal: 4,
          bottom: 35,
          left: 10,
        }}
      >
        <Text style={{ color: "white" }}>
          {minLeft}:{secLeft}
        </Text>
      </View>
    </View>
  );
}

function InlineImage(props: { src: string }) {
  const navigation = useNavigation<HomeTabNavigationProps>();
  return (
    <Pressable
      style={{ flexGrow: 1, padding: 0, margin: 0, height: 300 }}
      onPress={() => {
        navigation.navigate("FullScreenImageModal", { imageUrl: props.src });
      }}
    >
      <View
        style={{
          padding: 0,
          margin: 0,
          height: 300,
          width: "100%",
          display: "flex",
          alignItems: "flex-start",
          gap: 4,
          flexDirection: "column",
        }}
      >
        <View
          _dark={{
            backgroundColor: Colors.whiteAlpha["200"],
          }}
          _light={{
            backgroundColor: Colors.slate["100"],
          }}
          style={{
            height: 300,
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "row",
            borderRadius: 10,
          }}
        >
          <Image
            type="cast"
            height={300}
            key={props.src}
            width={600}
            source={{ uri: props.src }}
            style={{
              height: 300,
              flexShrink: 1,
              flex: 1,
              width: "100%",
              resizeMode: "contain",
              borderRadius: 10,
            }}
          />
        </View>
        {props.src.endsWith("gif") ? (
          <View
            style={{
              backgroundColor: Colors.blackAlpha["700"],
              position: "relative",
              // flexShrink: 1,
              display: "flex",
              flexDirection: "row",
              gap: 5,
              flexGrow: 1,
              borderRadius: 5,
              paddingVertical: 2,
              paddingHorizontal: 4,
              bottom: 35,
              left: 10,
            }}
          >
            <Icon name="player-play" size={16} color="white" />
            <Text style={{ color: "white" }}>GIF</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

type Options = {
  navigation: NavigationProp<
    ReactNavigation.RootParamList,
    keyof ReactNavigation.RootParamList,
    undefined,
    any
  >;
};

const structuredCastToReactDOMComponentsConfig: Record<
  StructuredCastUnit["type"],
  (structuredCast: any, i: number, options: Options) => React.ReactElement
> = {
  doublebrackets: (_: StructuredCastDoubleBrackets, i: number) => (
    <Text key={i} />
  ),
  plaintext: (structuredCast: StructuredCastPlaintext, i: number) => (
    <Text key={i}>{structuredCast.serializedContent}</Text>
  ),
  url: (structuredCast: StructuredCastUrl, i: number) => (
    <CreateAnchor
      url={structuredCast.serializedContent}
      key={i}
      text={structuredCast.serializedContent}
    />
  ),
  videourl: (structuredCast: StructuredCastVideo, i: number) => (
    <InlineVideo src={structuredCast.serializedContent} key={i} />
  ),
  imageurl: (structuredCast: StructuredCastImageUrl, i: number) => (
    <InlineImage src={structuredCast.serializedContent} key={i} />
  ),
  mention: (structuredCast: StructuredCastMention, i: number, options) => (
    <Text
      lightColor={Colors.light.link}
      darkColor={Colors.dark.link}
      key={i}
      onPress={() => {
        options.navigation.navigate("Root", {
          screen: "Home",
          params: {
            screen: "Profile",
            params: {
              username: structuredCast.serializedContent.replace("@", ""),
            },
          },
        });
      }}
    >
      {structuredCast.serializedContent}
    </Text>
  ),
  textcut: (structuredCast: StructuredCastTextcut, i: number) => (
    <CreateAnchor
      key={i}
      url={structuredCast.url}
      text={structuredCast.serializedContent}
    />
  ),
  newline: (_: StructuredCastNewline, i: number) => (
    <Text key={i} style={{ maxWidth: 200 }}>
      {"\n"}
    </Text>
  ),
};

function convertStructuredCastToReactDOMComponents(
  structuredCast: StructuredCastUnit[],
  options: Options
): React.ReactElement {
  const structuredWithoutImages = structuredCast.filter(
    (x) => x.type !== "imageurl" && x.type !== "videourl"
  );
  const structuredImages = structuredCast.filter((x) => x.type === "imageurl");
  const structuredVideos = structuredCast.filter((x) => x.type === "videourl");

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <Text
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "row",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        {structuredWithoutImages.map((structuredCastUnit, i) =>
          structuredCastToReactDOMComponentsConfig[structuredCastUnit.type](
            structuredCastUnit,
            i,
            options
          )
        )}
      </Text>
      {structuredImages.map((structuredCastUnit, i) =>
        structuredCastToReactDOMComponentsConfig[structuredCastUnit.type](
          structuredCastUnit,
          i,
          options
        )
      )}
      {structuredVideos.map((structuredCastUnit, i) =>
        structuredCastToReactDOMComponentsConfig[structuredCastUnit.type](
          structuredCastUnit,
          i,
          options
        )
      )}
    </View>
  );
}

export function FormatText({
  text,
  q,
  hideDoubleBracketContent,
}: {
  text: string;
  hideDoubleBracketContent?: boolean;
  q?: string;
}): ReactElement<any, any> {
  const navigation = useNavigation();

  let structuredCast = convertCastPlainTextToStructured({
    text,
    options: { hideDoubleBracketContent },
  });

  const structuredCastElements = convertStructuredCastToReactDOMComponents(
    structuredCast,
    {
      navigation,
    }
  );

  return <>{structuredCastElements}</>;
}
