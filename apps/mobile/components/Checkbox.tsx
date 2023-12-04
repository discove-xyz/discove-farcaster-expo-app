import CheckboxLib, { CheckboxProps } from "expo-checkbox";
import Colors from "../constants/Colors";

export const Checkbox = (props: CheckboxProps) => {
  return <CheckboxLib color={Colors.indigo["600"]} {...props} />;
};
