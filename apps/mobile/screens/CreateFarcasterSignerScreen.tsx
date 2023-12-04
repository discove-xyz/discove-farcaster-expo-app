import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, View, Button } from "react-native";
import { Text } from "../components/Text";
import { AuthedNoSignerProps } from "../navigation/navigation-types";
import { useFetcher, useSWR } from "@discove/ui/useSwr";
import { API } from "@discove/util/types";
import { config } from "../lib/config";
import { Pressable } from "../components/Pressable";
import { useFarcasterIdentity } from "@discove/ui/useFarcasterIdentity";
import { Sentry } from "../lib/sentry";
import Colors from "../constants/Colors";
import { supabaseClient } from "../lib/supabase";

const warpcastApi = "https://api.warpcast.com";

// function hexlify(hash: Uint8Array): string {
//   return `0x${Buffer.from(hash).toString("hex")}`;
// }

function hexlify(byteArray: Uint8Array) {
  return `0x${Array.prototype.map
    .call(byteArray, function (byte) {
      return ("0" + (byte & 0xff).toString(16)).slice(-2);
    })
    .join("")}`;
}

export default function CreateFarcasterSignerScreen({
  route,
  navigation,
}: AuthedNoSignerProps<"CreateFarcasterSigner">) {
  const { revalidate } = useFarcasterIdentity();
  const [hasGoneToWarpcast, setHasGoneToWarpcast] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [deepLinkUrl, setDeepLinkUrl] = useState<string>();
  const { data, error } = useSWR<API["/api/fc-hubs/request-signer"]["GET"]>(
    `/api/fc-hubs/request-signer`
  );
  const fetcher = useFetcher();

  const pollForSignSuccess = useCallback(
    async (token: string) => {
      while (true) {
        // sleep 1s
        await new Promise((r) => setTimeout(r, 500));

        try {
          await fetcher<API["/api/fc-hubs/confirm-signer"]["POST"]>(
            `/api/fc-hubs/confirm-signer`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                token,
              }),
            }
          );

          Alert.alert("Successfully connected your Farcaster account");

          revalidate();

          // will automatically navigate
          break;
        } catch (err){

        }
      }
    },
    [revalidate]
  );

  useEffect(() => {
    async function submitSignerRequest() {
      setSubmitted(true);

      // https://warpcast.notion.site/Warpcast-v2-API-Documentation-c19a9494383a4ce0bd28db6d44d99ea8#13cb11cba1114002adc928c5fa679364
      // Creates a signer request used to initiate a signer request flow for a user in Warpcast. A Signer Request expires in 24 hours.
      const res = await fetch(`${warpcastApi}/v2/signed-key-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: data!.public_key,
          requestFid: 12797,
          signature: data!.signature,
          deadline: data!.deadline
        }),
      });
      const resJSON = await res.json();

      setDeepLinkUrl(resJSON.result.signedKeyRequest.deeplinkUrl);
      await pollForSignSuccess(resJSON.result.signedKeyRequest.token);
    }

    if (data?.public_key && !data.has_signed) {
      submitSignerRequest();
    }
  }, [data?.public_key, data?.has_signed, data, pollForSignSuccess]);

  // useEffect(() => {
  //   if (data.has_signed) {
  //     props.onSuccess()
  //   }
  // }, [data?.has_signed])

  if (submitted && deepLinkUrl) {
    return (
      <View
        style={{
          justifyContent: "space-around",
          height: "100%",
          display: "flex",
          // height: "100%",
          alignContent: "flex-end",
          alignItems: "center",
        }}
      >
        <View>
          {hasGoneToWarpcast ? (
            <>
              <ActivityIndicator />
              <Text style={{ marginTop: 10 }}>Verifying signature...</Text>
            </>
          ) : null}
        </View>
        <View>
          <Pressable
            color="white"
            size="lg"
            style={{
              height: 50,
              marginTop: 50,
              marginLeft: 40,
              marginRight: 40,
              backgroundColor: Colors.indigo["600"],
              borderColor: Colors.indigo["500"],
            }}
            onPress={() => {
              setHasGoneToWarpcast(true);
              Linking.openURL(deepLinkUrl);
            }}
          >
            Sign in with Warpcast
          </Pressable>
          <Text
            style={{
              marginTop: 20,
              marginLeft: "10%",
              marginRight: "10%",
              opacity: 0.8,
              lineHeight: 23,
            }}
          >
            Warpcast won&apos;t automatically redirect you back after signing,
            you need to switch back manually
          </Text>
        </View>
        <View>
          <Button
            title="Logout"
            onPress={async () => {
              await supabaseClient.auth.signOut();
              Sentry.setUser(null);

              // Sentry.setUser(null);
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 100, alignItems: "center" }}>
      {error ? (
        <Text>An unknown error occurred. You can try reloading.</Text>
      ) : (
        <>
          <ActivityIndicator />
          <Text>Loading</Text>
        </>
      )}
    </View>
  );
}
