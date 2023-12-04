import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView } from "react-native";
import Colors from "../constants/Colors";
import { config } from "../lib/config";
import { HomeTabScreenProps } from "../navigation/navigation-types";
import { fetchWithSupabaseAuth } from "@discove/ui/farcasterActions";
import { useSWR } from "@discove/ui/useSwr";
import { useFarcasterIdentity } from "@discove/ui/useFarcasterIdentity";
import { normalizeFeedQuery } from "@discove/util/params";
import { API, defaultFeedQueryValues } from "@discove/util/types";
import AccordionListItem from "./Accordion";
import { Checkbox } from "./Checkbox";
import { DropDownPicker } from "./DropdownPicker";
import { FormGroup } from "./FormGroup";
import { FormLabel } from "./FormLabel";
import { Pressable } from "./Pressable";
import { HStack } from "./Stack";
import { Text } from "./Text";
import { TextInput } from "./TextInput";
import { View } from "./View";
import { useAppSharedSupabaseClient } from "@discove/ui/AppShared";

const username_regex = /^[a-zA-Z][a-zA-Z0-9-]{1,25}$/gi;

function createSlugCandidateFromSeed(q: string): string {
  if (username_regex.test(q)) return q;

  const newCandidate = q
    .replaceAll(" ", "-")
    .replaceAll(/[^a-zA-Z0-9-]+/gi, "")
    .slice(0, 24);
  if (username_regex.test(newCandidate)) {
    return newCandidate;
  }

  return "";
}

