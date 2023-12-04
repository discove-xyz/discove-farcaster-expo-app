// import { useNavigation } from "@react-navigation/native";
// import React from "react";
// import { ScrollView, View } from "react-native";
// import Colors from "../constants/Colors";
// import { useFavoritedCoves } from "@discove/ui/useFavoritedCoves";
// import { PressableRaw } from "./Pressable";
// import { Text } from "./Text";

// export function FavoritesHeader() {
//   const { favoritedCoves } = useFavoritedCoves();
//   const navigation = useNavigation();

//   return (
//     <ScrollView horizontal>
//       <View style={{ display: "flex", flexDirection: "row" }}>
//         {favoritedCoves.map((cove) => {
//           return (
//             <PressableRaw
//               key={`${cove.username}/${cove.feedname}`}
//               style={{
//                 paddingHorizontal: 8,
//                 paddingVertical: 4,
//                 borderRadius: 4,
//                 marginRight: 4,

//                 backgroundColor: Colors.whiteAlpha["50"],
//                 // borderWidth: 1,
//                 // borderColor: "gray",
//               }}
//               onPress={() => {
//                 navigation.navigate("RoutedFeed", {
//                   username: cove.username,
//                   feedname: cove.feedname,
//                 });
//               }}
//             >
//               <Text style={{ fontSize: 16 }}>{cove.title}</Text>
//             </PressableRaw>
//           );
//         })}
//       </View>
//     </ScrollView>
//   );
// }
