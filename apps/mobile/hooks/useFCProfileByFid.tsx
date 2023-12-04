import { useSessionContext } from "../lib/supabase";
import { useCallback, useEffect, useState } from "react";
import { FCProfile } from "@discove/util/types";

export function useFCProfileByFid(
  fid: number | null | undefined
): FCProfile | null {
  const { supabaseClient } = useSessionContext();

  const [profile, setProfile] = useState(null);

  const fetchData = useCallback(
    async (fid: number) => {
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("fid", fid);

      if (data?.length) setProfile(data[0]);
      else setProfile(null);
    },
    [supabaseClient]
  );

  useEffect(() => {
    if (fid) fetchData(fid);
  }, [fid, fetchData]);

  return profile;
}
