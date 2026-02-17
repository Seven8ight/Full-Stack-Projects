import { Tabs, useSegments } from "expo-router";
import CustomTabBar from "../_Components/TabBar";

const RootLayout = () => {
  const segments = useSegments();

  // Hide if we're on 'settings' (or deeper nested routes)
  const hideTabBar = segments.includes("settings" as never);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // tabBarStyle: hideTabBar ? { display: "none" } : styles.tabBar,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="Dashboard"></Tabs.Screen>
      <Tabs.Screen name="Tasks"></Tabs.Screen>
      <Tabs.Screen name="Profile"></Tabs.Screen>
    </Tabs>
  );
};

export default RootLayout;
