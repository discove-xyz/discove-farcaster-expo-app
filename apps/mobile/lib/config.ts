import Constants from "expo-constants";

export type Env = "production" | "staging" | "dev";

const parseEnv = (): Env => {
  const rawEnv = Constants.expoConfig?.extra?.env as string | undefined;
  if (rawEnv === undefined) {
    console.info("no ENV specified, falling back to dev");
    return "dev";
  }

  if (rawEnv === "production" || rawEnv === "staging" || rawEnv === "dev") {
    console.debug(`ENV: ${rawEnv}`);
    return rawEnv;
  }

  console.warn(`invalid ENV specified: ${rawEnv}, falling back to dev`);
  return "dev";
};

const env = parseEnv();

const rawApiUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined;
const apiUrl =
  typeof rawApiUrl === "string"
    ? rawApiUrl
    : env === "production"
    ? "https://www.discove.xyz"
    : env === "staging"
    ? "https://staging.discove.xyz"
    : "http://127.0.0.1:3000";

export const config = {
  apiUrl,
  env,
  posthogApiKey: Constants.expoConfig?.extra?.posthogApiKey,
  supabaseUrl: Constants.expoConfig?.extra?.supabaseUrl,
  supabaseAnonKey: Constants.expoConfig?.extra?.supabaseAnonKey,
};
