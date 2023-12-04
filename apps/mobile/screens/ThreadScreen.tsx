import React, { useMemo, useState } from "react";
import useSWRLib from "swr";
import { ScrollView } from "react-native";
import { Thread } from "../components/Thread";
import { supabaseClient } from "../lib/supabase";
import { API } from "@discove/util/types";
import {
  attachCastsToTree,
  sortThreadTreeByCast,
  threadTreeToOrderedThreadTree,
} from "@discove/util/threads";
import { Text } from "../components/Text";
import { HomeTabScreenProps } from "../navigation/navigation-types";
import { useScrollViewScrollToItem } from "../hooks/useScrollViewScrollToItem";

export default function ThreadScreen(props: HomeTabScreenProps<"Thread">) {
  const castHash = props.route?.params?.castHash;
  const threadHash = props.route?.params?.threadHash;

  const { data, isValidating } = useSWRLib(
    threadHash ? `/api/threads/${threadHash}` : null,
    async (): Promise<
      API["/api/threads/:merkleRoot"]["GET"] | { casts: null }
    > => {
      const { data: casts } = await supabaseClient
        .from("casts")
        .select("*")
        .match({ thread_hash: threadHash });

      return {
        casts: casts as API["/api/threads/:merkleRoot"]["GET"]["casts"] | null,
      };
    },
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const [threadError, setThreadError] = useState<unknown | null>(null);

  const threadTree = useMemo(() => {
    try {
      return !threadHash || (isValidating && !data?.casts)
        ? undefined
        : castHash
        ? sortThreadTreeByCast({
            tree: attachCastsToTree({
              casts: data?.casts || [],
              threadMerkleRoot: threadHash,
            }),
            castMerkleRootToPrioritize: castHash,
          })
        : threadTreeToOrderedThreadTree(
            attachCastsToTree({
              casts: data?.casts || [],
              threadMerkleRoot: threadHash,
            })
          );
    } catch (err) {
      setThreadError(err);
    }
  }, [data, threadHash, castHash, isValidating]);

  const { scrollViewRef, itemOnLayout } = useScrollViewScrollToItem();

  if (!threadHash || threadError) {
    return <Text>{(threadError as any)?.message}</Text>;
  }

  if (!data?.casts) return null;

  return (
    <ScrollView ref={scrollViewRef}>
      <Thread
        isRoot
        threadTree={threadTree!}
        itemOnLayout={itemOnLayout}
        highlightCastMerkleRoot={castHash}
      />
    </ScrollView>
  );
}
