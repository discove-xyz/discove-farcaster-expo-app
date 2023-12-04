import { defaultFeedQueryValues, FeedQuery } from "./types";

// Make sure the simplest and normalized version of the url is always created to make sure cache is always hit
// and to avoid dangling empty url params
export function normalizeFeedQuery(o: FeedQuery): FeedQuery {
  const newObj: FeedQuery = {};
  (Object.keys(o) as Array<keyof FeedQuery>).sort().forEach((key) => {
    if (
      o[key] &&
      defaultFeedQueryValues.hasOwnProperty(key) &&
      o[key] !== defaultFeedQueryValues[key]
    ) {
      newObj[key] = o[key];
    }
  });

  return newObj;
}

/** react-navigation on react-native won't unset unless the param value is undefined **/
export function feedQueryToFeedQueryWithAllKeysUsingUndefinedFallback(
  o: FeedQuery
) {
  return {
    // set all values to undefined as fallbacks
    ...Object.keys(defaultFeedQueryValues).reduce((prev, next) => {
      return {
        ...prev,
        [next]: undefined,
      };
    }, {}),
    ...o,
  };
}

export function feedQueryToUrlString(o: FeedQuery): string {
  const params = new URLSearchParams(o as any).toString();

  if (!params.length) return "";
  return `?${params}`;
}

export function feedQueryToHumanReadable(feedQuery: FeedQuery): string {
  const n = normalizeFeedQuery(feedQuery);

  if (n.t) return n.t;
  if (n.sql)
    return `${n.type || defaultFeedQueryValues["type"]}s that match the SQL: ${
      n.sql
    }`;

  let builderString = `${
    n.type || defaultFeedQueryValues["type"]
  }s on farcaster`;
  if (n.u) builderString += ` in @${n.u}'s feed`;
  if (n.q) builderString += `, that mention "${n.q}"`;
  if (n.a) builderString += `, sorted by ${n.a}`;

  return builderString;
}
