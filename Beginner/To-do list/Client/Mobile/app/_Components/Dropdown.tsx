import React, { Dispatch, SetStateAction, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTheme } from "../_layout";

const data = [
  { label: "Complete", value: "complete" },
  { label: "In progress", value: "in progress" },
  { label: "Incomplete", value: "Incomplete" },
];

const DropdownComponent = ({
  value,
  setValue,
}: {
  value: string | null;
  setValue: Dispatch<SetStateAction<string | null>>;
}) => {
  const { theme } = useTheme();
  const [isFocus, setIsFocus] = useState(false);

  const renderLabel = () => {
    if (value || isFocus) {
      //   return <Text style={[styles.label, isFocus && { color: "blue" }]}></Text>;
    }
    return null;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme == "light" ? "white" : "#1A1A1A",
        },
      ]}
    >
      {renderLabel()}
      <Dropdown
        style={[
          styles.dropdown,
          isFocus && { borderColor: "blue" },
          {
            backgroundColor: theme == "light" ? "#F2F2F7" : "#1A1A1A",
          },
        ]}
        placeholderStyle={[
          styles.placeholderStyle,
          {
            color: theme == "light" ? "#1A1A1A" : "#F2F2F7",
          },
        ]}
        selectedTextStyle={[
          styles.selectedTextStyle,
          {
            color: theme == "light" ? "#1A1A1A" : "#F2F2F7",
          },
        ]}
        inputSearchStyle={[
          styles.inputSearchStyle,
          {
            color: theme == "light" ? "#1A1A1A" : "#F2F2F7",
          },
        ]}
        iconStyle={styles.iconStyle}
        data={data}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? "Select status" : "..."}
        searchPlaceholder="Search..."
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setValue(item.value);
          setIsFocus(false);
        }}
        renderLeftIcon={() => (
          <AntDesign
            style={styles.icon}
            color={isFocus ? "blue" : theme == "light" ? "black" : "white"}
            name="alert"
            size={20}
          />
        )}
      />
    </View>
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 16,
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  icon: {
    marginRight: 15,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
