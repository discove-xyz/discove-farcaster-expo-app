import React from "react";
import { FeedItem, FeedItemType, RenderPlugin } from "@discove/util/types";
import { useFarcasterIdentity } from "@discove/ui/useFarcasterIdentity";
import { Sentry } from "../lib/sentry";
import { View } from "react-native";
import { Text } from "./Text";
import { WebView } from "react-native-webview";
import { config } from "../lib/config";
import useColorScheme from "../hooks/useColorScheme";
import Colors from "../constants/Colors";

const omit = (obj: object, keys: string[]): object =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));

export default function RenderPlugins({
  text = "",
  q,
  plugins = [],
  item,
  type,
}: {
  text: string;
  q?: string;
  plugins: RenderPlugin[];
  item: FeedItem;
  type: FeedItemType;
}) {
  return null;
  // const { fid } = useFarcasterIdentity();
  // const colorScheme = useColorScheme();

  // const pluginEmbeds: React.ReactElement[] = [];
  // plugins.forEach((plugin, plIndex) => {
  //   // FIXME: Limit # of matches per plugin to N to prevent severe bugs.
  //   plugin.matches.forEach((matchGroup, i) => {
  //     try {
  //       const regex = new RegExp(matchGroup.match, matchGroup.match_flags);
  //       const property_names =
  //         matchGroup.property_names?.trim() ||
  //         // fallback to the text field of every item type
  //         (type === "cast" ? "text" : type === "profile" ? "bio" : "text");
  //       const eachProperty = property_names.split(",").map((x) => x.trim());
  //       const eachPropertyMatches = eachProperty.map((propertyName) => {
  //         // propertyName is untrusted
  //         if (item.hasOwnProperty(propertyName)) {
  //           const value =
  //             typeof (item as any)[propertyName] === "string"
  //               ? (item as any)[propertyName]
  //               : JSON.stringify((item as any)[propertyName]);

  //           const matchesInner = Array.from((value || "").matchAll(regex));

  //           return matchesInner;
  //         }
  //       });
  //       const matchesInner = eachPropertyMatches.flat().filter((x) => x);
  //       matchesInner.forEach((_, j) => {
  //         pluginEmbeds.push(
  //           <View
  //             key={`${plIndex}.${i}.${j}`}
  //             style={{
  //               padding: 4,
  //               marginTop: 8,
  //               overflow: "hidden",
  //               borderWidth: 1,
  //               borderColor:
  //                 colorScheme === "dark"
  //                   ? Colors.dark.borderColor
  //                   : Colors.light.borderColor,
  //               borderRadius: 4,
  //             }}
  //           >
  //             <View style={{ marginBottom: 6 }}>
  //               <Text>
  //                 Third party content by the plugin {plugin.username}/
  //                 {plugin.slug}
  //               </Text>
  //             </View>
  //             <WebView
  //               style={{
  //                 height: Number(matchGroup.height.replace("px", "")),
  //                 width: 300,
  //               }}
  //               source={{
  //                 uri: `${
  //                   config.env === "dev"
  //                     ? "http://127.0.0.1:3001"
  //                     : `https://${plugin.username}.discove.app`
  //                 }/api/${plugin.slug}?${new URLSearchParams({
  //                   t: text,
  //                   q: q || "",
  //                   a: String(!!fid),
  //                   type: type,
  //                   cm: colorScheme === "dark" ? "dark" : "light",
  //                   bg:
  //                     colorScheme === "dark"
  //                       ? Colors.dark.background
  //                       : Colors.light.background,
  //                   c:
  //                     colorScheme === "dark"
  //                       ? Colors.dark.text
  //                       : Colors.light.text,
  //                   i: String(i),
  //                   j: String(j),
  //                   item: encodeURIComponent(
  //                     JSON.stringify(
  //                       omit(item, [
  //                         "reply_to_data",
  //                         "recast_data",
  //                         "weighted_keywords",
  //                         "custom_metrics",
  //                         "custom_profile_metrics",
  //                       ])
  //                     )
  //                   ),
  //                 }).toString()}`,
  //               }}
  //             />
  //             {/* <iframe

  //             // loading="lazy"
  //             // referrerPolicy="no-referrer"
  //             // no firefox support
  //             // csp=""
  //             // allow=""
  //             // sandbox="allow-scripts allow-same-origin allow-top-navigation-by-user-activation"

  //             // 2048 characters max URL length
  //             /> */}
  //           </View>
  //         );
  //       });
  //     } catch (e) {
  //       Sentry.captureException(e);
  //       console.error(e);
  //     }
  //   });
  // });
  // return <>{pluginEmbeds}</>;
}
