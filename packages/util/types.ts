import {
  Cast,
  User,
  Notification,
} from "@standard-crypto/farcaster-js/types/merkleAPI/swagger";

export type MerkleApiCast = Cast;
export type MerkleApiProfile = User;

export type Wrapped2022 = Record<
  number,
  {
    emojis_view: { emojis: any[] };
    topics_view: { entities: string[]; counts: number[] };
    topics_positive_view: { entities: string[]; counts: number[] };
    responded_by_view: { top_replies: any[] };
    top_domains_view: { top_domains: Array<{ domain: string; count: number }> };
    first_cast_view: { cast: FCCast | null };
    top_casts_view: { top_casts: any[] };
    // num_deleted_casts_view: { count: number };
    profile_fans_view: { fans: any[] };
    casted_images_view: { data: Array<{ url: string; hash: string }> };
    num_likes_view: { count: number };
    casts_over_time_view: {
      data: Array<{ week: string; count: number }>;
      max: number;
    };
    num_castaways_view: { count: number };
    persona_percentage?: string;
    persona:
      | "questioncaster"
      | "lurkcaster"
      | "ghostcaster"
      | "gramcaster"
      | "replyguy"
      | "shillcaster"
      | "threadcastor"
      | "botcaster"
      | "castaway"
      | "cryptocaster"
      | "birdappcaster";
    personas_view: {
      // [decimal percentage score, base count of items matching]
      questioncaster: [number, number];
      lurkcaster: [number, number];
      ghostcaster: [number, number];
      gramcaster: [number, number];
      replyguy: [number, number];
      shillcaster: [number, number];
      threadcastor: [number, number];
      botcaster: [number, number];
      castaway: [number, number];
      cryptocaster: [number, number];
      birdappcaster: [number, number];
    };
    num_threads_view: { count: number };
    num_questions_view: { count: number };
    num_replies_view: { count: number };
    num_gms_view: { count: number };
    num_liked_by_view: { count: number };
    num_casts_view: { count: number };
    responded_to_view: { top_replies: any[] };
    user_card_view: Pick<
      FCProfile,
      "avatar_url" | "display_name" | "username" | "fid" | "bio"
    >;
    user_number_view: { number: number | string };
  }
>;

export interface SearchProfilesRPCItemType
  extends Pick<
    FCProfile,
    "bio" | "fid" | "display_name" | "username" | "avatar_url"
  > {
  levenshtein_distance: number;
  result_type: "profile";
}

export type FollowNotificationType = {
  type: "d-follow";
  users: Array<FCProfile & { follow_created_at: string; is_unseen: boolean }>;
  created_at: string;
  is_unseen: boolean;
};
export type LikeNotificationType = {
  type: "d-cast-like";
  users: Array<FCProfile & { like_created_at: string; is_unseen: boolean }>;
  hash: string;
  text: string;
  is_unseen: boolean;
  created_at: string;
};
export type RecastNotificationType = {
  users: Array<FCProfile & { recast_created_at: string; is_unseen: boolean }>;
  hash: string;
  text: string;
  type: "d-recast";
  is_unseen: boolean;
  created_at: string;
};
export type MentionNotificationType = {
  user: FCProfile;
  type: "d-cast-mention";
  thread_hash: string;
  hash: string;
  text: string;
  is_unseen: boolean;
  created_at: string;
};
export type ReplyNotificationType = {
  user: FCProfile;
  type: "d-cast-reply";
  thread_hash: string;
  hash: string;
  text: string;
  is_unseen: boolean;
  created_at: string;
};
export type CoveFavoriteNotificationType = {
  type: "d-cove-favorite";
  users: Array<{ favorite_created_at: string; is_unseen: boolean }>;
  feedname: string;
  is_unseen: boolean;

  created_at: string;
};
export type CoveSubscriptionNotificationType = {
  type: "d-cove-subscription";

  username: string;
  feedname: string;
  is_unseen: boolean;
  created_at: string;
  unread_count: number;
};

export type MixedNotification =
  | MentionNotificationType
  | ReplyNotificationType
  | RecastNotificationType
  | LikeNotificationType
  | FollowNotificationType
  | CoveFavoriteNotificationType
  | CoveSubscriptionNotificationType;

export interface Following {
  created_at: string;
  // node-postgres serializes int8 to string as it's possibly bigger than Number.MAX_SAFE_NUMBER
  follower_fid: number | string;
  // node-postgres serializes int8 to string as it's possibly bigger than Number.MAX_SAFE_NUMBER
  following_fid: number | string;
}

export interface Like {
  type: string;
  // node-postgres serializes int8 to string as it's possibly bigger than Number.MAX_SAFE_NUMBER
  fid: number | string;
  cast_hash: string;
  created_at: string;
}

export type ThreadTree = {
  cast: FCCast;
  // must be direct children
  children?: Record<string, ThreadTree>;
};

export type OrderedThreadTree = {
  cast: FCCast;
  // must be direct children
  children?: OrderedThreadTree[];
};

