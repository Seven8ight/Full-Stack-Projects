import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";

export default function Profile(): React.ReactNode {
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
