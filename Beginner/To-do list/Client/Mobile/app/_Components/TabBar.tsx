import { Feather } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { useEffect } from "react";

const { width } = Dimensions.get("window");
const TAB_BAR_WIDTH = width * 0.8;

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const translateX = useSharedValue(0);
  const tabWidth = TAB_BAR_WIDTH / state.routes.length;

  useEffect(() => {
    translateX.value = withSpring(state.index * tabWidth, {
      damping: 30,
      stiffness: 95,
    });
  }, [state.index]);

  return (
    <View style={styles.tabBarContainer}>
      <View style={[styles.tabBar, { width: TAB_BAR_WIDTH }]}>
        {/* 2. The Sliding Indicator */}
        <Animated.View
          style={[
            styles.indicator,
            { width: tabWidth - 10 }, // Subtract for padding
            useAnimatedStyle(() => ({
              transform: [
                {
                  translateX:
                    translateX.value +
                    (state.index == 0 ? 10 : state.index == 1 ? 2 : -2),
                },
              ], // Center it
            })),
          ]}
        />

        {state.routes.map((route, index) => {
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

          const iconName =
            route.name.toLowerCase() === "dashboard"
              ? "home"
              : route.name.toLowerCase() === "tasks"
                ? "list" // Changed globe to list for 'tasks'
                : route.name.toLowerCase() === "profile"
                  ? "user"
                  : "circle";

          return (
            <Pressable key={index} onPress={onPress} style={styles.tabItem}>
              <TabIcon
                name={iconName}
                isFocused={isFocused}
                label={route.name === "Dashboard" ? "Home" : route.name}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// 3. Sub-component for Icon scaling
function TabIcon({
  name,
  isFocused,
  label,
}: {
  name: any;
  isFocused: boolean;
  label: string;
}) {
  const scale = useSharedValue(isFocused ? 1 : 0.9);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.1 : 1);
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedIconStyle, { alignItems: "center" }]}>
      <Feather
        name={name}
        size={22}
        color={isFocused ? "#1A1A1A" : "#999"} // Swapped purple for black to match your new theme
      />
      <Text
        style={[
          styles.label,
          {
            color: isFocused ? "#1A1A1A" : "#999",
            fontWeight: isFocused ? "700" : "500",
          },
        ]}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    height: 70,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 5,
    alignItems: "center",
    // Premium Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  tabItem: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  indicator: {
    position: "absolute",
    height: 50,
    backgroundColor: "#F0F0F0", // Soft grey pill
    borderRadius: 18,
    zIndex: 0,
  },
  label: {
    fontSize: 11,
    marginTop: 4,
  },
});