export interface FlattenedProfile {
  // node-postgres serializes int8 to string as it's possibly bigger than Number.MAX_SAFE_NUMBER
  fid: number | string;
  address: string | null;
  username?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  referrer?: string | null;
  avatar_verified?: boolean;
  followers?: number;
  following?: number;
  bio?: string | null;
  registered_at?: Date | string;
  updated_at?: Date | string;
}

export interface FlattenedCast {
  type: "text-short";
  published_at: Date;
  /** only tracks a full reindex, that is from discove/farcaster-indexer-v2/src/tasks/index-casts.ts **/
  last_reindexed_at: Date;
  recasted_cast_hash: string | null;
  is_recast: boolean;
  deleted: boolean;

  username: string | null;
  // node-postgres serializes int8 to string as it's possibly bigger than Number.MAX_SAFE_NUMBER
  author_fid: number | string;
  text: string;

  reply_parent_hash: string | null;
  reply_parent_username: string | null;
  // node-postgres serializes int8 to string as it's possibly bigger than Number.MAX_SAFE_NUMBER
  reply_parent_fid: number | null | string;

  hash: string;
  thread_hash: string;
  display_name: string | null;
  avatar_url: string | null;
  avatar_verified: boolean;
  mentions: JSON | any;

  replies: number | null;
  reactions: number | null;
  recasts: number | null;
  watches: number | null;

  recasters: JSON | any;
}

export type CustomCastMetrics = {
  new: number;
  top: number;
  casterengagement: number;
  toplikes: number;
  toprecasts: number;
  topwatches: number;
  topreactions: number;
  topreplies: number;
  topfollowers: number;
  topfollowernormalized: number;
  hot: number;
  hotfollowernormalized: number;
  hotfrequencynormalized: number;
};

/** this is a subset of the properties */
export interface OpenGraphType {
  url?: string;
  type?: string;
  image?: string;
  title?: string;
  locale?: string;
  favicon?: string;
  imageType?: string;
  site_name?: string;
  imageWidth?: string;
  description?: string;
  imageHeight?: string;
  articleModifiedTime?: string;
  video?: string;
  videoType?: string;
  videoWidth?: string;
  videoHeight?: string;
}

export interface FCCast extends FlattenedCast {
  reply_data?: FCCast[];
  og: {
    last_updated?: string;
    urls?: Array<{ url: string; last_status: number; tags: OpenGraphType }>;
  };
  reply_to_data?: FCCast;
  recast_data?: FCCast;
  weighted_keywords?: unknown;
  custom_metrics?: {
    custom_profile_metrics?: FCProfile["custom_metrics"];
    custom_cast_metrics?: CustomCastMetrics;
  };
}

export interface FCProfile extends FlattenedProfile {
  weighted_keywords?: unknown;
  // Datestring

  custom_metrics?: {
    // datestring
    last_known_active?: Date | string;
    total_casts: number;

    // registered_at
    new: number;
    total_recasts: number;
    recasts_score: number;
    // hard to track without tracking followers
    hot: number;
    hot_by_engagement: number;
    // likes received
    total_likes: number;
    // top?
    num_followers: number;
    num_following: number;
    frequency_score: number;
    engagement_score: number;
    per_follower_engagement_score: number;
  };
}

export interface MutedUser {
  id: number;
  muted_by_user_id: string;
  muted_user_fid: number;
}

export interface RenderPlugin {
  username: string;
  // node-postgres serializes int8 to string as it's possibly bigger than Number.MAX_SAFE_NUMBER
  fid: number | string;
  slug: string;
  name: string;
  description: string;
  created_at: string | Date;
  matches: Array<{
    match: string;
    // comma separated array
    property_names?: string;
    match_flags: string;
    height: string;
    html: string;
    width: string;
  }>;
}

export const profileSorts = [
  "total_casts",
  "last_known_active",
  "new",
  "hot",
  "hot_by_engagement",
  "total_likes",
  "num_followers",
  "num_following",
  "frequency_score",
  "engagement_score",
  "per_follower_engagement_score",
];

export const castSorts = [
  "new",
  "top",
  "casterengagement",
  "toplikes",
  "toprecasts",
  "topwatches",
  "topreactions",
  "topreplies",
  "topfollowers",
  "topfollowernormalized",
  "hot",
  "hotfollowernormalized",
  "hotfrequencynormalized",
];

export const defaultFeedQueryValues = {
  // string query
  q: "",
  // users feed
  u: "",
  // algorithm
  a: "hot",
  // start date
  s: "alltime",
  // user who created the named feed
  username: "",
  // enabled plugins
  pl: "",
  // named feed name
  feedname: "",
  // cast or profile or text
  type: "cast",
  // end date
  e: "",
  // number of results
  n: "30",
  // page
  p: "1",
  // description
  d: "",
  // big like button
  l: "0",
  // hide filters
  h: "0",
  // title
  t: "",
  // sql
  sql: "",
};

export type CoveFavorite = {
  username: string;
  feedname: string;
  title: string;
  user_id: string;
  subscribed_to_notifications: boolean;
  last_read_notification_date: string;
  created_at: string;
};

