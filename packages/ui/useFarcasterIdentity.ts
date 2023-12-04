import { useContext } from "react";
import { FarcasterIdentityContext } from "./FarcasterIdentityContext";

export function useFarcasterIdentity(): FarcasterIdentityContext {
  const usernameContext = useContext(FarcasterIdentityContext);

  return usernameContext;
}
