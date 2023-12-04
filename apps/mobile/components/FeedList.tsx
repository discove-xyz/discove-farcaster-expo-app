import {
  FeedItem,
  FeedItemType,
  FeedQuery,
  RenderPlugin,
} from "@discove/util/types";
import React, {
  ComponentType,
  JSXElementConstructor,
  ReactElement,
  useCallback,
  useState,
} from "react";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";

import { CastItem } from "./CastItem";
import ProfileItem from "./ProfileItem";
import { ActivityIndicator, RefreshControl, View } from "react-native";
import {
  isCast,
  isCove,
  isProfile,
  isTextItem,
} from "@discove/util/type-guards";
import { Text } from "./Text";
import { TextItem } from "./TextItem";
import { Sentry } from "../lib/sentry";
import { useScrollToTop } from "@react-navigation/native";
import { CoveItem } from "./CoveItem";

const keyExtractor = (res: any): string => {
  if (isCove(res)) {
    return `${res.username}/${res.feedname}`;
  }
  if (isCast(res)) {
    return res.hash;
  }
  if (isProfile(res)) {
    return String(res.fid);
  }

  return res?.fid || res?.hash || res?.id || "";
};

export default function FeedList({
  feedQuery,
  plugins,
  results,
  type,
  error,
  size,
  setSize,
  isValidating,
  refreshData,
  noMoreResults,
  ListHeaderComponent,
  sql,
}: {
  feedQuery: FeedQuery;
  results: FeedItem[];
  plugins?: RenderPlugin[];
  type: FeedItemType;
  error?: any;
  refreshData: () => Promise<void>;
  size: number;
  setSize: (size: number) => void;
  isValidating?: boolean;
  noMoreResults?: boolean;
  sql?: string;
  ListHeaderComponent?:
    | ReactElement<any, string | JSXElementConstructor<any>>
    | ComponentType<any>
    | null
    | undefined;
}) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.selectionAsync();

    try {
      // Call the Service to get the latest data
      await refreshData();
    } catch (err) {
      Sentry.captureException(err);
    }
    setRefreshing(false);
  };
  const ref = React.useRef<FlashList<FeedItem>>(null);

  // on home tab press, this will make sure that it scrolls to the top of the feed automatically.
  useScrollToTop(ref as any);

  const renderItem = useCallback(
    ({ item }: any) => {
      if (type === "text" && isTextItem(item)) {
        return (
          <TextItem
            listRef={ref}
            // don't use id, as can cause problems when navigating between feeds
            item={item}
            plugins={plugins}
            q={String(feedQuery?.q)}
          />
        );
      }
      if (type === "profile" && isProfile(item)) {
        return (
          <ProfileItem
            borderBottom
            listRef={ref}
            plugins={plugins}
            profile={item}
            q={String(feedQuery?.q)}
            showTheirFeedButton={false}
          />
        );
      }
      if (type === "cast" && isCast(item)) {
        return (
          <CastItem
            cast={item}
            listRef={ref}
            plugins={plugins}
            q={String(feedQuery?.q)}
          />
        );
      }
      if (type === "cove" && isCove(item)) {
        return <CoveItem item={item} listRef={ref} />;
      }

      return null;
    },
    [plugins, feedQuery, type]
  );

  const onEndReached = useCallback(() => {
    setSize(size + 1);
  }, [size, setSize]);

  return (
    <View>
      <View style={{ width: "100%", minHeight: "100%" }}>
        <FlashList
          ref={ref}
          estimatedItemSize={type === "cove" ? 60 : 200}
          onEndReachedThreshold={0.3}
          onEndReached={onEndReached}
          refreshControl={
            <RefreshControl
              //refresh control used for the Pull to Refresh
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={
            <>
              {error ? (
                sql ? (
                  <Text>
                    There was an error. It might be your SQL.
                    <Text>{JSON.stringify(error, null, 2)}</Text>
                  </Text>
                ) : (
                  <Text>
                    There was an error 🥲. We&apos;ve been notified. A reload
                    might fix it. {JSON.stringify(error, null, 2)}
                  </Text>
                )
              ) : null}
              {results && results.length === 0 && !isValidating && !error ? (
                <View
                  style={{
                    marginTop: 10,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ opacity: 0.6 }}>
                    no matching {type}s found
                  </Text>
                </View>
              ) : null}
              {isValidating ? (
                <View
                  style={{
                    marginTop: 10,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator />
                </View>
              ) : null}
            </>
          }
          data={results}
          renderItem={renderItem}
          // Must not be undefined, or it will crash
          keyExtractor={keyExtractor}
        />
      </View>
    </View>
  );
}
