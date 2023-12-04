import {
  TouchableHighlight as TouchableHighlightLib,
  TouchableHighlightProps as TouchableHighlightPropsLib,
  useColorScheme,
  ViewStyle,
} from "react-native";
import Colors, { useColorSchemeStyle } from "../constants/Colors";

export type TouchableHighlightProps = TouchableHighlightPropsLib & {
  _dark?: ViewStyle;
  _light?: ViewStyle;
  children?: React.ReactElement;
};

/** Do a chakra-eque TouchableHighlight component here */
export const TouchableHighlight = ({
  _dark,
  _light,
  ...restProps
}: TouchableHighlightProps) => {
  const style = useColorSchemeStyle({ dark: _dark, light: _light });
  const colorScheme = useColorScheme();

  return (
    <TouchableHighlightLib
      underlayColor={
        colorScheme === "dark"
          ? Colors.dark.background
          : Colors.light.background
      }
      {...restProps}
      style={[restProps.style, style]}
    />
  );
};
