import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable } from "./Pressable";

import {
  normalizeFeedQuery,
  feedQueryToFeedQueryWithAllKeysUsingUndefinedFallback,
} from "@discove/util/params";
import { defaultFeedQueryValues, FeedQuery } from "@discove/util/types";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { ScrollView, View } from "react-native";
import { HStack, VStack } from "./Stack";
import { TextInput } from "./TextInput";
import {
  cast_sort_orders,
  cove_sort_orders,
  profile_sort_orders,
} from "@discove/util/constants";
import { FormLabel } from "./FormLabel";
import Colors from "../constants/Colors";
import { Picker, PickerItem } from "./Picker";
import { FormGroup } from "./FormGroup";
import { RadioHorizontal, RadioItemHorizontal } from "./Radio";
import { AuthParams } from "../navigation/navigation-types";
import { SelectableText } from "./SortHeader";
import { usePostHog } from "posthog-react-native";

/** Solves the issue of really fast typing losing characters and cursor position */
const useOptimisticValueSyncedToParam = (
  paramName: keyof FeedQuery
): [string, (value: string) => void] => {
  const route = useRoute<RouteProp<AuthParams, "RoutedFeed" | "NamedFeed">>();
  const params = useMemo(() => route.params || {}, [route.params]);
  const navigation = useNavigation();
  const paramValue = params[paramName];
  const [value, setValue] = useState(
    paramValue || defaultFeedQueryValues[paramName] || ""
  );

  // Update both url and state
  const onChange = useCallback(
    async (newValue: string) => {
      const nextQuery = normalizeFeedQuery({
        ...params,
        [paramName]: newValue,
      });
      setValue(newValue || "");
      // await Router.isReady?
      // MUST BE awaited or get cursor bug
      if (route.name === "NamedFeed") {
        await navigation.navigate("Root", {
          screen: "Home",
          params: {
            screen: "RoutedFeed",
            params: nextQuery,
          },
        });
      } else {
        await navigation.setParams(
          feedQueryToFeedQueryWithAllKeysUsingUndefinedFallback(nextQuery)
        );
      }
    },
    [paramName, navigation, params, route.name]
  );

  useEffect(() => {
    if (value !== paramValue) {
      setValue(paramValue ?? "");
    }
  }, [paramValue, value]);

  // if query param changes from elsewhere, we want to set the value here again to make sure it's up to date
  // useEffect(() => {
  //   function routeChangeComplete(url, { shallow }) {
  //     // state changed from elsewhere
  //     if (shallow !== true) {
  //       const params = new URLSearchParams(url.replace("/", ""));
  //       const queryParam = params.get(paramName);
  //       if (queryParam !== value) setValue(queryParam);
  //     }
  //   }
  //   router.events.on("routeChangeComplete", routeChangeComplete);

  //   return () => router.events.off("routeChangeComplete", routeChangeComplete);
  // }, [paramName]);

  return [value, onChange];
};

const default_sql_query = `select * from casts order by custom_metrics->'custom_cast_metrics'->'hot' desc`;

