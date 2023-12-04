import React, {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { CoveFavorite } from "@discove/util/types";
import {
  useAppSharedSentry,
  useAppSharedSupabaseClient,
  useAppSharedSupabaseUser,
} from "./AppShared";

export type FavoriteContext = {
  favoritedCoves: CoveFavorite[];
  revalidate: () => void;
};

export const FavoriteContext = createContext<FavoriteContext>({
  favoritedCoves: [],
  revalidate: () => {},
});

export const FavoriteContextProvider: React.FC<{
  children: ReactNode;
}> = (props) => {
  const [favoritedCoves, setFavoritedCoves] = useState<CoveFavorite[]>([]);
  const user = useAppSharedSupabaseUser();
  const supabaseClient = useAppSharedSupabaseClient();
  const sentry = useAppSharedSentry();

  const fetchFavoritedCoves = useCallback(async () => {
    const { data, error } = await supabaseClient
      .from("cove_favorites")
      .select()
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (error) {
      sentry.captureException(error);
    }

    if (Array.isArray(data) && data) setFavoritedCoves(data);
  }, [supabaseClient, user?.id]);

  useEffect(() => {
    if (user) fetchFavoritedCoves();
  }, [user, fetchFavoritedCoves]);

  const contextValue = useMemo(
    () => ({
      favoritedCoves: favoritedCoves,
      revalidate: fetchFavoritedCoves,
    }),
    [favoritedCoves, fetchFavoritedCoves]
  );

  return (
    <FavoriteContext.Provider value={contextValue}>
      {props.children}
    </FavoriteContext.Provider>
  );
};
