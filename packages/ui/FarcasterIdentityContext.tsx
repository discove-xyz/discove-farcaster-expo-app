import React, { createContext, ReactNode, useCallback, useMemo } from "react";
import useSWR from "swr";
import {
  useAppSharedSentry,
  useAppSharedSupabaseClient,
  useAppSharedSupabaseUser,
} from "./AppShared";

export type FarcasterIdentityContext = {
  isLoading: boolean;
  username: string | null;
  has_signed: boolean | null;
  fid: number | null;
  revalidate: () => void;
};

export const FarcasterIdentityContext = createContext<FarcasterIdentityContext>(
  {
    isLoading: true,
    username: null,
    has_signed: null,
    fid: null,
    revalidate: () => null,
  }
);

export const FarcasterIdentityContextProvider: React.FC<{
  children: ReactNode;
}> = (props) => {
  const user = useAppSharedSupabaseUser();
  const sentry = useAppSharedSentry();
  const supabaseClient = useAppSharedSupabaseClient();

  const supabaseFetcher = useCallback(async () => {
    if (!user?.id) {
      return {
        username: null,
        fid: null,
        has_signed: null,
      };
    }

    const { data, error } = await supabaseClient
      .from("farcaster_signers")
      .select("username, fid, has_signed")
      .match({ user_id: user?.id })
      .limit(1);
    if (error) {
      sentry.captureException(error);
    }
    if (data && data.length !== 0) {
      return {
        username: data[0]!.username,
        has_signed: data[0]!.has_signed,
        fid: Number(data[0]!.fid),
      };
    } else {
      return {
        username: null,
        fid: null,
        has_signed: null,
      };
    }
  }, [supabaseClient, user]);

  const {
    data: value,
    isValidating: isLoading,
    mutate,
  } = useSWR<Pick<FarcasterIdentityContext, "username" | "has_signed" | "fid">>(
    `/supabase/farcaster-identity/${user?.id}`,
    supabaseFetcher,
    {
      fallback: {
        isLoading: true,
        username: null,
        has_signed: null,
        fid: null,
      },
    }
  );

  const contextValue = useMemo(
    () => ({
      has_signed: value?.has_signed ?? null,
      fid: value?.fid ?? null,
      username: value?.username ?? null,
      isLoading,
      revalidate: mutate,
    }),
    [value, isLoading, mutate]
  );

  return (
    <FarcasterIdentityContext.Provider value={contextValue}>
      {props.children}
    </FarcasterIdentityContext.Provider>
  );
};
