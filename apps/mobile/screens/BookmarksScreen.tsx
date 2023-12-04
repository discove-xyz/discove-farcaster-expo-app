import React, { useRef } from "react";
import { useSWR } from "@discove/ui/useSwr";
import { CastItem } from "../components/CastItem";
import { HomeTabScreenProps } from "../navigation/navigation-types";
import { API, FCCast } from "@discove/util/types";
import { View } from "../components/View";
import { FlashList } from "@shopify/flash-list";
import { useUserCastsInteractions } from "@discove/ui/useUserCastInteractions";
import { useSessionContext } from "../lib/supabase";
import { useFarcasterIdentity } from "@discove/ui/useFarcasterIdentity";
import useSWRLib from "swr";
import { useScrollToTop } from "@react-navigation/native";

export default function BookmarksScreen(
  props: HomeTabScreenProps<"Bookmarks">
) {
  const { data: interactions } = useUserCastsInteractions();
  const { supabaseClient } = useSessionContext();
  const { username } = useFarcasterIdentity();

  const { data: userPlugins } = useSWR<API["/api/plugins/:username"]["GET"]>(
    username ? `/api/plugins/${username}` : null
  );

  // Fixme: should sort by bookmark order (client side) rather than cast date order
  const { data, isValidating } = useSWRLib(
    interactions?.allBookmarks?.length ? "/bookmarks" : null,
    async () => {
      const { data: casts } = await supabaseClient
        .from("casts")
        .select("*")
        .in("hash", interactions?.allBookmarks ?? [])
        .order("published_at", { ascending: false });

      return {
        casts: casts as API["/api/threads/:merkleRoot"]["GET"]["casts"] | null,
      };
    },
    {
      revalidateOnMount: true,
    }
  );

  const ref = useRef<FlashList<any>>(null);

  // on home tab press, this will make sure that it scrolls to the top of the feed automatically.
  useScrollToTop(ref as any);

  return (
    <View>
      <View style={{ width: "100%", minHeight: "100%" }}>
        <FlashList
          ref={ref}
          estimatedItemSize={100}
          data={data?.casts}
          renderItem={({ item }) => {
            return <CastItem cast={item} plugins={userPlugins?.plugins} />;
          }}
          // Must not be undefined, or it will crash
          keyExtractor={(res: any): string => res?.hash || res.id || ""}
        />
      </View>
    </View>
  );
}
