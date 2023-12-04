import { StyleSheet, View } from "react-native";
import { Text } from "../components/Text";
import { TouchableHighlight } from "../components/TouchableHighlight";
import Sizes from "../constants/Sizes";
import { AuthedScreenProps } from "../navigation/navigation-types";

export default function NotFoundScreen({
  navigation,
}: AuthedScreenProps<"NotFound">) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This screen doesn't exist.</Text>
      <TouchableHighlight
        onPress={() =>
          navigation.replace("Root", {
            screen: "Home",
            params: {
              screen: "RoutedFeed",
              params: {},
            },
          })
        }
        style={styles.link}
      >
        <Text style={styles.linkText}>Go to home screen!</Text>
      </TouchableHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: Sizes.fontSizeBase,
    color: "#2e78b7",
  },
});
