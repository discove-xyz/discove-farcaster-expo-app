import React, {
  ComponentType,
  JSXElementConstructor,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import { normalizeFeedQuery, feedQueryToUrlString } from "@discove/util/params";
import FeedList from "./FeedList";
import {
  API,
  defaultFeedQueryValues,
  FeedQuery,
  feedQueryStrictTypesWithFallback,
  FeedType,
} from "@discove/util/types";
import { useFarcasterIdentity } from "@discove/ui/useFarcasterIdentity";
import useSWRInfinite from "swr/infinite";
import { useFetcher, useUnauthedFetcher } from "@discove/ui/useSwr";
import { useDebounce } from "../hooks/useDebounce";
import { useUser } from "../contexts/SessionContext";
import {
  NavigationProps,
  HomeTabNavigationProps,
} from "../navigation/navigation-types";
import { Share, TouchableOpacity, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useFavoriteCove } from "@discove/ui/useFavoriteCove";
import { Image } from "./Image";
import { useFCProfile } from "@discove/ui/useFCProfile";
import { Icon } from "./Icon";
import { TouchableHighlight } from "./TouchableHighlight";
import { config } from "../lib/config";
import { Text } from "./Text";
import useColorScheme from "../hooks/useColorScheme";
import Colors from "../constants/Colors";
import { usePostHog } from "posthog-react-native";
import * as Haptics from "expo-haptics";
import { Pressable } from "./Pressable";
import { useCoveNotifications } from "@discove/ui/useCoveNotifications";

export function FeedHeader() {
  const posthog = usePostHog();
  const { params = {} } = useRoute<any>();
  const navigation = useNavigation();

  const feedQuery = normalizeFeedQuery(params);
  const debouncedFeedQuery = useDebounce(feedQuery, 300);
  const { username, feedname } = params;

  const fetcher = useFetcher();

  const [noMoreResults, setNoMoreResults] = useState(false);
  const getPage = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData?.feed?.results?.length) {
      if (!noMoreResults) setNoMoreResults(true);
      return null; // reached the end
    }
    if (username && feedname) {
      return `/api/feeds/${username}/${feedname}${feedQueryToUrlString(
        normalizeFeedQuery({
          p: `${pageIndex + 1}`,
        })
      )}`;
    }

    const page = `/api/feeds${feedQueryToUrlString(
      normalizeFeedQuery({
        ...debouncedFeedQuery,
        p: String(pageIndex + 1),
      })
    )}`;

    return page;
  };

  const { data } = useSWRInfinite<API["/api/feeds"]["GET"]>(getPage, fetcher, {
    loadingTimeout: 3000,
    revalidateOnFocus: true,
    revalidateFirstPage: true,
    dedupingInterval: 60000,
  });

  // const sqlQuery = data && data?.[0]?.feed?.sqlQuery;
  const feedQueryFromNamedConfig: FeedQuery | undefined =
    data && data.length ? data[0]?.feedQuery : undefined;
  const mergedFeedQuery = feedQueryFromNamedConfig || params;
  const updateFeedQuery = useCallback(
    async (nextFeedQuery: FeedQuery) => {
      navigation.navigate("Root", {
        screen: "Home",
        params: {
          screen: "FiltersModal",
          params: normalizeFeedQuery(nextFeedQuery),
        },
      });
    },
    [navigation]
  );
  const user = useUser();
  const isLoggedIn = !!user;
  const { isFavorited, favoriteCove, subscribeToNotifications, favorite } =
    useFavoriteCove(username, feedname);
  const { markRead } = useCoveNotifications();

  const creatorProfile = useFCProfile(username);

  useEffect(() => {
    async function handleFocus() {
      if (isFavorited && feedname && username) {
        markRead(feedname, username);
      }
    }
    const didBlurSubscription = navigation.addListener("focus", handleFocus);

    return didBlurSubscription;
  }, [isFavorited, feedname, username]);

  function handleFork() {
    updateFeedQuery({
      ...mergedFeedQuery,
      feedname: feedname,
      h: "0",
    });
  }

  return (
    <View style={{ marginTop: 60, marginLeft: 16 }}>
      <View
        style={{
          marginLeft: 3,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",

          gap: 8,
        }}
      >
        {/* {mergedFeedQuery?.t ? (
      <Text style={{ fontSize: 32 }}>{mergedFeedQuery?.t}</Text>
    ) : null}
    {mergedFeedQuery?.d ? (
      <Text style={{ fontSize: 18 }}>{mergedFeedQuery.d}</Text>
    ) : null} */}
        {username && feedname ? (
          [
            <TouchableHighlight
              key={0}
              onPress={() => {
                navigation.navigate("Root", {
                  screen: "Home",
                  params: {
                    screen: "Profile",
                    params: { username },
                  },
                });
              }}
            >
              <View style={{ width: 30, height: 30, marginTop: 5 }}>
                <Image
                  type="profile"
                  key={creatorProfile?.avatar_url}
                  style={{
                    borderRadius: 100,
                    width: 30,
                    height: 30,
                  }}
                  source={{ uri: creatorProfile?.avatar_url || "" }}
                  width={30}
                  height={30}
                />
              </View>
            </TouchableHighlight>,
            <View
              key={1}
              // Prevents the TouchableOpacity from messing up the text alignment
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Root", {
                    screen: "Home",
                    params: {
                      screen: "Profile",
                      params: { username },
                    },
                  });
                }}
              >
                <Text
                  style={{
                    fontFamily: "SF-Pro-Rounded-Semibold",
                    fontSize: 20,
                  }}
                >
                  @{username}
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  fontFamily: "SF-Pro-Rounded-Semibold",
                  fontSize: 20,
                }}
              >
                {" "}
                / {mergedFeedQuery?.t || feedname}
              </Text>
            </View>,
          ]
        ) : mergedFeedQuery?.t ? (
          <Text>{mergedFeedQuery?.t}</Text>
        ) : null}
      </View>
      <View
        style={{
          marginLeft: 3,
          display: "flex",
          marginVertical: 10,
          flexDirection: "row",

          alignItems: "center",
          gap: 8,
        }}
      >
        {isLoggedIn && feedname && username && (
          <Pressable
            size="sm"
            variant="transparent"
            onPress={() => {
              posthog?.capture("favorite_cove");
              Haptics.selectionAsync();
              favoriteCove(
                mergedFeedQuery?.t || mergedFeedQuery?.feedname || ""
              );
            }}
            icon={
              <Icon
                name={isFavorited ? "star-filled" : "star"}
                size={16}
                color="gold"
              />
            }
          >
            Favorite{isFavorited ? "d" : ""}
          </Pressable>
        )}
        {isLoggedIn && feedname && username && isFavorited && (
          <Pressable
            size="sm"
            variant="transparent"
            onPress={() => {
              subscribeToNotifications();
            }}
            icon={
              <Icon
                name="bell-ringing"
                size={16}
                color={favorite?.subscribed_to_notifications ? "green" : "gray"}
              />
            }
          >
            {favorite?.subscribed_to_notifications ? "Notify" : "Notifs on"}
          </Pressable>
        )}
        {mergedFeedQuery?.h ? (
          <Pressable
            size="sm"
            variant="transparent"
            onPress={() => {
              handleFork();
            }}
            icon={<Icon name="arrow-fork" size={16} />}
          >
            Fork
          </Pressable>
        ) : null}
        <Pressable
          size="sm"
          variant="transparent"
          onPress={async () => {
            try {
              await Share.share({
                message: `Check out ${
                  mergedFeedQuery?.t || feedname
                } by @${username} on Discove`,
                url: `https://www.discove.xyz/@${username}/${feedname}`,
              });
            } catch (error: any) {}
          }}
          icon={<Icon name="upload" size={16} />}
        >
          Share
        </Pressable>
      </View>
    </View>
  );
}

