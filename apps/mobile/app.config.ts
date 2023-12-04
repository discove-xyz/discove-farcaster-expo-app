import { ExpoConfig, ConfigContext } from "expo/config";
const path = require("path");

// console.log(process.env);
require("dotenv").config({
  path: path.resolve(
    process.cwd(),
    process.env.ENV === "prod"
      ? ".env.production.local"
      : ".env.development.local"
  ),
});

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Discove",
  slug: "discove",
  description: "Social client for the Farcaster protocol",
  version: "1.0.64",
  owner: "discove",
  sdkVersion: "48.0.0",
  orientation: "portrait",
  // privacy: "public",
  icon: "./assets/images/icon.png",
  scheme: "discove",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "cover",
    backgroundColor: "#170935",
  },
  updates: {
    fallbackToCacheTimeout: 0,
    // checkAutomatically: "ON_ERROR_RECOVERY",

    url: "https://u.expo.dev/1a4290de-7c91-4d2d-9968-995e66e15d14",
  },
  runtimeVersion: {
    policy: "sdkVersion",
  },
  assetBundlePatterns: ["**/*"],
  hooks: {
    postPublish: [
      // {
      //   file: "sentry-expo/upload-sourcemaps",
      //   config: {
      //     organization: "discove",
      //     project: "discove",
      //     authToken:
      //       "<ADDYOURSHEREORUSEANENVVARIABLELIKEISCORRECT>",
      //   },
      // },
    ],
  },
  plugins: [
    [
      "expo-dynamic-app-icon",
      {
        discove: {
          // icon name
          image: "./assets/images/icon.png", // icon path
          prerendered: true, // for ios UIPrerenderedIcon option
        },
        farcaster: {
          image: "./assets/images/icon-fc.png",
          prerendered: true,
        },
      },
    ],
    "sentry-expo",
    "react-native-email-link",
    [
      "expo-camera",
      {
        cameraPermission:
          "Allow Discove to access your camera so you can post pictures taken in the moment",
      },
    ],
    [
      "expo-updates",
      {
        username: "discove",
      },
    ],
  ],
  extra: {
    apiUrl: process.env.API_URL,
    env: process.env.ENV,
    posthogApiKey: process.env.POSTHOG_API_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    eas: {
      projectId: "<ADDYOURSHEREORUSEANENVVARIABLELIKEISCORRECT>",
    },
  },
  ios: {
    bundleIdentifier: "xyz.discove.discove",
    supportsTablet: true,
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.discove.discove",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#170935",
    },
  },
});
