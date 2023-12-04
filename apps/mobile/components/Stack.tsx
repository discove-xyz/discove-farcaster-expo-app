import React from "react";
import { View, ViewProps } from "./View";

// In react 0.71.0 there is a style gap property
export function VStack(
  props: ViewProps & {
    gap?: number;
    style?: object;
    children:
      | React.ReactElement[]
      | React.ReactElement
      | Array<React.ReactElement | null>;
  }
) {
  return (
    <View
      {...props}
      style={{
        display: "flex",
        flexDirection: "column",
        ...(props.gap ? { gap: props.gap } : {}),
        ...props.style,
      }}
    >
      {React.Children.map(props.children, (child) =>
        child
          ? React.cloneElement(child, {
              style: { ...child.props.style, marginBottom: 8 },
            })
          : null
      )}
    </View>
  );
}

export function HStack(
  props: ViewProps & { gap?: number } & {
    children:
      | Array<null | React.ReactElement | undefined>
      | React.ReactElement
      | null;
    style?: object;
  }
) {
  return (
    <View
      {...props}
      style={{
        display: "flex",
        flexDirection: "row",
        ...(props.gap ? { gap: props.gap } : {}),
        ...(props.style || {}),
      }}
    >
      {React.Children.map(props.children, (child, i) =>
        child
          ? React.cloneElement(child, {
              style: {
                // Prevent x-overflow
                flexShrink: 1,
                ...child?.props?.style,
                ...(i !== 0 && { marginLeft: 8 }),
              },
            })
          : null
      )}
    </View>
  );
}
