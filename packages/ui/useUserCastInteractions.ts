import { useMemo } from "react";
import { SWRResponse } from "swr";

import { API, APIError } from "@discove/util/types";
import {
  fcFollow,
  fcLike,
  fcRecast,
  fcUnfollow,
  fcUnlike,
  fcUnrecast,
} from "./farcasterActions";
import { useSWR } from "./useSwr";
import { useFarcasterIdentity } from "./useFarcasterIdentity";
import {
  useAppSharedApiUrl,
  useAppSharedSentry,
  useAppSharedSupabaseClient,
  useAppSharedSupabaseUser,
} from "./AppShared";

const defaultEmptyState: API["/api/fc/interactions"]["GET"] = {
  allRecastHashes: [],
  allFollowers: [],
  allLikeHashes: [],
  allFollowing: [],
  allMutes: [],
  allBookmarks: [],
};

export function useUserCastsInteractions(): SWRResponse<
  API["/api/fc/interactions"]["GET"],
  APIError
> {
  const { username, has_signed } = useFarcasterIdentity();

  const swrRes = useSWR<API["/api/fc/interactions"]["GET"]>(
    username && has_signed ? `/api/fc/interactions` : null,
    {
      // refreshInterval: 60_000,
      revalidateOnMount: true,
      revalidateOnFocus: true,
    }
  );

  return swrRes;
}

export function useUserProfileInteractions(targetFid: number): {
  isFollowing: boolean | undefined;
  isFollowedBy: boolean | undefined;
  isMuted: boolean | undefined;
  follow: () => Promise<void>;
} {
  const { data, mutate } = useUserCastsInteractions();
  const supabaseClient = useAppSharedSupabaseClient();
  const apiUrl = useAppSharedApiUrl();

  return useMemo(() => {
    const isMuted = data?.allMutes?.includes(targetFid);
    const isFollowing = data?.allFollowing?.includes(targetFid);
    const isFollowedBy = data?.allFollowers?.includes(targetFid);

    return {
      isFollowing,
      isMuted,
      isFollowedBy,
      follow: async () => {
        if (!isFollowing)
          await mutate(fcFollow(supabaseClient, apiUrl, { targetFid }) as any, {
            optimisticData: {
              ...defaultEmptyState,
              ...data,
              allFollowing: [...(data?.allFollowing || []), targetFid],
            },
            rollbackOnError: true,
            populateCache: (_, d: any) => {
              return {
                ...d,
                allFollowing: [...(d?.allFollowing || []), targetFid],
              };
            },
            revalidate: false,
          });
        else
          await mutate(
            fcUnfollow(supabaseClient, apiUrl, { targetFid }) as any,
            {
              optimisticData: {
                ...defaultEmptyState,
                ...data,
                allFollowing: (data?.allFollowing || []).filter(
                  (x: number) => x !== targetFid
                ),
              },
              rollbackOnError: true,
              populateCache: (_, d: any) => {
                return {
                  ...d,
                  allFollowing: (d?.allFollowing || []).filter(
                    (x: number) => x !== targetFid
                  ),
                };
              },
              revalidate: false,
            }
          );
      },
    };
  }, [data, targetFid, mutate]);
}