export type UserSettings = {
  user_id: string;
  enabled_plugins: string[];
  metadata: Record<string, any>;
};

export type Cove = {
  fid: number | string;
  feedname: string;
  username: string;
  config: FeedQuery;
  created_at: string;
};

// coves_with_count view
export type CoveWithFavorites = Cove & {
  favorites: number;
  custom_metrics: { new: number; hot: number; top: number };
};

// Don't even try to make these states not strings, its a hassle
export interface FeedQuery {
  q?: string;
  u?: string;
  a?: string;
  s?: string;
  e?: string;
  // `${number}
  n?: string;
  // `${number}
  pl?: string;
  p?: string;
  t?: string;
  d?: string;
  // 'cast' or 'profile' or 'text'
  type?: string;
  // '0' | '1'
  l?: string;
  h?: string;
  sql?: string;
  username?: string;
  feedname?: string;
}

export const feedQueryStrictTypesWithFallback = {
  type: (value: FeedItemType): FeedItemType =>
    ["cast", "profile", "text", "cove"].includes(value) ? value : "cast",
};

export type TextItem = {
  title?: string;
  text: string;
  imagew?: string;
  imageh?: string;
  image?: string;
  url?: string;
  type: "text";
  id: string;
  discove_item_type: "text";
};

export type FeedItemType = "cast" | "profile" | "text" | "cove";
export type FeedItem = FCCast | FCProfile | TextItem | CoveWithFavorites;
export type FeedType = Array<FeedItem>;

export interface APIError {
  message: string;
  code?: number;
}

export interface API {
  "/api/entities": {
    GET: { trending: Array<{ count: number; entity_text: string }> };
  };
  "/api/check-username-verification": {
    PUT: {};
  };
  "/api/revalidate": {
    GET: {
      revalidated: true;
    };
  };
  "/api/revalidate/...route": {
    GET: {
      revalidated: true;
    };
  };
  "/api/feeds/list": {
    GET: {
      feeds: Cove[];
    };
  };
  "/api/user/settings": {
    GET: {
      user_settings: UserSettings;
      plugins: RenderPlugin[];
    };
    PUT: {};
  };
  "/api/user/delete": {
    DELETE: {};
  };
  "/api/plugins": {
    GET: {
      plugins: RenderPlugin[];
    };
  };
  "/api/plugins/:username": {
    GET: {
      plugins: RenderPlugin[];
    };
  };
  "/api/plugins/:username/:slug": {
    GET: {
      plugin: RenderPlugin;
    };
    POST: {};
  };
  "/api/casts/:merkleRoot": {
    GET: {
      cast: FCCast;
    };
  };
  "/api/threads/:merkleRoot": {
    GET: {
      casts: FCCast[];
    };
  };
  "/api/fc-hubs/confirm-signer": {
    POST: {
      success: boolean;
    };
  };
  "/api/fc-hubs/request-signer": {
    GET: {
      public_key: any;
      has_signed: boolean;
      signature: string,
      deadline: number
    };
  };
  "/api/feeds": {
    GET: {
      feed: {
        results: FeedType;
        sqlQuery: string;
        plugins: RenderPlugin[];
      };
      feedQuery: FeedQuery;
    };
  };
  "/api/fc-hubs/cast": {
    POST:
      | {
          cast: FCCast;
        }
      | {};
  };
  "/api/user/cove-notifications": {
    GET: { username: string; feedname: string; unread_count: number }[];
  };
  "/api/fc/cast": {
    POST:
      | {
          cast: FCCast;
        }
      | {};
  };
  "/api/fc/interactions": {
    GET: {
      allMutes: number[];
      allLikeHashes: string[];
      allRecastHashes: string[];
      allFollowing: number[];
      allFollowers: number[];
      allBookmarks: string[];
    };
  };
  "/api/fc/notifications": {
    GET: {
      unread_count: number;
      notifications: MixedNotification[];
    };
  };
  "/api/search-autocomplete": {
    GET: {
      results: Array<
        | {
            text: string;
            result_type: "search-casts";
            levenshtein_distance: number;
          }
        | {
            text: string;
            result_type: "search-profiles";
            levenshtein_distance: number;
          }
        | (Pick<
            FCProfile,
            "bio" | "fid" | "display_name" | "username" | "avatar_url"
          > & { levenshtein_distance: number; result_type: "profile" })
        | (Pick<Cove, "feedname" | "username" | "config"> & {
            levenshtein_distance: number;
            result_type: "cove";
          })
      >;
    };
  };
  "/api/feeds/new": {
    POST: {};
  };
  "/api/feeds/:username": {
    GET: {
      feeds: Cove[];
    };
  };
  "/api/feeds/:username/:feedname": {
    GET: {
      feed: {
        results: FeedType;
        sqlQuery: string;
        plugins: RenderPlugin[];
      };
      feedQuery: FeedQuery;
    };
  };
  "/api/profiles/:username": {
    GET: {
      profile: FCProfile;
    };
  };
}
