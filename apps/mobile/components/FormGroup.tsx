import React from "react";
import { View, ViewProps } from "./View";

export function FormGroup(props: ViewProps) {
  return <View {...props} style={[{ marginBottom: 18 }, props.style]} />;
}
