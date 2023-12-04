import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Hub } from "@sentry/types";
import type {
  SupabaseClient,
  Session as SupabaseSession,
} from "@supabase/supabase-js";

type SentryInterface = Pick<Hub, "setUser" | "captureMessage"> & {
  captureException: (
    exception: any,
    context?: any
  ) => ReturnType<Hub["captureException"]>;
};

type AppShared = {
  supabaseSession: SupabaseSession | null;
  supabaseClient: SupabaseClient;
  sentry: SentryInterface;
  apiUrl: string;
};

const AppSharedContext = createContext<AppShared | null>(null);

const useContextAndAssert = (hookName: string) => {
  const context = useContext(AppSharedContext);
  if (!context) {
    throw new Error(
      "Please wrap your code with <AppSharedProvider></AppSharedProvider> before using " +
        hookName
    );
  }
  return context;
};

export const AppSharedProvider: React.FC<
  Omit<AppShared, "supabaseSession"> & {
    children: ReactNode;
    initialSession?: SupabaseSession | null;
  }
> = (props) => {
  const { children, supabaseClient, sentry, apiUrl, initialSession } = props;

  // Reimplements a part of @supabase/auth-helpers-react hooks
  // to make the code cleaner
  const [supabaseSession, setSupabaseSession] =
    useState<SupabaseSession | null>(initialSession ?? null);

  useEffect(() => {
    let mounted = true;

    async function getSession() {
      const { data, error } = await supabaseClient.auth.getSession();

      if (mounted) {
        if (error) {
          return;
        }
        setSupabaseSession(data.session);
      }
    }

    getSession();

    return () => {
      mounted = false;
    };
  }, [supabaseClient]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        setSupabaseSession(session);
      }

      if (event === "SIGNED_OUT") {
        setSupabaseSession(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseClient]);

  const value: AppShared = useMemo(
    () => ({
      supabaseSession,
      supabaseClient,
      sentry,
      apiUrl,
    }),
    [supabaseSession, supabaseClient]
  );

  return (
    <AppSharedContext.Provider value={value}>
      {children}
    </AppSharedContext.Provider>
  );
};

export const useAppSharedSupabaseClient = () => {
  const context = useContextAndAssert("useAppSharedSupabaseClient()");
  return context.supabaseClient;
};

export const useAppSharedSupabaseSession = () => {
  const context = useContextAndAssert("useAppSharedSupabaseSession()");
  return context.supabaseSession;
};

export const useAppSharedSupabaseUser = () => {
  const context = useContextAndAssert("useAppSharedSupabaseUser()");
  return context.supabaseSession?.user ?? null;
};

export const useAppSharedApiUrl = () => {
  const context = useContextAndAssert("useAppSharedApiUrl()");
  return context.apiUrl;
};

export const useAppSharedSentry = () => {
  const context = useContextAndAssert("useAppSharedSentry()");
  return context.sentry;
};
