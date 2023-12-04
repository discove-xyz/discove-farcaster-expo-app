import React from "react";
import {
  ColorValue,
  Platform,
  Pressable as RNPressable,
  PressableProps as RNPressableProps,
  TextStyle,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Colors, { useColorSchemeStyle } from "../constants/Colors";
import Sizes from "../constants/Sizes";
import { Text } from "./Text";
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

type Variant = "ghost" | "solid" | "outline" | "transparent";
type Size = "sm" | "md" | "lg";

export type PressableProps = RNPressableProps & {
  textStyle?: any;
  variant?: Variant;
  backgroundColor?: ColorValue;
  color?: ColorValue;
  size?: Size;
} & {
  _dark?: ViewStyle;
  _light?: ViewStyle;
} & {
  _textDark?: TextStyle;
  _textLight?: TextStyle;
} & { icon?: React.ReactElement };

export function Pressable({
  _dark,
  _light,
  _textDark,
  icon,
  _textLight,
  ...props
}: PressableProps) {
  const theme = useColorScheme();
  const style = useColorSchemeStyle({ dark: _dark, light: _light });
  const textStyle = useColorSchemeStyle({ dark: _textDark, light: _textLight });

  const scaleDownAnimation = useSharedValue(1);

  const scaleHandler = Gesture.Tap()
    .onBegin(() => {
      "worklet";
      scaleDownAnimation.value = withTiming(0.86, { duration: 160 });
    })
    .onFinalize(() => {
      "worklet";
      scaleDownAnimation.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleDownAnimation.value }],
  }));

  return (
    <GestureDetector gesture={scaleHandler}>
      <Animated.View style={animatedStyle}>
        <RNPressable
          {...props}
          style={[
            {
              // display: 'flex',
              // flexDirection: 'row',
              backgroundColor:
                props.backgroundColor ||
                (props.variant === "ghost"
                  ? "transparent"
                  : props.variant === "transparent"
                  ? theme === "dark"
                    ? Colors.whiteAlpha["200"]
                    : Colors.blackAlpha["200"]
                  : "#ddd"),
              borderRadius: Colors.inputBorderRadius,
              display: "flex",
              flexDirection: "row",
              gap: 8,
              paddingVertical:
                props.size === "sm"
                  ? 5
                  : props.size === "lg"
                  ? 12
                  : Sizes.inputPaddingVertical,

              paddingHorizontal:
                props.size === "sm"
                  ? 8
                  : props.size === "lg"
                  ? 30
                  : Sizes.inputPaddingHorizontal,
            },
            props.style,
            style,
          ]}
        >
          {icon}
          <Text
            style={[
              {
                // width: "100%",
                fontSize:
                  props.size === "sm"
                    ? 15
                    : props.size === "lg"
                    ? 17
                    : Sizes.fontSizeBase,
                flexGrow: 1,
                fontFamily: "SF-Pro-Rounded-Semibold",
                color:
                  props.variant === "transparent"
                    ? theme === "dark"
                      ? Colors.dark.text
                      : Colors.light.text
                    : props.color || "#000",
                textAlign: "center",
                // backgroundColor: "#ddd",
              },
              props.textStyle,
              textStyle,
            ]}
          >
            {props.children}
          </Text>
        </RNPressable>
      </Animated.View>
    </GestureDetector>
  );
}

export function PressableRaw({
  _dark,
  _light,
  ...props
}: RNPressableProps & {
  _dark?: ViewStyle;
  _light?: ViewStyle;
}) {
  const style = useColorSchemeStyle({ dark: _dark, light: _light });

  return <RNPressable {...props} style={[props.style, style]} />;
}
