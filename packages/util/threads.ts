import { FCCast, OrderedThreadTree, ThreadTree } from "./types";

function findCastPathInTree(
  t: ThreadTree,
  merkleRoot: string,
  pathStack: string[]
): string[] | undefined {
  if (t.cast.hash === merkleRoot) {
    return pathStack;
  }
  pathStack.push(t.cast.hash);

  const children = Object.values(t.children || {});

  for (const node of children) {
    const result = findCastPathInTree(node, merkleRoot, [...pathStack]);
    if (result) return result;
  }
}

export function threadTreeToOrderedThreadTree(
  tree: ThreadTree
): OrderedThreadTree {
  function sortThreadTreeByCastRecur(treeRecur: ThreadTree): OrderedThreadTree {
    return {
      ...treeRecur,
      children: Object.values(treeRecur.children || {}).map(
        sortThreadTreeByCastRecur
      ),
    };
  }

  return sortThreadTreeByCastRecur(tree);
}

export function sortThreadTreeByCast({
  tree,
  castMerkleRootToPrioritize,
}: {
  tree: ThreadTree;
  castMerkleRootToPrioritize: string;
}): OrderedThreadTree {
  const castPath = findCastPathInTree(tree, castMerkleRootToPrioritize, []);

  // TODO: handle castpath undefined
  // if (!castPath) {
  //   return tree
  // }

  function sortThreadTreeByCastRecur(treeRecur: ThreadTree): OrderedThreadTree {
    return {
      ...treeRecur,
      children: Object.values(treeRecur.children || {})
        .sort((a, b) =>
          // sort author's casts chronologically to not break threads
          a.cast.author_fid === tree.cast.author_fid &&
          b.cast.author_fid === tree.cast.author_fid
            ? a.cast.published_at > b.cast.published_at
              ? 1
              : -1
            : castPath && castPath.includes(a.cast.hash)
            ? -1
            : castPath && castPath.includes(b.cast.hash)
            ? 1
            : // fallback to using popularity
              (b.cast.reactions || 0) - (a.cast.reactions || 0)
        )
        .map(sortThreadTreeByCastRecur),
    };
  }

  return sortThreadTreeByCastRecur(tree);
  // Move castPath forward
}

export function attachCastsToTree({
  casts,
  tree,
  threadMerkleRoot,
}: {
  casts: FCCast[];
  tree?: ThreadTree;
  threadMerkleRoot: string;
}): ThreadTree {
  let root: FCCast | null = null;
  const castParentMerkleRootMap: Record<string, FCCast[]> = {};
  // O(casts length) algorithm
  casts.forEach((cast) => {
    if (cast.hash === threadMerkleRoot) root = cast;
    if (
      cast.reply_parent_hash &&
      Array.isArray(castParentMerkleRootMap[cast.reply_parent_hash])
    )
      castParentMerkleRootMap[cast.reply_parent_hash].push(cast);
    else if (cast.reply_parent_hash)
      castParentMerkleRootMap[cast.reply_parent_hash] = [cast];
  });

  // Inconsistent tree, missing root node.
  if (!tree && !root) throw new Error("incomplete tree");

  let newTree: ThreadTree = tree || {
    cast: root!,
    children: {},
  };

  return buildChildren(newTree);

  function buildChildren(currentNode: ThreadTree): ThreadTree {
    const newChildren = currentNode.children || {};
    const currentCasts = castParentMerkleRootMap[currentNode.cast.hash] || [];
    currentCasts.forEach((cast) => {
      if (newChildren[cast.hash]) {
        // update cast with newest cast data
        newChildren[cast.hash].cast = cast;
      } else {
        // create new child
        newChildren[cast.hash] = { cast: cast, children: {} };
      }
    });

    return {
      cast: currentNode.cast,
      children: mapValues<ThreadTree, ThreadTree>(newChildren, buildChildren),
    };
  }
  // Index existing tree into treeNodeMap
}

function mapValues<T, Y>(
  obj: Record<string, T>,
  func: (t: T) => Y
): Record<string, Y> {
  return Object.entries(obj).reduce((prev, [key, value]) => {
    return { ...prev, [key]: func(value) };
  }, {});
}
