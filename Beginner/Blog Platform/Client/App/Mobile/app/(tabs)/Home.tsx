import { Feather } from "@expo/vector-icons";
import {
  View,
  Text,
  Image,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Styles } from "../_Styles/Styles";

export default function Home(): React.ReactNode {
  return (
    <ScrollView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={Styles.Header}>
          <Text style={{ fontSize: 20 }}>Bloggy</Text>
          <Feather
            name="user"
            size={20}
            style={{ alignSelf: "center", top: 2 }}
          />
        </View>
        <View id="blogs">
          <View
            id="showcase"
            style={{
              top: 50,
              width: "90%",
              height: Platform.select({ ios: 375, android: 410 }),
              borderRadius: 30,
              backgroundColor: "white",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              elevation: 10,
              shadowRadius: 3,
              shadowColor: "black",
              shadowOpacity: 0.08,
              left: Platform.select({ ios: 22.5, android: 18 }),
              padding: 2.5,
            }}
          >
            <Image
              style={{
                height: 200,
                width: "100%",
                borderRadius: 30,
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
              }}
              source={require("./../../assets/images/Background.jpg")}
            />
            <View
              id="Article-Meta"
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                margin: "auto",
                marginVertical: 5,
                marginTop: 10,
                width: "95%",
              }}
            >
              <Text>10 min read</Text>
              <Text>30th May</Text>
            </View>
            <View style={{ padding: 10 }}>
              <Text style={{ fontSize: 30, marginBottom: 10 }}>Big header</Text>
              <Text style={{ fontSize: 18 }}>
                Slug, some very very long text here ....
              </Text>
              <Pressable
                style={{
                  backgroundColor: "black",
                  padding: 10,
                  borderRadius: 10,
                  marginVertical: 15,
                }}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  Read
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
        <View></View>
      </SafeAreaView>
    </ScrollView>
  );
}
