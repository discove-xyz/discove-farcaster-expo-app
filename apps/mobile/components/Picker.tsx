import {
  Picker as PickerLib,
  PickerProps as PickerPropsLib,
} from "@react-native-picker/picker";
import Sizes from "../constants/Sizes";
import { useThemeColor } from "../hooks/useThemeColor";

export type PickerProps = PickerPropsLib & {
  darkColor?: string;
  lightColor?: string;
};

/** Do a chakra-eque View component here */
export const Picker = ({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: PickerProps) => {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <PickerLib
      style={[{ color, fontSize: Sizes.fontSizeBase }, style]}
      {...otherProps}
      itemStyle={[
        {
          color,
          paddingVertical: Sizes.inputPaddingVertical,
          paddingHorizontal: Sizes.inputPaddingHorizontal,

          fontSize: Sizes.fontSizeBase,
        },
        otherProps.itemStyle,
      ]}
    />
  );
};

export const PickerItem = PickerLib.Item;
