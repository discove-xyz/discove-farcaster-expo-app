import { castSorts, profileSorts } from "./types";
import { feedQueryToUrlString, normalizeFeedQuery } from "./params";

/** takes every array value in queryParam and turns it into permutations **/
function generateEveryFeedUrlCombo(
  baseUrl: string,
  staticQueryParams: object,
  dynamicQueryParams: Record<string, any[]>
): string[] {
  const allPermutationQueryParams: object[] = Object.entries(
    dynamicQueryParams
  ).reduce(
    (prev, [key, values]: [string, string[]]) => {
      return values.flatMap((value) => {
        return prev.map((v) => ({ ...v, [key]: value }));
      });
    },
    [{}]
  );
  const allPermutationUrls = allPermutationQueryParams.map(
    (qp) =>
      `${baseUrl}${feedQueryToUrlString(
        normalizeFeedQuery({
          ...staticQueryParams,
          ...qp,
        })
      )}`
  );
  return allPermutationUrls;
  // every queryParam value that is an array will be split into multiple permutations
}

export function getAllCachedUnnamedFeeds(): string[] {
  return [
    ...generateEveryFeedUrlCombo(
      "/api/feeds",
      { type: "cast" },
      {
        a: ["top"],
        s: ["today", "1h", "6h", "24h", "168h", "672h", "alltime"],
      }
    ),
    ...generateEveryFeedUrlCombo(
      "/api/feeds",
      { type: "cast" },
      {
        a: castSorts,
      }
    ),
    ...generateEveryFeedUrlCombo(
      "/api/feeds",
      { type: "profile" },
      {
        a: profileSorts,
      }
    ),
  ];
}
