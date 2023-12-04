import React from "react";
import { View, ViewProps } from "react-native";

export function Center(props: ViewProps) {
  return (
    <View {...props} style={[{ justifyContent: "center" }, props.style]} />
  );
}
