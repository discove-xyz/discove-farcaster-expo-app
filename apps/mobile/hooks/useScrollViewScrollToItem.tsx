import React, { useCallback, useRef } from "react";
import { LayoutChangeEvent, ScrollView } from "react-native";

export function useScrollViewScrollToItem() {
  const ref = useRef<ScrollView>(null);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const layout = event.nativeEvent.layout;
    // dataSourceCords[key] = layout.y;
    // setDataSourceCords(dataSourceCords);
    // console.log(dataSourceCords);
    // console.log("height:", layout.height);
    // console.log("width:", layout.width);
    // console.log("x:", layout.x);
    // console.log("y:", layout.y);

    ref.current?.scrollTo({
      animated: true,
      y: layout.y + layout.height + 285,
    });
  }, []);

  return {
    scrollViewRef: ref,
    itemOnLayout: onLayout,
  };
}
