import React, { useState, useRef } from "react";
import { TouchableWithoutFeedback, StyleSheet } from "react-native";
import { Icon } from "./Icon";
import { Text } from "./Text";
import { View } from "./View";

export const AccordionListItem = (props: any) => {
  const [open, setOpen] = useState(false);

  const toggleListItem = () => {
    setOpen(!open);
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={() => toggleListItem()}>
        <View style={{ ...styles.titleContainer, ...props.style }}>
          <Icon name={open ? "chevron-down" : "chevron-right"} size={24} />
          <Text>{props.title}</Text>
        </View>
      </TouchableWithoutFeedback>
      <View style={open ? { display: "flex" } : { display: "none" }}>
        {props.children}
      </View>
    </>
  );
};
export default AccordionListItem;

const styles = StyleSheet.create({
  bodyBackground: {
    overflow: "hidden",
  },
  titleContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
});
