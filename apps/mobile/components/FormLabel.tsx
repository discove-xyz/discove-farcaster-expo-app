import React from "react";
import { Text as RNText, TextProps as RNTextProps } from "react-native";
import Sizes from "../constants/Sizes";
import { ThemeProps, useThemeColor } from "../hooks/useThemeColor";

export function FormLabel(
  props: RNTextProps & ThemeProps & { style?: object }
) {
  const { style = {}, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <RNText
      {...props}
      style={{
        color,
        fontFamily: "Inter-Bold",
        fontSize: Sizes.fontSizeBase,
        paddingBottom: 4,
        ...(style || {}),
      }}
      {...otherProps}
    />
  );
}
