import { FallbackRender } from "@sentry/react";
import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native";
import { config } from "../lib/config";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fafafa",
    flex: 1,
    justifyContent: "center",
  },
  content: {
    marginHorizontal: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: "300",
    paddingBottom: 16,
    color: "#000",
  },
  subtitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#000",
  },
  error: {
    paddingVertical: 16,
  },
  button: {
    backgroundColor: "#2196f3",
    borderRadius: 50,
    padding: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});

function FallbackComponent(props: Parameters<FallbackRender>[0]) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Oops!</Text>
        <Text style={styles.subtitle}>{"There's an error"}</Text>
        {/* {config.env !== "production" ? (
          <Text style={styles.error}>{JSON.stringify(props.error)}</Text>
        ) : null} */}
        <TouchableOpacity style={styles.button} onPress={props.resetError}>
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default FallbackComponent;
