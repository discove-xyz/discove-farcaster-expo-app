import {
  CustomCastMetrics,
  FCCast,
  FCProfile,
  FlattenedProfile,
  MerkleApiCast,
  MerkleApiProfile,
} from "./types";

export function formatMerkleApiProfile(
  profile: MerkleApiProfile,
  custodyAddress: string
): FCProfile {
  return {
    fid: profile.fid,
    address: custodyAddress || null,
    username: profile.username,
    display_name: profile.displayName || null,
    avatar_url: profile.pfp?.url || null,
    avatar_verified: profile.pfp?.verified || false,
    followers: profile.followerCount,
    following: profile.followingCount,
    bio: profile.profile?.bio?.text || null,
    referrer: profile.referrerUsername || null,
  };
}

export function formatMerkleApiCast(
  cast: MerkleApiCast,
  discoveTransformer: (cast: MerkleApiCast) => any
): FCCast {
  // can't return a partial property that is sometimes undefined, or else upsert will error
  let text = cast.text;
  const imageUrls = (cast as any).embeds?.images
    .map((x: any) => x.sourceUrl)
    .filter((x: any) => !text.includes(x));
  if (imageUrls?.length) {
    text = `${text} ${imageUrls.join(" ")}`;
  }

  const embedUrls = (cast as any).embeds?.urls
    .map((x: any) => x.openGraph.url)
    .filter((x: any) => !text.includes(x));
  if (embedUrls?.length) {
    text = `${text} ${embedUrls.join(" ")}`;
  }

  return {
    type: "text-short",
    published_at: new Date(cast.timestamp),
    username: cast.author.username || null,
    last_reindexed_at: new Date(),
    text: text,
    is_recast: cast.text.startsWith("recast:farcaster://casts/"),
    recasted_cast_hash: cast.text.startsWith("recast:farcaster://casts/")
      ? cast.text.replace("recast:farcaster://casts/", "")
      : null,
    reply_parent_hash: (cast as any)._parentHashV2 || cast.parentHash || null,
    thread_hash: (cast as any)._threadHashV2 || cast.threadHash || cast.hash,
    hash: (cast as any)._hashV2 || cast.hash,
    reply_parent_username: cast.parentAuthor?.username || null,
    reply_parent_fid: cast.parentAuthor?.fid || null,
    author_fid: cast.author.fid || null,
    display_name: cast.author.displayName || null,
    avatar_url: cast.author.pfp?.url || null,
    avatar_verified: cast.author.pfp?.verified || false,
    // mentions: cast.meta?.mentions || [],
    replies: cast.replies.count ?? null,
    reactions: cast.reactions.count ?? null,
    recasts: cast.recasts.count ?? null,
    watches: cast.watches.count ?? null,
    recasters: cast.recasts.recasters || [],
    reply_to_data: null,
    recast_data: null,
    ...discoveTransformer(cast),
  };
}

function getCastEngagementScore(cast: MerkleApiCast) {
  // Ideally use unique respondents just not replies count, as things like unlonely just reply to themselves
  const castEngagementScore =
    // nerf unlonely bot
    (cast?.author?.fid === 548 ? 0 : cast.replies.count) +
    2 * cast.reactions.count +
    6 * cast.recasts.count +
    cast.watches.count;
  return castEngagementScore;
}

export function discoveCustomMetricsSingleMerkleApiCast(cast: MerkleApiCast): {
  custom_metrics: {
    custom_cast_metrics: CustomCastMetrics;
  };
} {
  const castEngagementScore = getCastEngagementScore(cast);
  const timeSinceCastInHours =
    (new Date().getTime() - cast.timestamp) / (1000 * 60 * 60);
  const customCastMetrics = {
    new: cast.timestamp,
    top: castEngagementScore,
    casterengagement: 0,
    toplikes: cast.reactions.count,
    toprecasts: cast.recasts.count,
    topwatches: cast.watches.count,
    topreactions: cast.reactions.count,
    topreplies: cast.replies.count,
    topfollowers: 0,
    topfollowernormalized: 0,
    // https://medium.com/hacking-and-gonzo/how-hacker-news-ranking-algorithm-works-1d9b0cf2c08d
    hot: (castEngagementScore - 1) / Math.pow(timeSinceCastInHours + 2, 1.8),
    hotfollowernormalized: 0,
    hotfrequencynormalized: 0,
  };
  return {
    custom_metrics: {
      custom_cast_metrics: customCastMetrics,
    },
  };
}

