import { useCallback } from "react";
import { mutate } from "swr";
import { fetchWithSupabaseAuth } from "./farcasterActions";
import { API } from "@discove/util/types";
import {
  useAppSharedApiUrl,
  useAppSharedSentry,
  useAppSharedSupabaseClient,
} from "./AppShared";

export const useMutateUnreadNotifications = () => {
  const supabaseClient = useAppSharedSupabaseClient();
  const apiUrl = useAppSharedApiUrl();
  const sentry = useAppSharedSentry();

  return useCallback(
    async (data: API["/api/fc/notifications"]["GET"] | undefined) => {
      try {
        await fetchWithSupabaseAuth(
          supabaseClient,
          `${apiUrl}/api/fc/mark-notifs-read`,
          {
            method: "POST",
            body: JSON.stringify({}),
          }
        );
      } catch (err) {
        sentry.captureException(err);
      }

      mutate(
        `/api/fc/notifications`,
        {
          notifications: [],
          ...data,
          unread_count: 0,
        },
        {
          optimisticData: {
            notifications: [],
            ...data,
            unread_count: 0,
          },
          rollbackOnError: true,
          populateCache: (_, d) => {
            return {
              notifications: [],
              ...data,
              ...d,
              unread_count: 0,
            };
          },
          revalidate: false,
        }
      );
    },
    [supabaseClient, apiUrl, sentry]
  );
};