export function useUserCastInteractions(
  castHash: string,
  castAuthorFid: number | null
): {
  hasLiked: boolean;
  hasRecast: boolean;
  hasBookmarked: boolean;
  bookmark: () => void;
  like: () => void;
  recast: () => void;
} {
  const { data, mutate } = useUserCastsInteractions();
  const supabaseClient = useAppSharedSupabaseClient();
  const apiUrl = useAppSharedApiUrl();
  const user = useAppSharedSupabaseUser();
  const sentry = useAppSharedSentry();
  const { fid } = useFarcasterIdentity();

  return useMemo(() => {
    const hasLiked = (data?.allLikeHashes || [])?.includes(castHash);
    const hasRecast = (data?.allRecastHashes || [])?.includes(castHash);
    const hasBookmarked = (data?.allBookmarks || [])?.includes(castHash);
    return {
      hasLiked: hasLiked,
      hasRecast: hasRecast,
      hasBookmarked: hasBookmarked,
      bookmark: async () => {
        if (!user?.id) return;
        if (!hasBookmarked)
          await mutate(
            async () => {
              const { error } = await supabaseClient.from("bookmarks").insert({
                user_id: user?.id,
                cast_hash: castHash,
              });

              if (error) {
                console.log(error);
                sentry.captureException(error);
              }

              return {
                ...defaultEmptyState,
                ...data,
                allBookmarks: [...(data?.allBookmarks || []), castHash],
              };
            },
            {
              optimisticData: {
                ...defaultEmptyState,
                ...data,
                allBookmarks: [...(data?.allBookmarks || []), castHash],
              },
              rollbackOnError: true,
              populateCache: (_, d: any) => {
                return {
                  ...d,
                  allBookmarks: [...(d?.allBookmarks || []), castHash],
                };
              },
              revalidate: false,
            }
          );
        else
          await mutate(
            async () => {
              const { error } = await supabaseClient
                .from("bookmarks")
                .delete()
                .eq("user_id", user?.id)
                .eq("cast_hash", castHash);

              if (error) {
                console.log(error);
                sentry.captureException(error);
              }

              return {
                ...defaultEmptyState,
                ...data,
                allBookmarks: (data?.allBookmarks || []).filter(
                  (x: string) => x !== castHash
                ),
              };
            },
            {
              optimisticData: {
                ...defaultEmptyState,
                ...data,
                allBookmarks: (data?.allBookmarks || []).filter(
                  (x: string) => x !== castHash
                ),
              },
              rollbackOnError: true,
              populateCache: (_, d: any) => {
                return {
                  ...d,
                  allBookmarks: (d?.allBookmarks || []).filter(
                    (x: string) => x !== castHash
                  ),
                };
              },
              revalidate: false,
            }
          );
      },
      like: async () => {
        if (!fid || !castAuthorFid) return;
        if (!hasLiked)
          await mutate(
            fcLike(supabaseClient, apiUrl, {
              castHash,
              castAuthorFid,
              fid,
            }) as any,
            {
              optimisticData: {
                ...defaultEmptyState,
                ...data,
                allLikeHashes: [...(data?.allLikeHashes || []), castHash],
              },
              rollbackOnError: true,
              populateCache: (_, d: any) => {
                return {
                  ...d,
                  allLikeHashes: [...(d?.allLikeHashes || []), castHash],
                };
              },
              revalidate: false,
            }
          );
        else
          await mutate(
            fcUnlike(supabaseClient, apiUrl, {
              castHash,
              castAuthorFid,
              fid,
            }) as any,
            {
              optimisticData: {
                ...defaultEmptyState,
                ...data,
                allLikeHashes: (data?.allLikeHashes || []).filter(
                  (x: string) => x !== castHash
                ),
              },
              rollbackOnError: true,
              populateCache: (_, d: any) => {
                return {
                  ...d,
                  allLikeHashes: (d?.allLikeHashes || []).filter(
                    (x: string) => x !== castHash
                  ),
                };
              },
              revalidate: false,
            }
          );
      },
      recast: async () => {
        if (!fid || !castAuthorFid) return;

        if (!hasRecast)
          await mutate(
            fcRecast(supabaseClient, apiUrl, {
              castHash: castHash,
              castAuthorFid: castAuthorFid,
              fid,
            }) as any,
            {
              optimisticData: {
                ...defaultEmptyState,
                ...data,
                allRecastHashes: [...(data?.allRecastHashes || []), castHash],
              },
              rollbackOnError: true,
              populateCache: (_, d: any) => {
                return {
                  ...d,
                  allRecastHashes: [...(d?.allRecastHashes || []), castHash],
                };
              },
              revalidate: false,
            }
          );
        else
          await mutate(
            fcUnrecast(supabaseClient, apiUrl, {
              castAuthorFid: castAuthorFid,
              fid: fid,
              castHash: castHash,
            }) as any,
            {
              optimisticData: {
                ...defaultEmptyState,
                ...data,
                allRecastHashes: (data?.allRecastHashes || []).filter(
                  (x: string) => x !== castHash
                ),
              },
              rollbackOnError: true,
              populateCache: (_, d: any) => {
                return {
                  ...d,
                  allRecastHashes: (d?.allRecastHashes || []).filter(
                    (x: string) => x !== castHash
                  ),
                };
              },
              revalidate: false,
            }
          );
      },
    };
  }, [data, castHash, user?.id, supabaseClient, castAuthorFid, fid, mutate]);
}
