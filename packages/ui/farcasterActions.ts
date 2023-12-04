import { mutate } from "swr";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchWithSupabaseAuth(
  supabaseClient: SupabaseClient,
  path: string,
  options: RequestInit,
  throwOnNoAuth: boolean = false
) {
  if (!path.startsWith("http")) {
    throw new Error("Bad path");
  }
  console.debug("fetchWithSupabaseAuth", path);

  const session = await supabaseClient.auth.getSession();
  const accessToken = session?.data?.session?.access_token;
  const refreshToken = session?.data?.session?.refresh_token;

  if (
    throwOnNoAuth &&
    (accessToken === undefined || refreshToken === undefined)
  ) {
    throw new Error("No access token or refresh token");
  }

  return fetch(path, {
    ...options,
    headers: {  
      ...(options.headers || {}),
      // Cookie: `supabase-auth-token=["${access_token},
      //   "V8Vvzf39eEThntZ56cloDg",
      //   null,
      //   null,
      // ]`,
      "Content-Type": "application/json",
      // On react-native cookies aren't sent along, so we need to specify here
      ...(accessToken
        ? {
            "X-Supabase-Auth-Access-Token": accessToken,
            "X-Supabase-Auth-Refresh-Token":
              session.data.session?.refresh_token,
          }
        : {}),
    },
  });
}

export async function fcLike(
  supabaseClient: SupabaseClient,
  apiUrl: string,
  {
    castHash,
    castAuthorFid,
    fid,
  }: {
    castHash: string;
    fid: number;
    castAuthorFid: number;
  }
) {
  return fetchWithSupabaseAuth(supabaseClient, `${apiUrl}/api/fc-hubs/like`, {
    method: "POST",
    body: JSON.stringify({
      fid,
      castAuthorFid: castAuthorFid,
      castHash: castHash,
    }),
  });
}

export async function fcUnlike(
  supabaseClient: SupabaseClient,
  apiUrl: string,
  {
    castHash,
    castAuthorFid,
    fid,
  }: {
    castHash: string;
    fid: number;
    castAuthorFid: number;
  }
) {
  return fetchWithSupabaseAuth(supabaseClient, `${apiUrl}/api/fc-hubs/unlike`, {
    method: "DELETE",
    body: JSON.stringify({
      fid,
      castAuthorFid: castAuthorFid,
      castHash: castHash,
    }),
  });
}

export async function fcFollow(
  supabaseClient: SupabaseClient,
  apiUrl: string,
  { targetFid }: { targetFid: number }
) {
  return fetchWithSupabaseAuth(supabaseClient, `${apiUrl}/api/fc/follow`, {
    method: "PUT",
    body: JSON.stringify({
      targetFid: targetFid,
    }),
  });
}

export async function fcDeleteAuth(
  supabaseClient: SupabaseClient,
  apiUrl: string
) {
  return fetchWithSupabaseAuth(supabaseClient, `${apiUrl}/api/fc/delete-auth`, {
    method: "DELETE",
  });
}

export async function fcUnfollow(
  supabaseClient: SupabaseClient,
  apiUrl: string,
  { targetFid }: { targetFid: number }
) {
  return fetchWithSupabaseAuth(supabaseClient, `${apiUrl}/api/fc/unfollow`, {
    method: "DELETE",
    body: JSON.stringify({
      targetFid: targetFid,
    }),
  });
}

// POST https://api.farcaster.xyz/indexer/activity/ { merkleRoot: string, signature: string, body: { address: string, prevMerkleRoot: string, publishedAt: number, sequence: number, type: string, username: string, data: { text: 'recast://...' } }}
export async function fcRecast(
  supabaseClient: SupabaseClient,
  apiUrl: string,
  {
    castHash,
    castAuthorFid,
    fid,
  }: {
    castHash: string;
    castAuthorFid: number;
    fid: number;
  }
) {
  return fetchWithSupabaseAuth(supabaseClient, `${apiUrl}/api/fc-hubs/recast`, {
    method: "POST",
    body: JSON.stringify({ castHash, castAuthorFid, fid }),
  });
}

export async function fcUnrecast(
  supabaseClient: SupabaseClient,
  apiUrl: string,
  {
    castHash,
    castAuthorFid,
    fid,
  }: {
    castHash: string;
    castAuthorFid: number;
    fid: number;
  }
) {
  return fetchWithSupabaseAuth(
    supabaseClient,
    `${apiUrl}/api/fc-hubs/unrecast`,
    {
      method: "DELETE",
      body: JSON.stringify({ castHash, castAuthorFid, fid }),
    }
  );
}

export async function fcDeleteCast(
  supabaseClient: SupabaseClient,
  apiUrl: string,
  {
    castHash,
    threadHash,
    fid,
  }: {
    castHash: string;
    fid: number;
    threadHash: string;
  }
) {
  const res = await fetchWithSupabaseAuth(
    supabaseClient,
    `${apiUrl}/api/fc/delete-cast`,
    {
      method: "POST",
      body: JSON.stringify({
        castHash,
        fid,
      }),
    }
  );

  await Promise.all([
    mutate(`/api/threads/${threadHash}`),
    mutate(`/api/casts/${threadHash}`),
    mutate(`/api/casts/${castHash}`),
  ]);

  return res;
}
