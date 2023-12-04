import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, View } from "react-native";
import { Text } from "../components/Text";
import { AuthedScreenProps } from "../navigation/navigation-types";

export default function ModalScreen(props: AuthedScreenProps<"Modal">) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modal</Text>
      <View
        style={styles.separator}
        // lightColor="#eee"
        // darkColor="rgba(255,255,255,0.1)"
      />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: "SF-Pro-Rounded-Semibold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
