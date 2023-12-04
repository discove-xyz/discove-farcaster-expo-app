import {
  View as ViewLib,
  ViewProps as ViewPropsLib,
  ViewStyle,
} from "react-native";
import { useColorSchemeStyle } from "../constants/Colors";

export type ViewProps = ViewPropsLib & {
  _dark?: ViewStyle;
  _light?: ViewStyle;
};

/** Do a chakra-eque View component here */
export const View = ({ _dark, _light, ...restProps }: ViewProps) => {
  const style = useColorSchemeStyle({ dark: _dark, light: _light });

  return <ViewLib {...restProps} style={[restProps.style, style]} />;
};
