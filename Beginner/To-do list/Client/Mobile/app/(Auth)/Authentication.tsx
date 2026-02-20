import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ImageBackground,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, FontAwesome } from "@expo/vector-icons";
import GoogleIcon from "../_Components/Icons";
import Toast from "react-native-toast-message";
import { toastConfig } from "../_Components/ToastConfig";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";

const AnimatedEye = ({ visible }: { visible: boolean }) => {
  return (
    <Animated.View
      key={visible ? "eye-open" : "eye-closed"}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
    >
      {visible ? (
        <Feather name="eye" size={20} color="#1A1A1A" />
      ) : (
        <Feather name="eye-off" size={20} color="#999" />
      )}
    </Animated.View>
  );
};

const Save = async (key: string, value: string) =>
  await SecureStore.setItemAsync(key, value);
const GetToken = async (key: string) => await SecureStore.getItemAsync(key);

const AuthScreen = () => {
  const [page, setPage] = useState<"signup" | "login">("signup");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);

  const router = useRouter();

  // Animation values
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const scale3 = useSharedValue(1);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
  }));
  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
  }));
  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ scale: scale3.value }],
  }));

  const pressIn = (s: any) => (s.value = withTiming(0.96, { duration: 100 }));
  const pressOut = (s: any) => (s.value = withSpring(1));

  const submitHandler = async () => {
    try {
      let authenticationRequest: Response, authenticationResponse: any;

      // Validation Logic
      if (page === "signup" && (!username || username.length <= 0)) {
        triggerToast("error", "Error", "Invalid username, pass in a username");
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        triggerToast("error", "Error", "Invalid email, pass in a valid email");
        return;
      }
      if (!password || password.length <= 0) {
        triggerToast("error", "Error", "Invalid password, pass in a password");
        return;
      }

      const url =
        page === "login"
          ? "http://192.168.0.12:4000/api/auth/login/legacy"
          : "http://192.168.0.12:4000/api/auth/register/legacy";

      authenticationRequest = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ email, username, password }),
      });
      authenticationResponse = await authenticationRequest.json();

      if (!authenticationRequest.ok) {
        if (authenticationResponse.error?.includes("duplicate")) {
          const field = authenticationResponse.error.includes("username")
            ? "username"
            : "email";
          triggerToast("error", "Error", `Duplicate ${field}, try another`);
        } else {
          triggerToast("error", "Error", `${authenticationResponse.error}`);
        }
        return;
      }

      triggerToast(
        "success",
        "Success",
        page === "login" ? "Log in successful" : "Account creation successful",
      );
      await Save("accessToken", authenticationResponse.accessToken);
      await Save("refreshToken", authenticationResponse.refreshToken);

      setTimeout(() => router.push("/(Pages)/Dashboard"), 2000);
    } catch (error) {
      triggerToast("error", "Error", `${(error as Error).message}`);
    }
  };

  const triggerToast = (type: string, text1: string, text2: string) =>
    Toast.show({ type, text1, text2, position: "bottom" });

  useEffect(() => {
    (async () => {
      if (await GetToken("accessToken")) router.push("/(Pages)/Dashboard");
    })();
  }, []);

  return (
    <ImageBackground
      style={{ flex: 1 }}
      source={require("../../assets/images/Auth-3.jpg")}
    >
      {/* Semi-transparent overlay for content readability */}
      <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.85)" }}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 25,
              flexGrow: 1,
              justifyContent: "center",
            }}
          >
            {/* Header Section */}
            <View style={{ marginBottom: 35 }}>
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: "800",
                  color: "#1A1A1A",
                  letterSpacing: -0.5,
                }}
              >
                {page === "signup" ? "Create Account" : "Welcome Back"}
              </Text>
              <Text
                style={{
                  fontSize: 17,
                  color: "#666",
                  marginTop: 8,
                  lineHeight: 24,
                }}
              >
                {page === "signup"
                  ? "Join Inclyne to start organizing your journey."
                  : "Pick up right where you left off today."}
              </Text>
            </View>

            {/* Inputs Section */}
            <View>
              {page === "signup" && (
                <View style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#444",
                      marginLeft: 5,
                      marginBottom: 8,
                    }}
                  >
                    Username
                  </Text>
                  <TextInput
                    placeholder="John Doe"
                    placeholderTextColor="#AAA"
                    style={{
                      backgroundColor: "white",
                      padding: 18,
                      borderRadius: 22,
                      borderWidth: 1.5,
                      borderColor: "#EEE",
                      fontSize: 16,
                    }}
                    onChangeText={setUsername}
                    value={username}
                  />
                </View>
              )}

              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#444",
                    marginLeft: 5,
                    marginBottom: 8,
                  }}
                >
                  Email
                </Text>
                <TextInput
                  placeholder="doe@gmail.com"
                  placeholderTextColor="#AAA"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{
                    backgroundColor: "white",
                    padding: 18,
                    borderRadius: 22,
                    borderWidth: 1.5,
                    borderColor: "#EEE",
                    fontSize: 16,
                  }}
                  onChangeText={setEmail}
                  value={email}
                />
              </View>

              <View style={{ marginBottom: 25 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#444",
                    marginLeft: 5,
                    marginBottom: 8,
                  }}
                >
                  Password
                </Text>
                <View style={{ justifyContent: "center" }}>
                  <TextInput
                    placeholder="••••••••••••"
                    placeholderTextColor="#AAA"
                    secureTextEntry={!visible}
                    style={{
                      backgroundColor: "white",
                      padding: 18,
                      borderRadius: 22,
                      borderWidth: 1.5,
                      borderColor: "#EEE",
                      fontSize: 16,
                    }}
                    onChangeText={setPassword}
                    value={password}
                  />
                  <Pressable
                    onPress={() => setVisible(!visible)}
                    style={{ position: "absolute", right: 20 }}
                  >
                    <AnimatedEye visible={visible} />
                  </Pressable>
                </View>
              </View>

              <Pressable
                onPress={submitHandler}
                onPressIn={() => pressIn(scale1)}
                onPressOut={() => pressOut(scale1)}
              >
                <Animated.View
                  style={[
                    {
                      backgroundColor: "black",
                      padding: 20,
                      borderRadius: 25,
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 10,
                    },
                    animatedStyle1,
                  ]}
                >
                  <Text
                    style={{ color: "white", fontSize: 17, fontWeight: "700" }}
                  >
                    {page === "signup" ? "Create Account" : "Sign In"}
                  </Text>
                </Animated.View>
              </Pressable>
            </View>

            {/* Divider */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 35,
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: "#DDD" }} />
              <Text
                style={{
                  marginHorizontal: 15,
                  color: "#999",
                  fontWeight: "700",
                  fontSize: 12,
                }}
              >
                OR
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: "#DDD" }} />
            </View>

            {/* Social Auth */}
            <View style={{ gap: 15 }}>
              <Pressable
                onPressIn={() => pressIn(scale2)}
                onPressOut={() => pressOut(scale2)}
                style={{
                  backgroundColor: "white",
                  padding: 18,
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: "#EEE",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <GoogleIcon style={{ marginRight: 12 }} />
                <Animated.Text
                  style={[{ fontWeight: "600", fontSize: 15 }, animatedStyle2]}
                >
                  Continue with Google
                </Animated.Text>
              </Pressable>

              <Pressable
                onPressIn={() => pressIn(scale3)}
                onPressOut={() => pressOut(scale3)}
                style={{
                  backgroundColor: "white",
                  padding: 18,
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: "#EEE",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <FontAwesome
                  name="apple"
                  size={20}
                  style={{ marginRight: 12 }}
                />
                <Animated.Text
                  style={[{ fontWeight: "600", fontSize: 15 }, animatedStyle3]}
                >
                  Continue with Apple
                </Animated.Text>
              </Pressable>
            </View>

            {/* Footer */}
            <View style={{ marginTop: 40, alignItems: "center" }}>
              <Text style={{ color: "#666", fontSize: 15 }}>
                {page === "signup"
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <Text
                  onPress={() =>
                    setPage(page === "signup" ? "login" : "signup")
                  }
                  style={{ color: "black", fontWeight: "800" }}
                >
                  {page === "signup" ? "Log In" : "Sign Up"}
                </Text>
              </Text>
            </View>
          </ScrollView>
          <Toast config={toastConfig} />
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
};

export default AuthScreen;
