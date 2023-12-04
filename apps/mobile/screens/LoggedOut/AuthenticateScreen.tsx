import { usePostHog } from "posthog-react-native";
import React, { useContext, useState } from "react";
import { Alert, Image, View } from "react-native";
import { Pressable } from "../../components/Pressable";
import { HStack, VStack } from "../../components/Stack";
import { Text } from "../../components/Text";
import { TextInput } from "../../components/TextInput";
import { SessionContext } from "../../contexts/SessionContext";
import useColorScheme from "../../hooks/useColorScheme";
import { supabaseClient } from "../../lib/supabase";
import * as Linking from "expo-linking";
import Sizes from "../../constants/Sizes";
import Colors from "../../constants/Colors";
import { NoAuthScreenProps } from "../../navigation/navigation-types";
import { openInbox } from "react-native-email-link";
import { Sentry } from "../../lib/sentry";

// 1202x334
const logoForDark = require("../../assets/images/discove-logo-dark-150h.png");
const logoForLight = require("../../assets/images/discove-logo-150h.png");

export default function AuthenticateScreen({
  route,
  navigation,
}: NoAuthScreenProps<"Authenticate">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const mode = route.params?.mode ?? "magic";
  const message = route.params?.message;
  const posthog = usePostHog();
  const colorScheme = useColorScheme();

  const sessionContext = useContext(SessionContext);

  async function resetPassword() {
    setLoading(true);
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email);

    if (error) Alert.alert(error.message);
    else {
      navigation.setParams({
        mode: "check-email",
      });
    }
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    let redirectURL = Linking.createURL("login");

    const { error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: redirectURL,
      },
    });

    if (error) {
      Alert.alert(error.message);
      posthog?.capture("signupError");
    } else {
      // Email confirmation step required
      navigation.setParams({
        mode: "check-email",
        message: "Confirm your email address",
      });
    }
    setLoading(false);
  }

  async function magicLink() {
    // https://github.com/supabase/gotrue-js/issues/418
    // This EXACT FULL url must be in the Supabase Dashboard > Authentication > URL Configuration > Redirect URLs, otherwise it will quietly use the SITE URL
    // this depends on your current network,

    let redirectURL = Linking.createURL("login");

    setLoading(true);
    const { error } = await supabaseClient.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: redirectURL,
      },
    });
    sessionContext.setOtpEmail(email);
    // SessionContext parses the supabase magic link url

    posthog?.capture("magicLink");

    if (error) {
      Sentry.captureException(error);
      Alert.alert(error.message);
    } else {
      navigation.setParams({
        mode: "check-email",
        message: "Open mail app",
      });
    }
    setLoading(false);
  }

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Sentry.captureException(error);
      Alert.alert(error.message);
      posthog?.capture("passwordError");
    } else {
      posthog?.capture("loggedIn");
    }
    setLoading(false);
  }

  return (
    <VStack
      style={{
        alignItems: "center",
      }}
    >
      <VStack
        gap={10}
        style={{
          marginTop: 200,
          maxWidth: 280,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Image
            key={colorScheme}
            source={colorScheme === "dark" ? logoForDark : logoForLight}
            style={{
              width: 507 / 3,
              height: 150 / 3,
            }}
          />
        </View>
        <View style={{ paddingBottom: 50 }}>
          <Text
            style={{
              lineHeight: 28,
              fontSize: 20,
              textAlign: "center",
              fontFamily: "SF-Pro-Rounded-Semibold",
            }}
          >
            Welcome to Discove, a social app on Farcaster
          </Text>
        </View>
        {mode !== "check-email" ? (
          <View>
            <TextInput
              style={{ fontFamily: "SF-Pro-Rounded-Semibold" }}
              autoComplete="email"
              onChangeText={(text) => setEmail(text)}
              value={email}
              placeholder="hello@youremail.com"
              autoCapitalize="none"
            />
          </View>
        ) : null}
        <View
          style={{
            display:
              mode !== "magic" && mode !== "reset" && mode !== "check-email"
                ? undefined
                : "none",
          }}
        >
          <TextInput
            style={{ fontFamily: "SF-Pro-Rounded-Semibold" }}
            autoComplete="password"
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize="none"
          />
        </View>
        <View style={{ height: 50 }}>
          <Pressable
            disabled={loading}
            style={{
              flexShrink: 1,
              paddingVertical: Sizes.inputPaddingVertical,
              paddingHorizontal: Sizes.inputPaddingHorizontal,
              borderRadius: Sizes.borderRadiusInput,
              borderWidth: 1,

              backgroundColor: Colors.indigo["600"],
              borderColor: Colors.indigo["500"],
            }}
            color="white"
            onPress={() => {
              if (mode === "login") signInWithEmail();
              if (mode === "magic") magicLink();
              if (mode === "reset") resetPassword();
              if (mode === "signup") signUpWithEmail();
              if (mode === "check-email") openInbox();
            }}
          >
            {mode === "login"
              ? "Login"
              : mode === "magic"
              ? "Send me a magic link"
              : mode === "reset"
              ? "Send password reset email"
              : mode === "signup"
              ? "Join"
              : mode === "check-email"
              ? message || "Email sent! Open email app"
              : null}
          </Pressable>
          {/* <Pressable
            variant="ghost"
            style={{ paddingHorizontal: 4, opacity: 0.5 }}
            disabled={loading}
            onPress={() =>
              Linking.openURL(Linking.createURL("home")).catch((err) => {
                console.log(err);
              })
            }
          >
            <Text>Open link</Text>
          </Pressable> */}
        </View>
      </VStack>

      <HStack style={{ alignItems: "center", gap: 0 }}>
        {mode === "magic" ? null : (
          <Pressable
            variant="ghost"
            style={{ paddingHorizontal: 4, opacity: 0.5 }}
            disabled={loading}
            onPress={() => navigation.setParams({ mode: "magic" })}
          >
            <Text>Magic link</Text>
          </Pressable>
        )}
        {mode === "magic" ? null : (
          <View>
            <Text>·</Text>
          </View>
        )}
        {mode === "signup" ? null : (
          <Pressable
            variant="ghost"
            disabled={loading}
            style={{ paddingHorizontal: 4, opacity: 0.5 }}
            onPress={() => navigation.setParams({ mode: "signup" })}
          >
            <Text>Register</Text>
          </Pressable>
        )}
        {mode === "signup" || mode === "login" ? null : (
          <View>
            <Text>·</Text>
          </View>
        )}
        {mode === "login" ? null : (
          <Pressable
            variant="ghost"
            disabled={loading}
            style={{ paddingHorizontal: 4, opacity: 0.5 }}
            onPress={() => navigation.setParams({ mode: "login" })}
          >
            <Text>Login</Text>
          </Pressable>
        )}
        {mode === "reset" || mode === "check-email" ? null : (
          <View>
            <Text>·</Text>
          </View>
        )}
        {mode === "reset" || mode === "check-email" ? null : (
          <Pressable
            variant="ghost"
            style={{ paddingHorizontal: 4, opacity: 0.5 }}
            disabled={loading}
            onPress={() => navigation.setParams({ mode: "reset" })}
          >
            <Text>Reset Password</Text>
          </Pressable>
        )}
      </HStack>
      <View style={{ marginTop: 50, height: 50 }}>
        <Pressable
          variant="ghost"
          style={{ paddingHorizontal: 4, opacity: 0.5 }}
          onPress={() => {
            Linking.openURL("mailto:help@discove.app").catch((error) => {
              console.log(error);
            });
          }}
        >
          <Text>Contact</Text>
        </Pressable>
        <Pressable
          variant="ghost"
          style={{ paddingHorizontal: 4, opacity: 0.5 }}
          onPress={() => {
            Linking.openURL("https://www.discove.xyz/privacy-policy").catch(
              (error) => {
                console.log(error);
              }
            );
          }}
        >
          <Text>Privacy policy</Text>
        </Pressable>
      </View>
    </VStack>
  );
}
