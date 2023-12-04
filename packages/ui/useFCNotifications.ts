import { useSWR } from "./useSwr";
import { API } from "@discove/util/types";
import { useFarcasterIdentity } from "./useFarcasterIdentity";

export function useFCNotifications() {
  const { fid } = useFarcasterIdentity();
  const res = useSWR<API["/api/fc/notifications"]["GET"]>(
    fid ? `/api/fc/notifications` : null
  );

  return res;
}

export function useFCNotificationsCount(): number {
  const { fid } = useFarcasterIdentity();
  const res = useSWR<API["/api/fc/notifications"]["GET"]>(
    fid ? `/api/fc/notifications` : null,
    {
      refreshInterval: 30000,
    }
  );

  if (!res.data) return 0;
  return res.data?.unread_count;
}
