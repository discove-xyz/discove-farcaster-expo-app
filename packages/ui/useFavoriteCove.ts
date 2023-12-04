import { useFavoritedCoves } from "./useFavoritedCoves";
import { useMemo, useCallback } from "react";
import { CoveFavorite } from "@discove/util/types";
import {
  useAppSharedSentry,
  useAppSharedSupabaseClient,
  useAppSharedSupabaseUser,
} from "./AppShared";

export const useFavoriteCove = (
  username?: string | null,
  feedname?: string | null
): {
  isFavorited: boolean;
  favorite: null | CoveFavorite;
  subscribeToNotifications: (
    username?: string,
    feedname?: string,
    isSubscribedOverride?: boolean
  ) => void;
  favoriteCove: (
    title: string,
    username?: string,
    feedname?: string,
    isFavoritedOverride?: boolean
  ) => void;
} => {
  const { favoritedCoves, revalidate } = useFavoritedCoves();
  const user = useAppSharedSupabaseUser();
  const isSubscribed = favoritedCoves.find(
    (cove) => cove.feedname === feedname && username === cove.username
  )?.subscribed_to_notifications;
  const isFavorited = favoritedCoves.some(
    (cove) => cove.feedname === feedname && username === cove.username
  );
  const favorite =
    favoritedCoves.find(
      (cove) => cove.feedname === feedname && username === cove.username
    ) ?? null;
  const supabaseClient = useAppSharedSupabaseClient();
  const sentry = useAppSharedSentry();
  const subscribeToNotifications = useCallback(
    async (
      usernameOverride?: string,
      feednameOverride?: string,
      isSubscribedOverride?: boolean
    ) => {
      if (!user) return;
      const { error, data } = await supabaseClient
        .from("cove_favorites")
        .update({
          subscribed_to_notifications: !(isSubscribedOverride ?? isSubscribed),
        })
        .eq("user_id", user?.id)
        .eq("feedname", feednameOverride || feedname)
        .eq("username", usernameOverride || username);

      if (error) {
        console.log(error);
        sentry.captureException(error);
      }

      await revalidate();
    },
    [user, isSubscribed, supabaseClient]
  );
  const favoriteCove = useCallback(
    async (
      title: string,
      usernameOverride?: string,
      feednameOverride?: string,
      isFavoritedOverride?: boolean
    ) => {
      if (!user) return;
      if (isFavoritedOverride ?? isFavorited) {
        const { error } = await supabaseClient
          .from("cove_favorites")
          .delete()
          .eq("user_id", user?.id)
          .eq("feedname", feednameOverride || feedname)
          .eq("username", usernameOverride || username);

        if (error) {
          sentry.captureException(error);
        }
      } else {
        const { error } = await supabaseClient.from("cove_favorites").insert({
          user_id: user.id,
          feedname: feednameOverride || feedname!,
          username: usernameOverride || username!,
          title,
        });

        if (error) {
          sentry.captureException(error);
        }
      }

      await revalidate();
    },
    [feedname, username, revalidate, isFavorited, supabaseClient, user]
  );

  const value = useMemo(
    () => ({
      isFavorited: isFavorited,
      favoriteCove: favoriteCove,
      favorite: favorite,
      subscribeToNotifications: subscribeToNotifications,
    }),
    [isFavorited, favoriteCove, subscribeToNotifications, favorite]
  );

  return value;
};
