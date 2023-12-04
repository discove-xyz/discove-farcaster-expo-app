/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { LinkingOptions, NavigationProp } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { AuthedParamList, NoAuthParamList } from "./navigation-types";
import queryString from "query-string";

export function openLinkFromWebMaybeInApp(
  url: string,
  navigation: NavigationProp<any>
) {
  let discovePath: string[] = [];

  if (url.startsWith("/")) {
    discovePath = url.split("/");
  } else if (
    url.startsWith("https://www.discove.xyz") ||
    url.startsWith("https://discove.xyz")
  ) {
    discovePath = url
      .replace("https://www.discove.xyz", "")
      .replace("https://discove.xyz", "")
      .split("/");
  }

  discovePath = discovePath.filter((x) => !!x);
  let queryParamsString = discovePath.length
    ? discovePath[discovePath.length - 1]?.split("?")[1]
    : "";
  const parsedQueryString = queryString.parse(queryParamsString);

  if (discovePath.length) {
    discovePath[discovePath.length - 1] =
      discovePath[discovePath.length - 1].split("?")[0];
  }

  if (discovePath && discovePath.length) {
    // Try to map this web path to the react-native path.
    // Incomplete handling right now that only covers the most common use cases

    // handle profiles
    if (discovePath[0][0] === "@" && discovePath.length === 1) {
      navigation.navigate("Root", {
        screen: "Home",
        params: {
          screen: "Profile",
          params: {
            username: discovePath[0].replace("@", ""),
          },
        },
      });
      return;
    }

    // handle casts
    if (discovePath[0] === "casts" && discovePath.length === 2) {
      navigation.navigate("Root", {
        screen: "Home",
        params: {
          screen: "Cast",
          params: {
            castHash: discovePath[1],
          },
        },
      });
      return;
    }

    // handle threads
    if (discovePath[0] === "threads" && discovePath.length === 3) {
      navigation.navigate("Root", {
        screen: "Home",
        params: {
          screen: "Thread",
          params: {
            castHash: discovePath[2],
            threadHash: discovePath[1],
          },
        },
      });
      return;
    }
    // handle named coves
    if (discovePath[0][0] === "@" && discovePath.length === 2) {
      navigation.navigate("Root", {
        screen: "Home",
        params: {
          screen: "NamedFeed",
          params: {
            feedname: discovePath[1],
            username: discovePath[0].replace("@", ""),
          },
        },
      });
      return;
    }
    // handle routed coves
    if (discovePath.length === 1 && discovePath[0] === "") {
      navigation.navigate("Root", {
        screen: "Home",
        params: {
          screen: "RoutedFeed",
          params: parsedQueryString ?? {},
        },
      });

      return;
    }
  }

  // open external links in a browser
  Linking.openURL(url);
}

const linking: LinkingOptions<NoAuthParamList | AuthedParamList> = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      Authenticate: "login",
      Root: {
        screens: {
          Home: {
            /**
             * Keep compatibility with Warpcast Client by supporting
             * farcaster://casts/:castHash
             * farcaster://profiles/:fid
             * farcaster://casts/:castHash/:threadHash
             **/
            screens: {
              RoutedFeed: "home",
              Profile: {
                path: "profiles/:fid",
              },
              Cast: {
                path: "casts/:castHash",
              },
              Thread: {
                path: "casts/:castHash/:threadHash",
              },
            },
          },
          // Coves: {
          //   screens: {
          //     CovesScreen: "three",
          //   },
          // },
          // Notifications: {
          //   screens: {
          //     NotificationsScreen: "four",
          //   },
          // },
          // Settings: {
          //   screens: {
          //     SettingsScreen: "five",
          //   },
          // },
        },
      },
      Modal: "modal",
      NotFound: "*",
    },
  },
};

export default linking;
