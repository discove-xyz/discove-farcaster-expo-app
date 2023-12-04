import React, { Children } from "react";
import { PostHogProvider } from "posthog-react-native";
import { config } from "../lib/config";
import { usePosthogIdentify } from "../hooks/usePosthogIdentify";

/** Needs to be within the NavigationContainer in order to capture navigation events */
export const PostHogWrappedProvider = ({
  children,
}: {
  children: React.ReactElement;
}) => (
  <PostHogProvider
    autocapture
    apiKey={config.posthogApiKey}
    options={{
      host: "https://eu.posthog.com",
    }}
  >
    <PostHogAuthStateProvider>{children}</PostHogAuthStateProvider>
  </PostHogProvider>
);

usePosthogIdentify;

export const PostHogAuthStateProvider = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  usePosthogIdentify();
  return children;
};