export function SaveCoveForm({
  route,
  navigation,
}: HomeTabScreenProps<"SaveCoveForm">) {
  const params = route.params || {};
  const {
    a = defaultFeedQueryValues.a,
    // time start
    s = defaultFeedQueryValues.s,
    // time end
    e = defaultFeedQueryValues.e,
    // type of feed
    type = defaultFeedQueryValues.type,
    // pageSize
    n = defaultFeedQueryValues.n,
    // p is missing intentionally since its not hard coded
    /** decorative params */
    // title
    t = defaultFeedQueryValues.t,
    pl = defaultFeedQueryValues.pl,
    // about
    d = defaultFeedQueryValues.d,
    // big like
    l = defaultFeedQueryValues.l,
    // hide controls
    h = defaultFeedQueryValues.h,
    q = defaultFeedQueryValues.q,
    sql = defaultFeedQueryValues.sql,
    u = defaultFeedQueryValues.u,
    // sql = defaultFeedQueryValues.sql,
  } = params;
  const { username } = useFarcasterIdentity();
  const { data: userPlugins } = useSWR<API["/api/plugins/:username"]["GET"]>(
    username ? `/api/plugins/${username}` : null
  );
  const { data } = useSWR<API["/api/plugins"]["GET"]>(`/api/plugins`);
  const supabaseClient = useAppSharedSupabaseClient();
  const [title, setTitle] = useState(t || q);
  const [description, setDescription] = useState(d);
  const slugCandidate = createSlugCandidateFromSeed(q);
  const [feedname, setFeedname] = useState<string>(
    (params?.feedname as string) || slugCandidate || ""
  );
  const [pluginsPickerOpen, setPluginsPickerOpen] = useState(false);
  const [enabled_plugins, set_enabled_plugins] = useState<string[]>(
    (pl as string).split(",").filter((truthy) => truthy) || []
  );
  const [bigLike, setBigLike] = useState(l === "1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hideFilters, setHideFilters] = useState(h ? h === "0" : true);

  const handleSaveCove = useCallback(() => {
    const formattedFeedQuery = {
      // String(null) => 'null'
      q: String(q || ""),
      u: String(u || ""),
      a: String(a || ""),
      s: String(s || ""),
      pl: enabled_plugins.join(","),
      type: String(type || ""),
      e: String(e || ""),
      d: String(description || ""),
      n: String(n || ""),
      sql: String(sql || ""),
      t: String(title || ""),
      l: bigLike ? "1" : "0",
      h: hideFilters ? "1" : "0",
    };

    if (typeof feedname !== "string" || typeof username !== "string") {
      Alert.alert("Please enter a Cove URL");
      return;
    }
    if (!/^[a-zA-Z][a-zA-Z0-9-]{1,25}$/g.test(feedname)) {
      Alert.alert(
        "Cove URL must start with a letter, and only contain letters, numbers or dashes, and up to 25 characters"
      );
      return;
    }

    const saveCove = async () => {
      setIsSubmitting(true);
      const res = await fetchWithSupabaseAuth(
        supabaseClient,
        `${config.apiUrl}/api/feeds/new`,
        {
          method: "POST",
          body: JSON.stringify({
            username,
            feedname,
            // don't normalize here incase we change the normalization defaults
            config: formattedFeedQuery,
          }),
        }
      );

      if (res.status !== 200) {
        console.error(
          `failed to create feed ${feedname}, status ${res.status}`
        );
        // Needed to close the modal
        navigation.goBack();
        navigation.navigate(
          "RoutedFeed",
          normalizeFeedQuery(formattedFeedQuery)
        );
        return;
      }

      console.debug(`successfully created feed ${feedname}`);
      setIsSubmitting(false);

      // Needed to close the modal
      navigation.goBack();
      navigation.navigate("NamedFeed", { username, feedname });
    };

    saveCove().catch((err) => {
      console.error("unexpected save cove error", err);
      setIsSubmitting(false);

      // Needed to close the modal
      navigation.goBack();
      navigation.navigate("RoutedFeed", normalizeFeedQuery(formattedFeedQuery));
    });
  }, [
    supabaseClient,
    feedname,
    navigation,
    username,
    a,
    bigLike,
    description,
    e,
    enabled_plugins,
    hideFilters,
    n,
    q,
    s,
    sql,
    title,
    type,
    u,
  ]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={handleSaveCove}
          variant={"solid"}
          size="md"
          color="white"
          disabled={isSubmitting}
          backgroundColor={Colors.indigo["600"]}
        >
          {isSubmitting ? (
            <View
              style={{
                display: "flex",
                gap: 5,

                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator style={{ marginTop: 5 }} size="small" />
              {/* <Text>Creating</Text> */}
            </View>
          ) : params?.feedname ? (
            "Save"
          ) : (
            "Create"
          )}
        </Pressable>
      ),
    });
  }, [handleSaveCove, isSubmitting, navigation, params?.feedname]);

  const items = useMemo(() => {
    return [
      ...(userPlugins?.plugins.map((plugin) => ({
        value: `${plugin.username}/${plugin.slug}`,
        label: `${plugin.username}/${plugin.slug} ${plugin.name}`,
      })) || []),
      ...(data?.plugins
        .filter((plugin) => plugin.username !== username)
        .map((plugin) => ({
          value: `${plugin.username}/${plugin.slug}`,
          label: `${plugin.username}/${plugin.slug} ${plugin.name}`,
        })) || []),
    ];
  }, [data?.plugins, userPlugins?.plugins, username]);

  return (
    <ScrollView style={{ margin: 16 }}>
      <FormGroup>
        <FormLabel>
          Title <Text style={{ color: Colors.indigo["600"] }}>*</Text>
        </FormLabel>
        <TextInput
          style={{ fontFamily: "SF-Pro-Rounded-Semibold" }}
          value={title}
          placeholder="A short descriptive name"
          onChangeText={(text) => setTitle(text)}
        />
      </FormGroup>
      {username && (
        <FormGroup>
          <FormLabel>
            Cove URL <Text style={{ color: Colors.indigo["600"] }}>*</Text>
          </FormLabel>
          <HStack style={{ alignItems: "center" }}>
            <Text>discove.xyz/@{username}/</Text>
            <TextInput
              style={{ flexGrow: 1, fontFamily: "SF-Pro-Rounded-Semibold" }}
              value={feedname}
              placeholder="put-a-title-like-this"
              onChangeText={(text) => setFeedname(text)}
              autoCapitalize="none"
            />
          </HStack>
        </FormGroup>
      )}

      <FormGroup>
        <FormLabel>Description</FormLabel>
        <TextInput
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={{
            paddingTop: 12,
            fontFamily: "SF-Pro-Rounded-Semibold",
          }}
          value={description}
          placeholder="What kind of things are in this Cove?"
          onChangeText={(text) => setDescription(text)}
        />
      </FormGroup>

      <AccordionListItem title={"Advanced options"}>
        <View style={{ padding: 16 }}>
          <FormGroup>
            <HStack>
              <Checkbox
                value={hideFilters}
                onValueChange={(value) => setHideFilters(value)}
              />
              <Text onPress={() => setHideFilters(!hideFilters)}>
                Hide the search filters from the top of your cove
              </Text>
            </HStack>
          </FormGroup>
          <FormGroup>
            <HStack>
              <Checkbox
                value={bigLike}
                onValueChange={(value) => setBigLike(value)}
              />
              <Text onPress={() => setBigLike(!bigLike)}>
                Make the like button for items big
              </Text>
            </HStack>
          </FormGroup>
          <FormGroup>
            <FormLabel>Plugins (optional)</FormLabel>
            <DropDownPicker
              listMode="MODAL"
              open={pluginsPickerOpen}
              setOpen={setPluginsPickerOpen}
              multiple={true}
              modalTitle="Select any plugins you want to use"
              placeholder="Select any plugins you want to use"
              items={items}
              // name="enabled_plugins"
              value={enabled_plugins.map((plugin) => plugin) || []}
              setValue={set_enabled_plugins}
              // onChangeValue={(v) =>
              //   set_enabled_plugins((v || []).map((x) => String(x)))
              // }
            />
            <Text style={{ paddingVertical: 8 }}>
              Plugins extend the way items in your feed look and bring
              interactivity.
            </Text>
          </FormGroup>
        </View>
      </AccordionListItem>
    </ScrollView>
  );
}
