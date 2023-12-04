import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, RefreshControl, View } from "react-native";
import { Text } from "../components/Text";
import { useMutateUnreadNotifications } from "@discove/ui/useMutateUnreadNotifications";
import {
  useFCNotifications,
  useFCNotificationsCount,
} from "@discove/ui/useFCNotifications";
import { NotificationItem } from "../components/NotificationItem";
import { MainBottomTabScreenProps } from "../navigation/navigation-types";
import { Sentry } from "../lib/sentry";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import Colors from "../constants/Colors";
import { useFocusEffect, useScrollToTop } from "@react-navigation/native";

function RenderNotificationTab({
  data,
  isValidating,
  refreshData,
}: {
  data: any[];
  isValidating: boolean;
  refreshData: () => Promise<void>;
}) {
  const onRefresh = async () => {
    Haptics.selectionAsync();
    try {
      // Call the Service to get the latest data
      await refreshData();
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const ref = useRef<FlashList<any>>(null);

  // on home tab press, this will make sure that it scrolls to the top of the feed automatically.
  useScrollToTop(ref as any);

  if (!data?.length && isValidating) {
    return (
      <View
        style={{
          marginTop: 10,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlashList
      ref={ref}
      refreshControl={
        <RefreshControl
          //refresh control used for the Pull to Refresh
          refreshing={isValidating}
          onRefresh={onRefresh}
        />
      }
      ListEmptyComponent={
        <View
          style={{
            marginTop: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>no notifications from the last week</Text>
        </View>
      }
      estimatedItemSize={120}
      keyExtractor={(res: any) => JSON.stringify(res[1])}
      data={data}
      renderItem={({ item }) => {
        return (
          <NotificationItem
            key={JSON.stringify(item[1])}
            notification={item[1]}
          />
        );
      }}
    />
  );
}

export default function NotificationsScreen({
  navigation,
}: MainBottomTabScreenProps<"Notifications">) {
  const { data, isValidating, mutate, error } = useFCNotifications();
  const count = useFCNotificationsCount();
  const mutateUnreadNotifications = useMutateUnreadNotifications();

  useEffect(() => {
    async function handleFocus() {
      mutateUnreadNotifications(data);
      await mutate();
    }
    const didBlurSubscription = navigation.addListener("focus", handleFocus);

    return didBlurSubscription;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      if (count) mutateUnreadNotifications(data);
    }, [count])
  );

  useEffect(() => {
    // beware prevent any infinite loops
    if (count) mutateUnreadNotifications(data);
  }, [count]);

  const endUI = data ? (
    <>
      <Text
        style={{ padding: 6 }}
        darkColor={Colors.dark.mutedText}
        lightColor={Colors.light.mutedText}
      >
        Loaded all the notifications from the last week.
      </Text>
    </>
  ) : null;

  const refreshData = useCallback(async () => {
    await mutate();
    mutateUnreadNotifications(data);
  }, [mutate, data]);

  return (
    <View>
      <View style={{ height: "100%" }}>
        <RenderNotificationTab
          refreshData={refreshData}
          data={Object.entries(data?.notifications || {})}
          isValidating={isValidating}
        />
        {/* <Tab.Navigator initialRouteName="All">
          <Tab.Screen
            name="All"
            children={() => (
              <RenderNotificationTab
                data={Object.entries(data?.notifications || {})}
                isValidating={isValidating}
              />
            )}
          />
          <Tab.Screen
            name="Mentions"
            children={() => (
              <RenderNotificationTab
                data={Object.entries(data?.notifications || {}).filter(
                  (notification) => notification[1].type === "cast-mention"
                )}
                isValidating={isValidating}
              />
            )}
          />
          <Tab.Screen
            name="Recasts"
            children={() => (
              <RenderNotificationTab
                data={Object.entries(data?.notifications || {}).filter(
                  (notification) => notification[1].type === "d-recast"
                )}
                isValidating={isValidating}
              />
            )}
          />
          <Tab.Screen
            name="Replies"
            children={() => (
              <RenderNotificationTab
                data={Object.entries(data?.notifications || {}).filter(
                  (notification) => notification[1].type === "cast-reply"
                )}
                isValidating={isValidating}
              />
            )}
          />
          <Tab.Screen
            name="Likes"
            children={() => (
              <RenderNotificationTab
                data={Object.entries(data?.notifications || {}).filter(
                  (notification) => notification[1].type === "d-cast-like"
                )}
                isValidating={isValidating}
              />
            )}
          />
        </Tab.Navigator> */}
      </View>
      {endUI}
    </View>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   title: {
//     fontSize: 20,
//     fontFamily: "Inter-Bold",
//   },
//   separator: {
//     marginVertical: 30,
//     height: 1,
//     width: "80%",
//   },
// });
