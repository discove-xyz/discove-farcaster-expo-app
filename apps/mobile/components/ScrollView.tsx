import React from "react";
import {
  ScrollView as ScrollViewLib,
  ScrollViewProps as ScrollViewPropsLib,
  ViewStyle,
} from "react-native";
import { useColorSchemeStyle } from "../constants/Colors";

export type ViewProps = ScrollViewPropsLib & {
  _dark?: ViewStyle;
  _light?: ViewStyle;
};

/** Do a chakra-eque View component here */
export const ScrollView = React.forwardRef<ScrollViewLib, ViewProps>(
  ({ _dark, _light, ...restProps }: ViewProps, ref) => {
    const style = useColorSchemeStyle({ dark: _dark, light: _light });

    return <ScrollViewLib {...restProps} style={[restProps.style, style]} />;
  }
);
