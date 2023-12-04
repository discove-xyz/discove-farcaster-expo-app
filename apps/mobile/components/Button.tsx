import React from "react";
import { Button as RNButton, ButtonProps as RNButtonProps } from "react-native";
import Colors from "../constants/Colors";

export function Button(props: RNButtonProps) {
  return <RNButton {...props} color={Colors.indigo["600"]} />;
}
