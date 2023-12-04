import { createContext, useEffect, useMemo, useState } from "react";
import { supabaseClient } from "../lib/supabase";
import { useUser } from "./SessionContext";

export type UsernameContext = {
  isLoading: boolean;
  username: string | null;
  fid: number | null;
  revalidate: () => void;
};

export const UsernameContext = createContext<UsernameContext>({
  isLoading: true,
  username: null,
  fid: null,
  revalidate: () => {},
});

export const UsernameContextProvider: React.FC<{
  children: any;
}> = (props) => {
  const [value, setValue] = useState({
    isLoading: true,
    username: null,
    fid: null,
  });
  const user = useUser();

  async function fetchUsername() {
    const results = await supabaseClient
      .from("farcaster_signers")
      .select("username,fid")
      .match({ user_id: user?.id })
      .limit(1);
    if (results.data && results.data.length !== 0) {
      setValue({
        username: results.data[0].username,
        fid: results.data[0].fid,
        isLoading: false,
      });
    } else {
      setValue({ username: null, fid: null, isLoading: false });
    }
  }

  const contextValue = useMemo(
    () => ({
      ...value,
      revalidate: fetchUsername,
    }),
    [value]
  );

  useEffect(() => {
    if (user && user.id && !value.username) {
      setValue({ username: null, fid: null, isLoading: true });
      fetchUsername();
    } else if (value.username && !user) {
      setValue({ username: null, fid: null, isLoading: false });
    }
  }, [user, value.username]);

  return (
    <UsernameContext.Provider value={contextValue}>
      {props.children}
    </UsernameContext.Provider>
  );
};