function FeedAlgoEditor() {
  const route = useRoute<any>();
  const params = useMemo(() => route.params || {}, [route.params]);
  const navigation = useNavigation();
  const posthog = usePostHog();
  const {
    // query
    // q = defaultFeedQueryValues.q,
    // username
    // u = defaultFeedQueryValues.u,
    // algorithm
    a = defaultFeedQueryValues.a,
    // time start
    s = defaultFeedQueryValues.s,
    // time end
    e = defaultFeedQueryValues.e,
    // type of feed
    type = defaultFeedQueryValues.type,
    // // pageSize
    // n = defaultFeedQueryValues.n,
    // // p is missing intentionally since its not hard coded
    // /** decorative params */
    // // title
    // t = defaultFeedQueryValues.t,
    // pl = defaultFeedQueryValues.pl,
    // // about
    // d = defaultFeedQueryValues.d,
    // // big like
    // l = defaultFeedQueryValues.l,
    // // hide controls
    // h = defaultFeedQueryValues.h,
    // sql = defaultFeedQueryValues.sql,
  } = params;

  const [sql, setSql] = useOptimisticValueSyncedToParam("sql");
  const [q, setQ] = useOptimisticValueSyncedToParam("q");
  const [u, setU] = useOptimisticValueSyncedToParam("u");

  // FeedAlgoEditor
  const isSQLMode = !!sql;

  // console.log(sql, isSQLMode, params);

  async function updateQueryParams(object: object) {
    const nextQuery = normalizeFeedQuery({
      ...params,
      ...object,
    });
    navigation.setParams(
      feedQueryToFeedQueryWithAllKeysUsingUndefinedFallback(nextQuery)
    );
  }

  async function toggleSQL() {
    if (isSQLMode) {
      updateQueryParams({ sql: undefined });
    } else {
      updateQueryParams({
        sql: default_sql_query,
        q: undefined,
        u: undefined,
        e: undefined,
        s: undefined,
        a: undefined,
        n: undefined,
      });
    }
  }
  /** Hide the user's feed input unless the search query has this specified, to maintian compatibility with web */
  const [hasUsersFeedInput, setHasUsersFeedInput] = useState(!!u);
  useEffect(() => {
    if (u && !hasUsersFeedInput) {
      setHasUsersFeedInput(true);
    }
  }, [u, hasUsersFeedInput]);

  // useEffect(() => {
  //   navigation.setOptions({
  //     header: () => (

  //     ),
  //   })
  // }, [params, navigation, posthog])

  return (
    <View style={{ margin: 16, height: "100%" }}>
      <Pressable
        style={{ backgroundColor: Colors.indigo["700"], marginBottom: 20 }}
        textStyle={{ color: "white" }}
        size="lg"
        onPress={() => {
          posthog?.capture("feed_editor_show_results");
          navigation.navigate("Root", {
            screen: "Home",
            params: {
              screen: "RoutedFeed",
              params:
                feedQueryToFeedQueryWithAllKeysUsingUndefinedFallback(params),
            },
          });
        }}
      >
        Show results
      </Pressable>
      <ScrollView>
        {isSQLMode ? (
          <View>
            <View>
              <FormLabel>Write your SQL here...</FormLabel>
              <TextInput
                multiline
                value={sql}
                numberOfLines={10}
                style={{
                  height: 200,
                  borderRadius: 20,
                  padding: 20,
                  fontFamily: "SF-Pro-Rounded-Semibold",
                }}
                placeholder={`SELECT * from ${type}s WHERE ...`}
                onChangeText={(text) => setSql(text)}
              />
            </View>
            <VStack>
              <View>
                <Picker
                  selectedValue={type}
                  onValueChange={async (value) => {
                    await updateQueryParams({
                      type: value,
                    });
                  }}
                >
                  <PickerItem value="cast" label="Casts" />
                  <PickerItem value="profile" label="Profiles" />
                  <PickerItem value="cove" label="Coves" />
                  <PickerItem value="text" label="Text" />
                </Picker>
              </View>
            </VStack>
          </View>
        ) : (
          <View>
            <FormGroup>
              <View>
                <TextInput
                  autoFocus
                  style={{
                    fontSize: 17,
                    paddingVertical: 12,
                    fontFamily: "SF-Pro-Rounded-Semibold",

                    paddingHorizontal: 30,
                  }}
                  value={q}
                  placeholder={`Search ${type}s`}
                  onChangeText={setQ}
                />
              </View>
            </FormGroup>
            {hasUsersFeedInput && (
              <FormGroup>
                <View>
                  <FormLabel>See a user's feed</FormLabel>
                  <TextInput
                    value={u}
                    onChangeText={setU}
                    style={{ fontFamily: "SF-Pro-Rounded-Semibold" }}
                  />
                </View>
              </FormGroup>
            )}
            <FormGroup>
              <RadioHorizontal<"cast" | "profile">
                value={type}
                onChange={async (value) => {
                  await updateQueryParams({
                    type: value,
                  });
                }}
              >
                <RadioItemHorizontal value="cast">
                  <SelectableText>Casts</SelectableText>
                </RadioItemHorizontal>
                <RadioItemHorizontal value="profile">
                  <SelectableText>Profiles</SelectableText>
                </RadioItemHorizontal>
                <RadioItemHorizontal value="cove">
                  <SelectableText>Coves</SelectableText>
                </RadioItemHorizontal>
              </RadioHorizontal>
            </FormGroup>
            <FormGroup>
              <FormLabel>Algorithm</FormLabel>

              <Picker
                selectedValue={a}
                onValueChange={async (value) => {
                  await updateQueryParams({
                    a: value,
                  });
                }}
              >
                {type === "cast"
                  ? cast_sort_orders.map((item) => (
                      <PickerItem {...item} key={item.value} />
                    ))
                  : type === "profile"
                  ? profile_sort_orders.map((item) => (
                      <PickerItem {...item} key={item.value} />
                    ))
                  : type === "cove"
                  ? cove_sort_orders.map((item) => (
                      <PickerItem {...item} key={item.value} />
                    ))
                  : null}
              </Picker>
            </FormGroup>
            <FormGroup>
              <FormLabel>From</FormLabel>
              <Picker
                selectedValue={s && e ? "custom" : s}
                onValueChange={async (value) => {
                  if (value === "custom") {
                    const currentDate = `${new Date().getFullYear()}-${
                      String(new Date().getMonth()).length === 1
                        ? `0${new Date().getMonth()}`
                        : new Date().getMonth()
                    }-${
                      String(new Date().getDate()).length === 1
                        ? `0${new Date().getDate()}`
                        : new Date().getDate()
                    }T00:00`;
                    await updateQueryParams({
                      s: currentDate,
                      e: currentDate,
                    });
                  } else {
                    await updateQueryParams({
                      s: value === "undefined" ? "" : value,
                      e: "",
                    });
                  }
                }}
              >
                <PickerItem value="1h" label="Last hour" />
                <PickerItem value="6h" label="Last 6 hours" />
                <PickerItem value="today" label="Today" />
                <PickerItem value="24h" label="Last 24 hours" />
                <PickerItem value="168h" label="Last week" />
                <PickerItem value="672h" label="Last month" />
                <PickerItem value="alltime" label="All time" />
              </Picker>
            </FormGroup>
            {/* {e && (
                <View>
                  <FormLabel>Start date:</FormLabel>
                  <TextInput
                    value={s}
                    onChangeText={async (value) => {
                      await updateQueryParams({
                        s: value,
                      });
                    }}
                  />
                  <FormLabel>End date:</FormLabel>
                  <TextInput
                    value={e}
                    onChangeText={async (value) => {
                      await updateQueryParams({
                        e: value,
                      });
                    }}
                  />
                </View>
              )} */}
          </View>
        )}
      </ScrollView>
      <HStack
        _dark={{
          borderTopColor: Colors.dark.borderColor,
        }}
        _light={{
          borderTopColor: Colors.light.borderColor,
        }}
        style={{
          marginVertical: 20,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingHorizontal: 20,
        }}
      >
        <Pressable
          onPress={toggleSQL}
          _textDark={{
            color: Colors.dark.text,
          }}
          _textLight={{
            color: Colors.light.text,
          }}
          style={{ flexGrow: 1, backgroundColor: "transparent" }}
        >
          {isSQLMode ? "Visual" : "SQL Editor"}
        </Pressable>
        <Pressable
          onPress={() => {
            navigation.navigate("Root", {
              screen: "Home",
              params: {
                screen: "RoutedFeed",
                params: feedQueryToFeedQueryWithAllKeysUsingUndefinedFallback(
                  {}
                ),
              },
            });
          }}
          _textDark={{
            color: Colors.dark.text,
          }}
          _textLight={{
            color: Colors.light.text,
          }}
          style={{ flexGrow: 1, backgroundColor: "transparent" }}
        >
          Clear filters
        </Pressable>
      </HStack>
    </View>
  );
}

export function Filters() {
  const navigation = useNavigation();
  const route = useRoute();
  const posthog = usePostHog();

  return (
    <>
      <Pressable
        variant="transparent"
        onPress={() => {
          posthog?.capture("filters_button_pressed");
          navigation.navigate("Root", {
            screen: "Home",
            params: {
              screen: "FiltersModal",
              params: route.params ?? {},
            },
          });
        }}
      >
        Filter
      </Pressable>
    </>
  );
}

export function FiltersModal() {
  return <FeedAlgoEditor />;
}
