import { useMemo } from "react";
import { fromNow } from "@discove/util/fromNow";

// https://github.com/vercel/next.js/discussions/38263
export const useRelativeDate = (date: Date | null): string | null => {
  const formattedDate = useMemo(() => (date ? fromNow(date) : null), [date]);

  return formattedDate;
};
