import { Tabs } from "expo-router";
import { View } from "react-native";
import TabBar from "../_Components/TabBar";

export default function RootLayout(): React.ReactNode {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <TabBar {...props} />}
    />
  );
}
