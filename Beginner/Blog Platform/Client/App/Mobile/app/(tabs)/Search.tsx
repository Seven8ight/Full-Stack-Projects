import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Search(): React.ReactNode {
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Search Page</Text>
        <Text>Heyy</Text>
      </SafeAreaView>
    </View>
  );
}
