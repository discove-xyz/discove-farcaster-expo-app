import { useSWR } from "./useSwr";
import { API } from "@discove/util/types";

export function useEntities() {
  const swrRes = useSWR<API["/api/entities"]["GET"]>(`/api/entities`);

  return swrRes;
}