export function discoveFarcasterProfileMetrics({
  allCastsByProfile,
  profile,
}: {
  allCastsByProfile: MerkleApiCast[];
  profile: FlattenedProfile;
}): FCProfile["custom_metrics"] {
  let registered_at = profile.registered_at;
  if (!registered_at) {
    const firstCastReg = allCastsByProfile.sort(
      (a, b) => a.timestamp - b.timestamp
    )?.[0]?.timestamp;
    if (firstCastReg) {
      registered_at = new Date(firstCastReg);
    }
  }
  let last_known_active =
    registered_at &&
    (profile as any).custom_metrics?.last_known_active &&
    new Date(registered_at) >
      new Date((profile as any).custom_metrics?.last_known_active)
      ? registered_at
      : (profile as any).custom_metrics?.last_known_active || registered_at;
  const mostrecentcastDate: null | number =
    allCastsByProfile.length > 0
      ? allCastsByProfile.sort((a, b) => b.timestamp - a.timestamp)?.[0]
          ?.timestamp ?? null
      : null;
  /**
   * calculate profile quality score based on engagement rates of all casts
   */
  const profileAvgCastEngagementScore =
    allCastsByProfile.reduce((prev, next) => {
      return (
        prev +
        next.replies.count +
        next.reactions.count +
        next.recasts.count +
        next.watches.count
      );
      // needs to have a baseline of 5 casts to avoid skew
    }, 0) / Math.max(allCastsByProfile.length, 5);
  const timestampAWeekAgo = new Date().getTime() - 1000 * 60 * 60 * 24 * 7;
  const profileLastWeekFrequencyScore = allCastsByProfile.filter(
    (cast) => cast.timestamp > timestampAWeekAgo
  ).length;
  const timeSinceRegisterInDays =
    (new Date().getTime() - new Date(profile.registered_at || "").getTime()) /
    (1000 * 60 * 60 * 24);
  /**
   * save profile perf stats
   */
  const recastScore = allCastsByProfile.reduce(
    (prev, next) => prev + next.recasts.count,
    0
  );
  const customProfileMetrics = {
    new: new Date(profile.registered_at || "").getTime(),
    hot:
      (profile.followers ?? 1 - 1) / Math.pow(timeSinceRegisterInDays + 2, 1.8),
    hot_by_engagement:
      (profileAvgCastEngagementScore - 1) /
      Math.pow(timeSinceRegisterInDays + 2, 1.8),
    num_followers: Number(profile.followers) || 1,
    num_following: Number(profile.following) || 1,
    total_likes: allCastsByProfile.reduce(
      (prev, next) => prev + next.reactions.count,
      0
    ),
    total_recasts: recastScore,
    // Needs to compensate for users with low # of casts
    recasts_score: recastScore / Math.max(allCastsByProfile.length, 5),
    total_casts: allCastsByProfile.length,
    last_known_active: mostrecentcastDate
      ? new Date(mostrecentcastDate)
      : new Date(last_known_active),
    frequency_score: profileLastWeekFrequencyScore,
    // Need to compensate for users with 1 cast heading up the leaderboard
    engagement_score: profileAvgCastEngagementScore,
    // Need to compensate for users with few followers heading up the leaderboard
    per_follower_engagement_score:
      profileAvgCastEngagementScore / Math.max(profile.followers ?? 0, 5),
  };

  return customProfileMetrics;
}

export function discoveEachProfilesCasts({
  allCastsByProfile,
  profileCustomMetrics,
}: {
  allCastsByProfile: MerkleApiCast[];
  profileCustomMetrics: FCProfile["custom_metrics"];
}): (cast: MerkleApiCast) => {
  custom_metrics: FCCast["custom_metrics"];
} {
  const timestampAWeekAgo = new Date().getTime() - 1000 * 60 * 60 * 24 * 7;
  const profileLastWeekFrequencyScore = allCastsByProfile.filter(
    (cast) => cast.timestamp > timestampAWeekAgo
  ).length;

  return (
    cast: MerkleApiCast
  ): {
    custom_metrics: FCCast["custom_metrics"];
  } => {
    const castEngagementScore = getCastEngagementScore(cast);

    const timeSinceCastInHours =
      (new Date().getTime() - cast.timestamp) / (1000 * 60 * 60);
    const customCastMetrics = {
      ...discoveCustomMetricsSingleMerkleApiCast(cast).custom_metrics
        .custom_cast_metrics,
      casterengagement:
        profileCustomMetrics?.per_follower_engagement_score || 0,
      topfollowers: profileCustomMetrics?.num_followers || 0,
      topfollowernormalized:
        castEngagementScore / (profileCustomMetrics?.num_followers || 1),
      // https://medium.com/hacking-and-gonzo/how-hacker-news-ranking-algorithm-works-1d9b0cf2c08d
      hotfollowernormalized:
        (castEngagementScore - 1) /
        Math.pow(timeSinceCastInHours + 2, 1.8) /
        (profileCustomMetrics?.num_followers || 1),
      hotfrequencynormalized:
        (castEngagementScore - 1) /
        Math.pow(timeSinceCastInHours + 2, 1.8) /
        (profileLastWeekFrequencyScore || 1),
    };
    return {
      custom_metrics: {
        custom_profile_metrics: profileCustomMetrics,
        custom_cast_metrics: customCastMetrics,
      },
    };
  };
}
