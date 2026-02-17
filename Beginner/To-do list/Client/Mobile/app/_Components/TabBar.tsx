import { Feather } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { View, Text, Pressable, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    width: "75%",
    height: "8%",
    position: "absolute",
    bottom: 20,
    left: "12.5%",
    borderRadius: 30,
    margin: "auto",
    backgroundColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowColor: "black",
    shadowRadius: 3,
    shadowOpacity: 0.08,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    marginTop: 3,
  },
});

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  return (
    <View style={styles.tabBar}>
      {state.routes.sort().map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        // Map your route names to icons/labels
        const iconName =
          route.name.toLowerCase() === "dashboard"
            ? "home"
            : route.name.toLowerCase() === "tasks"
              ? "globe"
              : route.name.toLowerCase() === "profile"
                ? "user"
                : "circle";

        const label = route.name.charAt(0).toUpperCase() + route.name.slice(1);

        return (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
          >
            <Feather
              name={iconName}
              size={28}
              color={isFocused ? "#9B59B6" : "#888"}
            />
            <Text
              style={[styles.label, { color: isFocused ? "#9B59B6" : "#888" }]}
            >
              {label == "Dashboard" ? "Home" : label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
