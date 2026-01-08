import { View, Text, Pressable } from "react-native";
import { Styles } from "../_Styles/Styles";
import { Feather } from "@expo/vector-icons";
import {
  createAnimatedComponent,
  interpolateColor,
  useAnimatedProps,
  useSharedValue,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect } from "react";

const AnimatedFeatherIcon = createAnimatedComponent(Feather);

const TabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): React.ReactNode => {
  const progress = state.routes.map(() => useSharedValue(0));

  useEffect(() => {
    state.routes.forEach((_, index) => {
      const isFocused = state.index == index;
      progress[index].value = withTiming(isFocused ? 1 : 0, {
        duration: 300,
      });
    });
  }, [state.index]);

  return (
    <View style={Styles.TabBar}>
      {state.routes.map((route, index, routesArr) => {
        const { options } = descriptors[route.key],
          isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented)
            navigation.navigate(route.name);
        };

        const iconProps = useAnimatedProps(() => {
          const color = interpolateColor(
              progress[index].value,
              [0, 1],
              ["black", "grey"]
            ),
            size = interpolate(progress[index].value, [0, 1], [25, 30]);

          return { color: color, size: size };
        });

        const iconName =
            route.name === "Home"
              ? "home"
              : route.name === "Search"
              ? "globe"
              : route.name === "Profile"
              ? "user"
              : "circle",
          label = route.name.charAt(0).toUpperCase() + route.name.slice(1);

        return (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            style={Styles.TabBarItem}
          >
            <AnimatedFeatherIcon name={iconName} animatedProps={iconProps} />
            <Text style={{ top: 5, fontSize: 13 }}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default TabBar;
