import React, { RefObject } from "react";
import { FormatText } from "./FormatText";
import {
  FeedItem,
  RenderPlugin,
  TextItem as TextItemType,
} from "@discove/util/types";
import RenderPlugins from "./RenderPlugins";
import { Image } from "./Image";
import { View, StyleSheet } from "react-native";
import { TouchableHighlight } from "./TouchableHighlight";
import Colors from "../constants/Colors";
import { Text } from "./Text";
import { openLinkFromWebMaybeInApp } from "../navigation/LinkingConfiguration";
import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";

export function TextItem(props: {
  item: TextItemType;
  priorityImageRender?: boolean;
  q?: string;
  listRef: RefObject<FlashList<FeedItem> | null>;
  plugins?: RenderPlugin[];
}) {
  const imagew = Number(props.item.imagew ?? 100);
  const imageh = Number(props.item.imageh ?? 100);
  const navigation = useNavigation();
  return (
    <TouchableHighlight
      style={{ borderBottomWidth: StyleSheet.hairlineWidth }}
      _dark={{
        borderBottomColor: Colors.dark.borderColor,
      }}
      _light={{
        borderBottomColor: Colors.light.borderColor,
      }}
      onPress={(e) => {
        props.listRef?.current?.recordInteraction();

        // workaround for not valid nesting <a> elements
        if (props.item.url) {
          // FIXME: In app linking schemas aren't really considered rn
          openLinkFromWebMaybeInApp(props.item.url, navigation);
        }
      }}
    >
      <View
        style={{
          justifyContent: "flex-start",
          alignItems: "flex-start",
          display: "flex",
          flex: 1,
          maxWidth: "100%",
          flexDirection: "row",
        }}
      >
        {props.item.image && (
          <View
            style={{
              flexShrink: 0,
              width: imagew,
              height: imageh,
            }}
          >
            <Image
              // these images can be coming from anywhere.
              key={props.item.image}
              type="cast"
              style={{
                width: imagew,
                height: imageh,
              }}
              source={{ uri: props.item.image }}
              width={imagew}
              height={imageh}
            />
          </View>
        )}
        <View
          style={{
            flexDirection: "column",
            paddingHorizontal: 10,
            paddingVertical: 4,
            flex: 1,
          }}
        >
          {props.item.title && (
            <View>
              <Text style={{ fontFamily: "Inter-Bold" }}>
                {props.item.title}
              </Text>
            </View>
          )}
          <View>
            <FormatText
              text={props.item.text}
              q={props.q}
              hideDoubleBracketContent
            />
          </View>
          {props.plugins && (
            <RenderPlugins
              type={"text"}
              item={props.item}
              text={props.item.text}
              q={props.q}
              plugins={props.plugins}
            />
          )}
        </View>
      </View>
    </TouchableHighlight>
  );
}
