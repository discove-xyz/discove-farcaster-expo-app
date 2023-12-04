import React from "react";
import { Text as RNText, TextProps as RNTextProps } from "react-native";
import Sizes from "../constants/Sizes";
import { ThemeProps, useThemeColor } from "../hooks/useThemeColor";

type TextProps = RNTextProps & ThemeProps;

export function H1(props: TextProps) {
  return (
    <Text
      {...props}
      style={{
        ...((props.style as any) || {}),
        fontFamily: "SF-Pro-Rounded-Semibold",
        fontSize: 36,
      }}
    />
  );
}

export function Text({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: TextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <RNText
      style={[{ color, fontSize: Sizes.fontSizeBase }, style]}
      {...otherProps}
    />
  );
}
