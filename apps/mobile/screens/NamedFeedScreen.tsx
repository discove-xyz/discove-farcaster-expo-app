import { View } from "react-native";
import { NamedFeed } from "../components/Feed";
import { FloatingCastButton } from "../components/FloatingCastButton";
import { HomeTabScreenProps } from "../navigation/navigation-types";

export default function NamedFeedScreen(
  props: HomeTabScreenProps<"NamedFeed">
) {
  const { username, feedname } = props.route.params;
  return (
    <>
      <FloatingCastButton />
      <NamedFeed username={username} feedname={feedname} />
    </>
  );
}
