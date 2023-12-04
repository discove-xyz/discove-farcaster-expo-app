import { ViewStyle } from "react-native";
import DropDownPickerLib, {
  DropDownPickerProps,
} from "react-native-dropdown-picker";
import Colors, { useColorSchemeStyle } from "../constants/Colors";
import Sizes from "../constants/Sizes";
import useColorScheme from "../hooks/useColorScheme";

/** Do a chakra-eque DropDownPicker component here.
 * Docs: https://hossein-zare.github.io/react-native-dropdown-picker-website/docs/usage
 */
export const DropDownPicker = ({
  _dark,
  _light,
  ...restProps
}: DropDownPickerProps<any> & { _dark?: ViewStyle; _light?: ViewStyle }) => {
  const colorScheme = useColorScheme();
  const style = useColorSchemeStyle({
    dark: {
      backgroundColor: Colors.dark.background,
      color: Colors.dark.text,
      borderColor: Colors.dark.borderColor,
      ..._dark,
    },
    light: {
      backgroundColor: Colors.light.background,
      color: Colors.light.text,
      borderColor: Colors.light.borderColor,

      ..._light,
    },
  });

  return (
    <DropDownPickerLib
      {...restProps}
      theme={colorScheme === "dark" ? "DARK" : "LIGHT"}
      style={[
        restProps.style,
        {
          borderRadius: Sizes.borderRadiusInput,
          minHeight: Sizes.inputPaddingVertical * 2 + Sizes.fontSizeBase,
        },
        style,
      ]}
      containerStyle={{
        zIndex: 100,
      }}
      dropDownContainerStyle={{
        zIndex: 100,
        elevation: 100,
        borderColor:
          colorScheme === "dark"
            ? Colors.dark.borderColor
            : Colors.light.borderColor,
        backgroundColor:
          colorScheme === "dark"
            ? Colors.dark.background
            : Colors.light.background,
      }}
      modalContentContainerStyle={{
        borderColor:
          colorScheme === "dark"
            ? Colors.dark.borderColor
            : Colors.light.borderColor,
        backgroundColor:
          colorScheme === "dark"
            ? Colors.dark.background
            : Colors.light.background,
      }}
      badgeStyle={{}}
      itemSeparatorStyle={{
        backgroundColor:
          colorScheme === "dark"
            ? Colors.dark.background
            : Colors.light.background,
      }}
      listMessageContainerStyle={{}}
      modalTitleStyle={{
        color: colorScheme === "dark" ? Colors.dark.text : Colors.light.text,
      }}
      searchTextInputStyle={{
        borderColor:
          colorScheme === "dark"
            ? Colors.dark.borderColor
            : Colors.light.borderColor,
        color: colorScheme === "dark" ? Colors.dark.text : Colors.light.text,
      }}
      listItemLabelStyle={{
        color: colorScheme === "dark" ? Colors.dark.text : Colors.light.text,
      }}
      textStyle={{
        fontSize: Sizes.fontSizeBase,

        color: colorScheme === "dark" ? Colors.dark.text : Colors.light.text,
      }}
      labelStyle={{
        color: colorScheme === "dark" ? Colors.dark.text : Colors.light.text,
      }}
      arrowIconStyle={{
        backgroundColor:
          colorScheme === "dark"
            ? Colors.dark.background
            : Colors.light.background,
      }}
      tickIconStyle={{
        backgroundColor:
          colorScheme === "dark"
            ? Colors.dark.background
            : Colors.light.background,
      }}
      closeIconStyle={{
        backgroundColor:
          colorScheme === "dark"
            ? Colors.dark.background
            : Colors.light.background,
      }}
      iconContainerStyle={{
        backgroundColor:
          colorScheme === "dark"
            ? Colors.dark.background
            : Colors.light.background,
      }}
      arrowIconContainerStyle={{
        backgroundColor:
          colorScheme === "dark"
            ? Colors.dark.background
            : Colors.light.background,
      }}
      tickIconContainerStyle={{
        backgroundColor:
          colorScheme === "dark"
            ? Colors.dark.background
            : Colors.light.background,
      }}
      closeIconContainerStyle={{
        backgroundColor:
          colorScheme === "dark"
            ? Colors.dark.background
            : Colors.light.background,
      }}
    />
  );
};