export function RoutedFeed(props: {
  noMoreResults?: boolean;
  ListHeaderComponent?:
    | ReactElement<any, string | JSXElementConstructor<any>>
    | ComponentType<any>
    | null
    | undefined;
}) {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute();
  const feedQuery = normalizeFeedQuery(route.params ?? {});

  const updateFeedQuery = useCallback(
    async (nextFeedQuery: FeedQuery) => {
      navigation.setParams(normalizeFeedQuery(nextFeedQuery));
    },
    [navigation]
  );

  return (
    <Feed
      ListHeaderComponent={props.ListHeaderComponent}
      noMoreResults={props.noMoreResults}
      updateFeedQuery={updateFeedQuery}
      shareUrl={`${config.apiUrl}${feedQueryToUrlString(
        normalizeFeedQuery(feedQuery)
      )}`}
    />
  );
}

export function NamedFeed({
  username,
  feedname,
}: {
  username: string;
  feedname: string;
}) {
  const navigation = useNavigation<HomeTabNavigationProps>();
  const { username: myUsername } = useFarcasterIdentity();

  const updateFeedQuery = useCallback(
    async (nextFeedQuery: FeedQuery) => {
      navigation.setParams({
        ...normalizeFeedQuery(nextFeedQuery),
      });
    },
    [navigation]
  );

  return (
    <Feed
      isCreator={myUsername === username}
      shareUrl={`${config.apiUrl}/${username}/${feedname}`}
      updateFeedQuery={updateFeedQuery}
    />
  );
}

