import React from "react";
import { API, OrderedThreadTree } from "@discove/util/types";
import { CastItem } from "./CastItem";
import { useFarcasterIdentity } from "@discove/ui/useFarcasterIdentity";
import { useSWR } from "@discove/ui/useSwr";
import { LayoutChangeEvent, View } from "react-native";
import Colors from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";

/**
 * Render a thread,
 * with the consideration that threads can be really long and in the future we want our api to be able to lazy load and not load parts of the
 * thread.
 *
 * Replies are a tree, and we can rebuild the tree by using the reply_parent_hash parent pointers
 *
 * The minimal information needed to render the UI is for each node currently loaded in the tree, how many reply children does it have?
 * We have this information via replies.
 *
 * Must have full chain from each loaded node to the thread root
 *
 **/
export const Thread = (props: {
  threadTree: OrderedThreadTree;
  highlightCastMerkleRoot?: string;
  itemOnLayout: ((event: LayoutChangeEvent) => void) | undefined;
  isRoot?: boolean;
}) => {
  const colorScheme = useColorScheme();
  const { username } = useFarcasterIdentity();
  const { data: myPlugins } = useSWR<API["/api/plugins/:username"]["GET"]>(
    username ? `/api/plugins/${username}` : null
  );

  const shouldHighlight =
    props.highlightCastMerkleRoot === props.threadTree.cast.hash &&
    !props.isRoot;

  return (
    <>
      <CastItem
        plugins={myPlugins?.plugins}
        itemOnLayout={shouldHighlight ? props.itemOnLayout : () => null}
        cast={props.threadTree.cast}
        hideReplyTo
        isThreadPage
        // priorityImageRender
        // noBorderBottom
        fullPageMode
      />

      <View
        style={{
          borderLeftWidth: 3,
          borderLeftColor:
            colorScheme === "dark"
              ? Colors.whiteAlpha["300"]
              : Colors.blackAlpha["300"],
        }}
      >
        {!props.threadTree.children
          ? null
          : props.threadTree.children
              .filter(
                (childCast) =>
                  childCast.cast.author_fid !== props.threadTree.cast.author_fid
              )
              .map((childCast) => (
                <Thread
                  itemOnLayout={props.itemOnLayout}
                  threadTree={childCast}
                  key={childCast.cast.hash}
                  highlightCastMerkleRoot={props.highlightCastMerkleRoot}
                />
              ))}
      </View>
      {
        // Show self replies without indenting
        (props.threadTree.children || [])
          .filter(
            (childCast) =>
              childCast.cast.author_fid === props.threadTree.cast.author_fid
          )
          .map((childCast) => (
            <Thread
              itemOnLayout={props.itemOnLayout}
              threadTree={childCast}
              key={childCast.cast.hash}
              highlightCastMerkleRoot={props.highlightCastMerkleRoot}
            />
          ))
      }
    </>
  );
};
