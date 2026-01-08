import { Text, View, Pressable } from "react-native";
import { router } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Pressable onPress={() => router.push("/(tabs)/Home")}>
        <Text>Go to home page of tabs</Text>
      </Pressable>
    </View>
  );
}