export default function Feed(props: {
  shareUrl: string;
  isCreator?: boolean;
  ListHeaderComponent?:
    | ReactElement<any, string | JSXElementConstructor<any>>
    | ComponentType<any>
    | null
    | undefined;
  noMoreResults?: boolean;
  updateFeedQuery: (nextFeedQuery: FeedQuery) => void;
}) {
  const { params = {} } = useRoute<any>();
  const feedQuery = normalizeFeedQuery(params);
  const debouncedFeedQuery = useDebounce(feedQuery, 300);
  const { username, feedname } = params;
  const [noMoreResults, setNoMoreResults] = useState(props.noMoreResults);
  /**
   * data loading
   */
  const getPage = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData?.feed?.results?.length) {
      if (!noMoreResults) setNoMoreResults(true);
      return null; // reached the end
    }
    if (username && feedname) {
      return `/api/feeds/${username}/${feedname}${feedQueryToUrlString(
        normalizeFeedQuery({
          p: `${pageIndex + 1}`,
        })
      )}`;
    }

    return `/api/feeds${feedQueryToUrlString(
      normalizeFeedQuery({
        ...debouncedFeedQuery,
        p: String(pageIndex + 1),
      })
    )}`;
  };

  // const { data: userSettings } = useSWR<API["/api/user/settings"]["GET"]>(
  //   user ? `/api/user/settings` : null
  // );

  const unauthedFetcher = useUnauthedFetcher();

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite<
    API["/api/feeds"]["GET"]
  >(getPage, unauthedFetcher, {
    loadingTimeout: 3000,
    revalidateOnFocus: true,
    revalidateFirstPage: true,
    dedupingInterval: 60000,
  });
  // console.log(new Date().getTime(), !!data);

  const results: FeedType = (data || []).flatMap(
    // migration step
    (d) => d.feed.results as any
  );
  // const sqlQuery = data && data?.[0]?.feed?.sqlQuery;
  const feedQueryFromNamedConfig: FeedQuery | undefined =
    data && data.length ? data[0]?.feedQuery : undefined;
  // let plugins = ((data && data?.[0]?.feed?.plugins) || []).concat(
  //   ...(userSettings?.plugins || [])
  // );
  // remove duplicates from plugins
  // plugins = plugins.filter(function (item, pos) {
  //   return (
  //     plugins.findIndex(
  //       (f) => f.username === item.username && f.slug === item.slug
  //     ) === pos
  //   );
  // });
  const mergedFeedQuery = feedQueryFromNamedConfig || debouncedFeedQuery;
  const type = feedQueryStrictTypesWithFallback.type(
    feedQueryFromNamedConfig?.type
  );

  if (
    data &&
    data.length &&
    (data[data.length - 1]?.feed?.results?.length ||
      // migration step
      (data[data.length - 1]?.feed as any)?.casts?.length) <
      Number(mergedFeedQuery.n || defaultFeedQueryValues.n) &&
    !noMoreResults
  ) {
    setNoMoreResults(true);
  }
  // if you substantially change the query results, reset no more results state
  useEffect(() => {
    if (noMoreResults) setNoMoreResults(false);
  }, [
    debouncedFeedQuery?.u,
    debouncedFeedQuery?.q,
    debouncedFeedQuery?.a,
    debouncedFeedQuery?.s,
    debouncedFeedQuery?.e,
    noMoreResults,
    debouncedFeedQuery?.n,
  ]);

  const refreshData = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const colorScheme = useColorScheme();

  return (
    <View
      style={{
        flexDirection: "column",
        alignItems: "stretch",
        backgroundColor:
          colorScheme === "dark"
            ? Colors.dark.background
            : Colors.light.background,
      }}
    >
      <FeedList
        plugins={[]}
        refreshData={refreshData}
        ListHeaderComponent={<>{props.ListHeaderComponent}</>}
        feedQuery={mergedFeedQuery}
        results={results}
        type={type}
        error={error}
        size={size}
        setSize={setSize}
        isValidating={isValidating}
        noMoreResults={noMoreResults}
        sql={debouncedFeedQuery.sql}
      />
    </View>
  );
}
