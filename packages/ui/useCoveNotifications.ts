import { useSWR } from "./useSwr";
import { API } from "@discove/util/types";
import { useCallback, useMemo } from "react";
import {
  useAppSharedSupabaseClient,
  useAppSharedSupabaseUser,
} from "./AppShared";

export function useCoveNotifications() {
  const user = useAppSharedSupabaseUser();

  const res = useSWR<API["/api/user/cove-notifications"]["GET"]>(
    user?.id ? `/api/user/cove-notifications` : null
  );

  const supabaseClient = useAppSharedSupabaseClient();

  const markRead = useCallback(
    async (feedname: string, username: string) => {
      async function markCoveNotifsRead() {
        if (!user?.id) return;
        const r = await supabaseClient
          .from("cove_favorites")
          .update({ last_read_notification_date: new Date().toISOString() })
          .eq("user_id", user.id);

        return r;
      }

      res.mutate((await markCoveNotifsRead()) as any, {
        optimisticData: [
          ...(res?.data?.filter(
            (el: {
              username: string;
              feedname: string;
              unread_count: number;
            }) => !(el.feedname === feedname && el.username === username)
          ) ?? []),
          { username, feedname, unread_count: 0 },
        ],
        rollbackOnError: true,
        populateCache: (_, d: any) => {
          return [
            ...(d?.filter(
              (el: {
                username: string;
                feedname: string;
                unread_count: number;
              }) => !(el.feedname === feedname && el.username === username)
            ) ?? []),
            { username, feedname, unread_count: 0 },
          ];
        },
        revalidate: false,
      });
    },
    [supabaseClient, user, res]
  );

  const value = useMemo(() => ({ ...res, markRead }), [res, markRead]);

  return value;
}
