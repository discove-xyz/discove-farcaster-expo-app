export const cove_sort_orders = [
  { label: "hot", value: "hot" },
  {
    label: "new",
    value: "new",
  },
  { label: "top", value: "top" },
];

export const cast_sort_orders = [
  { label: "new", value: "new" },
  { label: "hot", value: "hot" },
  {
    value: "topfollowernormalized",
    label: "top (normalized by # followers)",
  },
  {
    value: "hotfollowernormalized",
    label: "hot (weighting casts by accounts with fewer followers)",
  },
  {
    value: "hotfrequencynormalized",
    label: "hot (weighting casts by accounts that cast less frequently)",
  },
  { value: "toplikes", label: "most likes" },
  { value: "toprecasts", label: "most recasts" },
  { value: "topwatches", label: "most watches" },
  { value: "topreplies", label: "most replies" },
  { value: "topreactions", label: "most reactions" },
  { value: "topfollowers", label: "most followers" },
  {
    value: "casterengagement",
    label: "by caster&apos;s typical normalized engagement score",
  },
];

export const profile_sort_orders = [
  { value: "new", label: "new" },
  { value: "hot", label: "hot (by # followers)" },
  { value: "hot_by_engagement", label: "hot (by # likes)" },
  { value: "engagement_score", label: "top (by cast engagement rate)" },
  { value: "total_likes", label: "top (total # likes)" },
  { value: "total_casts", label: "top (total # casts)" },
  { value: "num_followers", label: "top (by # followers)" },
  { value: "num_following", label: "top (by # following)" },
  { value: "frequency_score", label: "top (by frequency of casting)" },
  {
    value: "per_follower_engagement_score",
    label: "top (by cast engagement rate normalized by # followers)",
  },
  { value: "last_known_active", label: "recently active" },
];
