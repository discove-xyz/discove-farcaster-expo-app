import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, useColorScheme } from "react-native";
import { WebView } from "react-native-webview";
import { mutate } from "swr";
import Colors from "../constants/Colors";
import { config } from "../lib/config";
import { Sentry } from "../lib/sentry";
import { useFetcher } from "@discove/ui/useSwr";
import { API, FCCast } from "@discove/util/types";
import { CastItem } from "./CastItem";
import { Pressable } from "./Pressable";
import { ScrollView } from "./ScrollView";
import { Text } from "./Text";
import { View } from "./View";
import { useFarcasterIdentity } from "@discove/ui/useFarcasterIdentity";
import { useScrollViewScrollToItem } from "../hooks/useScrollViewScrollToItem";
import { MMKV } from "react-native-mmkv";
import useSWR from "swr";

export const storage = new MMKV({
  id: `cast-draft-storage`,
});

export function NewCastModal({ route }: any) {
  const { replyToCast } = route.params;
  const colorScheme = useColorScheme();
  const webviewRef = useRef<WebView>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { fid } = useFarcasterIdentity();

  const [latestCastDraft, setLatestCastDraft] = useState(
    storage.getString("latest-cast-draft")
  );

  const prefetchWebviewHTML = useCallback(async (url: string) => {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "text/html",
      },
    });

    if (!res.ok) {
      const error: any = new Error(
        "An error occurred while fetching the data."
      ) as any;
      // Attach extra info to the error object.
      error.info = await res.json();
      error.status = res.status;
      throw error;
    }

    return res.text();
  }, []);

  const { data: websiteStatic } = useSWR(
    `${config.apiUrl}/casting-webview-for-react-native${
      colorScheme === "dark" ? "-dark" : ""
    }?is_reply=${replyToCast ? "true" : "false"}`,
    prefetchWebviewHTML
  );

  const fetcher = useFetcher();
  const navigation = useNavigation();
  const onSubmit = async ({ text }: { text: string }) => {
    setIsSubmitting(true);
    try {
      const resJson = await fetcher<API["/api/fc-hubs/cast"]["POST"]>(
        `/api/fc-hubs/cast`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            castText: text,
            replyTo: replyToCast ? replyToCast.hash : undefined,
            replyToFid: replyToCast ? replyToCast.author_fid : undefined,
            fid: fid,
          }),
        }
      );

      if (replyToCast) {
        Promise.all([
          mutate(`/api/threads/${replyToCast.thread_hash}`),
          mutate(`/api/threads/${replyToCast.hash}`),
          mutate(`/api/casts/${replyToCast.thread_hash}`),
          mutate(`/api/casts/${replyToCast.hash}`),
        ]);
      }

      // Needed to close the modal
      navigation.goBack();

      if (resJson.hasOwnProperty("cast"))
        navigation.navigate("Root", {
          screen: "Home",
          params: {
            screen: "Thread",
            params: {
              castHash: (
                resJson as {
                  cast: FCCast;
                }
              ).cast.hash,
              threadHash: (
                resJson as {
                  cast: FCCast;
                }
              ).cast.thread_hash,
            },
          },
        });

      storage.set("latest-cast-draft", "");
      setIsSubmitting(false);

      return resJson;
    } catch (err) {
      Sentry.captureException(err);
      console.log(err);
      Alert.alert("Something went wrong while casting :(. You can retry");
      setIsSubmitting(false);
      return false;
    }
  };
  const { scrollViewRef, itemOnLayout } = useScrollViewScrollToItem();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [scrollViewRef]);

  const requestCastStateFromWebView = useCallback(() => {
    webviewRef.current?.injectJavaScript(getInjectableJSMessage());

    function getInjectableJSMessage(): string {
      return `(function() {document.dispatchEvent(new MessageEvent('message', {data: 'submit-cast' }));})();`;
    }
  }, [webviewRef]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          {latestCastDraft ? (
            <Pressable
              size="md"
              variant="transparent"
              style={{ marginRight: 8 }}
              disabled={isSubmitting}
              onPress={() => {
                webviewRef.current?.injectJavaScript(getInjectableJSMessage());

                function getInjectableJSMessage(): string {
                  return `(function() {document.dispatchEvent(new MessageEvent('message', {data: ${JSON.stringify(
                    {
                      command: "restore-cast-draft",
                      value: latestCastDraft,
                    }
                  )}}));})();`;
                }

                setLatestCastDraft("");
              }}
            >
              Restore unsaved
            </Pressable>
          ) : null}
          <Pressable
            style={{ backgroundColor: Colors.indigo["700"] }}
            textStyle={{ color: "white" }}
            size="md"
            disabled={isSubmitting}
            onPress={() => {
              requestCastStateFromWebView();
            }}
          >
            {isSubmitting ? <ActivityIndicator size="small" /> : "Cast"}
          </Pressable>
        </>
      ),
    });
  }, [requestCastStateFromWebView, isSubmitting, navigation, latestCastDraft]);

  useEffect(() => {
    function saveDraft() {
      if (!isSubmitting) {
        webviewRef.current?.injectJavaScript(getInjectableJSMessage());

        function getInjectableJSMessage(): string {
          return `(function() {document.dispatchEvent(new MessageEvent('message', {data: 'save-cast-draft' }));})();`;
        }
      }
    }

    saveDraft();

    const t = setInterval(saveDraft, 3000);

    return () => clearInterval(t);
  }, [isSubmitting]);

  return (
    <ScrollView
      onContentSizeChange={() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }}
      ref={scrollViewRef}
      _dark={{
        backgroundColor: Colors.dark.background,
      }}
      _light={{
        backgroundColor: Colors.light.background,
      }}
      style={{
        display: "flex",
      }}
    >
      {isSubmitting ? (
        <View
          _dark={{
            backgroundColor: Colors.dark.background,
          }}
          _light={{
            backgroundColor: Colors.light.background,
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            padding: 20,
            height: "100%",
            width: "100%",
            zIndex: 99,
            opacity: 0.5,
          }}
        ></View>
      ) : null}
      {replyToCast ? (
        <View style={{ flexShrink: 1 }}>
          <CastItem
            cast={replyToCast}
            hideReplyTo
            noBorderBottom
            // hideReplies
          />
          <View style={{ paddingHorizontal: 16 }}>
            <Text>Replying to @{replyToCast?.username}</Text>
          </View>
        </View>
      ) : null}
      <View
        _dark={{
          backgroundColor: Colors.dark.background,
        }}
        _light={{
          backgroundColor: Colors.light.background,
        }}
        style={{
          display: "flex",
          flexGrow: 1,
          minHeight: 600,
        }}
        onLayout={itemOnLayout}
      >
        <WebView
          ref={webviewRef}
          onMessage={(event) => {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.draft === true) {
              if (data.text) {
                // Save a draft
                storage.set("latest-cast-draft", data.text);
              }
            } else {
              onSubmit(data);
            }
          }}
          keyboardDisplayRequiresUserAction={false} //ios allow focus auto
          onLoad={() => {
            webviewRef.current?.requestFocus();
          }}
          style={{
            flex: 1,
            display: "flex",
            backgroundColor: "transparent",
          }}
          originWhitelist={["*"]}
          source={{
            html: websiteStatic ?? "",
            baseUrl: config.apiUrl,
            // uri: `${config.apiUrl}/casting-webview-for-react-native${
            //   colorScheme === "dark" ? "-dark" : ""
            // }?hide_button=true&is_reply=${replyToCast ? "true" : "false"}`,
          }}
        />
      </View>
    </ScrollView>
  );
}
