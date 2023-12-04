import React from "react";
import Colors from "../constants/Colors";
import Sizes from "../constants/Sizes";
import { Pressable, PressableProps } from "./Pressable";
import { View, ViewProps } from "./View";

type RadioProps<T> = ViewProps & {
  onChange: (nextValue: T) => void;
  value: T;
  children: React.ReactElement<{
    onPress: (nextValue: T) => void;
    currentValue: T;
    value: T;
  }>[];
};

/** A headless Radio **/
export function Radio<T = any>(props: RadioProps<T>) {
  const { children, value, onChange, ...restProps } = props;
  return (
    <View {...restProps}>
      {React.Children.map(children, (child, i) =>
        child
          ? React.cloneElement(child, {
              onChange,
              currentValue: value,
            })
          : null
      )}
    </View>
  );
}

type RadioItemChildType<T> = React.ReactElement<{
  currentValue: T;
  value: T;
  isSelected: boolean;
}>;

type RadioItemProps<T> = PressableProps & {
  value: T;
  children: RadioItemChildType<T>;

  // Injected by Radio, would be ideal to be required and fix the types
  onChange?: (nextValue: T) => void;
  isSelected?: boolean;
  currentValue?: T;
};

/** Must only be used directly inside a <Radio> **/
export function RadioItem<T = any>(props: RadioItemProps<T>) {
  const { onChange, ...restProps } = props;
  return (
    <Pressable {...restProps} onPress={() => onChange?.(props.value)}>
      {React.Children.map(props.children, (child, i) =>
        child
          ? React.cloneElement(child, {
              currentValue: props.currentValue,
              value: props.value,
              isSelected: props.currentValue === props.value,
            })
          : null
      )}
    </Pressable>
  );
}

export function RadioHorizontal<T>(props: RadioProps<T>) {
  return (
    <Radio
      {...props}
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 8,
        ...((props.style as any) || {}),
      }}
    />
  );
}

export const RadioItemHorizontal = (props: RadioItemProps<any>) => {
  const isSelected = props.value === props.currentValue;

  return (
    <RadioItem
      {...props}
      style={{
        flexShrink: 1,
        paddingVertical: Sizes.inputPaddingVertical,
        paddingHorizontal: Sizes.inputPaddingHorizontal,
        borderRadius: Sizes.borderRadiusInput,
        borderWidth: 1,
        ...((props.style as any) || {}),
      }}
      _dark={{
        backgroundColor: isSelected ? Colors.whiteAlpha["100"] : "transparent",
        borderWidth: 1,
        borderColor: Colors.whiteAlpha["100"],

        ...(props._dark || {}),
      }}
      _light={{
        backgroundColor: isSelected ? Colors.blackAlpha["100"] : "transparent",
        borderWidth: 1,
        borderColor: Colors.blackAlpha["100"],

        ...(props._light || {}),
      }}
    />
  );
};
