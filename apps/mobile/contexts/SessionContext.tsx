import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Session } from "@supabase/supabase-js";
import { supabaseClient } from "../lib/supabase";
import * as Linking from "expo-linking";
import { ActivityIndicator } from "react-native";
import { handleError } from "../lib/handleError";
import { usePostHog } from "posthog-react-native";

export type SessionContextType = {
  session: Session | null;
  setOtpEmail: Dispatch<SetStateAction<string | null>>;
  otpEmail: string | null;
};

export const useSession = () => {
  const { session } = useContext(SessionContext);
  return session;
};

export const useUser = () => {
  const { session } = useContext(SessionContext);
  return session?.user ?? null;
};

export const SessionContext = createContext<SessionContextType>({
  session: null,
  otpEmail: null,
  setOtpEmail: () => {},
});

type AuthStatus = "loading" | "not-loading";

export const SessionContextProvider: React.FC<{
  children: any;
}> = (props) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const url = Linking.useURL();

  useEffect(() => {
    if (url) extractSessionFromLink(url);
  }, [url]);

  const [session, setSession] = useState<Session | null>(null);

  const [loginError, setLoginError] = useState(false);
  const [otpEmail, setOtpEmail] = useState<string | null>(null);

  async function extractSessionFromLink(link: string) {
    try {
      let parsedURL = Linking.parse(link.replace("#", "?")!);

      // handleError({ message: JSON.stringify(parsedURL) });
      if (parsedURL.queryParams?.refresh_token && otpEmail) {
        await supabaseClient.auth.verifyOtp({
          type: "magiclink",
          email: otpEmail,
          token: String(parsedURL.queryParams?.access_token),
        });

        await supabaseClient.auth.setSession({
          access_token: String(parsedURL.queryParams?.access_token),
          refresh_token: String(parsedURL.queryParams?.refresh_token),
        });

        const {
          data: { session },
        } = await supabaseClient.auth.getSession();

        // handleError({ message: JSON.stringify(session) });

        setSession(session);
        setAuthStatus("not-loading");
        setLoginError(false);
      } else if (parsedURL.queryParams?.error_code) {
        handleError({
          // message: JSON.stringify(parsedURL),
          error: new Error(String(parsedURL.queryParams?.error_code)),
          extra: { description: parsedURL.queryParams?.error_description },
        });
        setLoginError(true);
      }
    } catch (err) {
      handleError({
        error: err instanceof Error ? err : new Error(JSON.stringify(err)),
      });
    }
  }

  useEffect(() => {
    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          extractSessionFromLink(url);
        } else {
          // Sentry.captureMessage("getInitialURL was falsy");
        }
      })
      .catch((err) => {
        handleError({ error: err });
      });

    function handler(res: { url: string }) {
      if (res.url) {
        extractSessionFromLink(res.url);
      } else {
        // handleError({ message: "url event listener was falsy" });
      }
    }

    const listener = Linking.addEventListener("url", handler);

    return () => {
      listener.remove();
    };
  }, []);

  useEffect(() => {
    supabaseClient.auth
      .getSession()
      .then(({ data: { session } }) => {
        // handleError({
        //   message: `getSession auth state change ${session?.user?.id}`,
        // });

        if (session) {
          setSession(session);
        }
        setAuthStatus("not-loading");
      })
      .catch((err) => {
        handleError({ error: err });
      });

    supabaseClient.auth.onAuthStateChange((_event, newSession) => {
      // handleError({ message: `auth state change ${newSession?.user?.id}` });
      if (!session && newSession) {
        setSession(newSession);
      } else if (session && !newSession) {
        // logout
        setSession(newSession);
      }
      setAuthStatus("not-loading");
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      session,
      otpEmail,
      setOtpEmail,
    }),
    [session, setOtpEmail, otpEmail]
  );

  const posthog = usePostHog();

  useEffect(() => {
    if (session) posthog?.capture("new-session-on-mobile");
  }, [session]);

  return (
    <SessionContext.Provider value={contextValue}>
      {authStatus === "loading" ? <ActivityIndicator /> : props.children}
    </SessionContext.Provider>
  );
};
