import { useEffect } from "react";
import { useFarcasterIdentity } from "@discove/ui/useFarcasterIdentity";
import { Sentry } from "../lib/sentry";
import { usePostHog } from "posthog-react-native";
import { useSession } from "../contexts/SessionContext";

/** Use once in the app to make sure posthog and sentry's identification works **/
export function usePosthogIdentify() {
  const posthog = usePostHog();
  const { username, isLoading, fid } = useFarcasterIdentity();
  const session = useSession();

  useEffect(() => {
    if (!isLoading && session?.user) {
      if (username) {
        Sentry.setUser({ username: username, id: session.user.id });
        posthog?.identify(session.user.id, { username, fid });
      } else {
        Sentry.setUser({ id: session?.user.id });
        posthog?.identify(session.user.id, {
          username,
          fid,
          user_type: "unverified",
        });
      }
    }
  }, [username, isLoading, fid, session, posthog]);
}
