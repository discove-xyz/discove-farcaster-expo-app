import { useCallback } from "react";
import useSWRLib, { SWRConfiguration } from "swr";
import useSWRInfiniteLib, {
  SWRInfiniteConfiguration,
  SWRInfiniteKeyLoader,
} from "swr/infinite";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchWithSupabaseAuth } from "./farcasterActions";
import { useAppSharedApiUrl, useAppSharedSupabaseClient } from "./AppShared";

export type ApiError = Error & {
  info: any;
  status: number;
};

const fetcher = async <T>(
  apiUrl: string,
  supabaseClient: SupabaseClient,
  urlOrPath: string,
  options: RequestInit = {}
): Promise<T> => {
  const isAbsoluteUrl =
    urlOrPath.startsWith("https://") || urlOrPath.startsWith("http://");
  // Why does relative URL imply Supabase auth, split into two fetchers?
  const res = await (isAbsoluteUrl
    ? fetch(urlOrPath, options)
    : fetchWithSupabaseAuth(supabaseClient, `${apiUrl}${urlOrPath}`, options));

  // If the status code is not in the range 200-299,
  // we still try to parse and throw it.
  if (!res.ok) {
    const error: ApiError = new Error(
      "An error occurred while fetching the data."
    ) as ApiError;
    // Attach extra info to the error object.
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};

export const unauthedFetcher = async <T>(
  apiUrl: string,
  urlOrPath: string,
  options: RequestInit = {}
): Promise<T> => {
  const isAbsoluteUrl =
    urlOrPath.startsWith("https://") || urlOrPath.startsWith("http://");
  const res = await fetch(
    `${isAbsoluteUrl ? "" : apiUrl}${urlOrPath}`,
    options
  );

  // If the status code is not in the range 200-299,
  // we still try to parse and throw it.
  if (!res.ok) {
    const error: ApiError = new Error(
      "An error occurred while fetching the data."
    ) as ApiError;
    // Attach extra info to the error object.
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};

export function useFetcher() {
  const apiUrl = useAppSharedApiUrl();
  const supabaseClient = useAppSharedSupabaseClient();

  return useCallback(
    <T = any>(urlOrPath: string, options: RequestInit = {}) =>
      fetcher<T>(apiUrl, supabaseClient, urlOrPath, options),
    [apiUrl, supabaseClient]
  );
}

export function useUnauthedFetcher() {
  const apiUrl = useAppSharedApiUrl();

  return useCallback(
    <T = any>(urlOrPath: string, options: RequestInit = {}) =>
      unauthedFetcher<T>(apiUrl, urlOrPath, options),
    [apiUrl]
  );
}

export function useSWR<T = any, ErrorType = any>(
  path: string | null,
  options?: SWRConfiguration<T, ErrorType, any>
) {
  const fetcher = useFetcher();
  return useSWRLib<T, ErrorType, string | null>(path, fetcher, options);
}

export function useSWRInfinite<T = any, ErrorType = any>(
  getKey: SWRInfiniteKeyLoader<any>,
  options?: SWRInfiniteConfiguration<T, ErrorType, any> & {
    credentials: boolean;
  }
) {
  const fetcher = useFetcher();
  return useSWRInfiniteLib<T, ErrorType>(getKey, fetcher, options);
}

export function useUnauthedSWRInfinite<T = any, ErrorType = any>(
  getKey: SWRInfiniteKeyLoader<any>,
  options?: SWRInfiniteConfiguration<T, ErrorType, any>
) {
  const fetcher = useUnauthedFetcher();
  return useSWRInfiniteLib<T, ErrorType>(getKey, fetcher, options);
}
