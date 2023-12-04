import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  useColorScheme,
} from "react-native";
import React from "react";
import Colors from "../constants/Colors";
import Sizes from "../constants/Sizes";

export const TextInput = React.forwardRef<RNTextInput, RNTextInputProps>(
  (props, ref) => {
    const colorScheme = useColorScheme();
    return (
      <RNTextInput
        placeholderTextColor={
          colorScheme === "dark"
            ? Colors.whiteAlpha["400"]
            : Colors.blackAlpha["400"]
        }
        {...props}
        ref={ref}
        style={[
          {
            backgroundColor:
              colorScheme === "dark"
                ? Colors.dark.background
                : Colors.light.background,
            borderColor:
              colorScheme === "dark"
                ? Colors.dark.borderColor
                : Colors.light.borderColor,
            borderWidth: 1,
            paddingVertical: Sizes.inputPaddingVertical,
            paddingHorizontal: Sizes.inputPaddingHorizontal,
            fontSize: Sizes.fontSizeBase,
            color:
              colorScheme === "dark" ? Colors.dark.text : Colors.light.text,
            borderRadius: Colors.inputBorderRadius,
          },
          props.style,
        ]}
      />
    );
  }
);
