import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ImageBackground,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, FontAwesome } from "@expo/vector-icons";
import GoogleIcon from "../_Components/Icons";
import Toast from "react-native-toast-message";
import { toastConfig } from "../_Components/ToastConfig";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import {
  signInAsync as AppleSignIn,
  AppleAuthenticationScope,
} from "expo-apple-authentication";
import Animated, {
  FadeIn,
  FadeOut,
  Layout,
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useTheme } from "../_layout";

const AnimatedEye = ({ visible }: { visible: boolean }) => {
  return (
    <Animated.View
      key={visible ? "eye-open" : "eye-closed"}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
    >
      {visible ? (
        <Feather
          name="eye"
          size={Platform.select({ ios: 20, android: 18 })}
          color="#1A1A1A"
        />
      ) : (
        <Feather
          name="eye-off"
          size={Platform.select({ ios: 20, android: 18 })}
          color="#999"
        />
      )}
    </Animated.View>
  );
};

const Save = async (key: string, value: string) =>
  await SecureStore.setItemAsync(key, value);
const GetToken = async (key: string) => await SecureStore.getItemAsync(key);

const AuthScreen = () => {
  const [page, setPage] = useState<"signup" | "login">("signup"),
    [username, setUsername] = useState<string>(""),
    [email, setEmail] = useState<string>(""),
    [password, setPassword] = useState<string>(""),
    [visible, setVisible] = useState<boolean>(false);

  const { theme } = useTheme(),
    router = useRouter();

  const scale1 = useSharedValue(1),
    scale2 = useSharedValue(1),
    scale3 = useSharedValue(1);

  const animatedStyle1 = useAnimatedStyle(() => ({
      transform: [{ scale: scale1.value }],
    })),
    animatedStyle2 = useAnimatedStyle(() => ({
      transform: [{ scale: scale2.value }],
    })),
    animatedStyle3 = useAnimatedStyle(() => ({
      transform: [{ scale: scale3.value }],
    }));

  const pressIn = (s: any) => (s.value = withTiming(0.96, { duration: 100 })),
    pressOut = (s: any) => (s.value = withSpring(1));

  const handleLegacyAuth = async () => {
      try {
        let authenticationRequest: Response, authenticationResponse: any;

        // Validation Logic
        if (page === "signup" && (!username || username.length <= 0)) {
          triggerToast(
            "error",
            "Error",
            "Invalid username, pass in a username",
          );
          return;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          triggerToast(
            "error",
            "Error",
            "Invalid email, pass in a valid email",
          );
          return;
        }
        if (!password || password.length <= 0) {
          triggerToast(
            "error",
            "Error",
            "Invalid password, pass in a password",
          );
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
          page === "login"
            ? "Log in successful"
            : "Account creation successful",
        );
        await Save("accessToken", authenticationResponse.accessToken);
        await Save("refreshToken", authenticationResponse.refreshToken);

        setTimeout(() => router.push("/(Pages)/Dashboard"), 2000);
      } catch (error) {
        triggerToast("error", "Error", `${(error as Error).message}`);
      }
    },
    handleGoogleOauth = async (type: "signup" | "login") => {
      try {
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();

        if (isSuccessResponse(response)) {
          const { user } = response.data;

          const googleStorage: Response = await fetch(
              `http://192.168.0.12:4000/api/auth/${type == "signup" ? "register" : "login"}/google/mobile`,
              {
                method: "POST",
                headers: {
                  "Content-type": "application/json",
                },
                body: JSON.stringify(user),
              },
            ),
            googleResponse = await googleStorage.json();

          if (!googleStorage.ok) {
            triggerToast("error", "error", `${googleResponse.error}`);
            return;
          }

          await Save("accessToken", googleResponse.accessToken);
          await Save("refreshToken", googleResponse.refreshToken);

          triggerToast(
            "success",
            "Success",
            type == "signup"
              ? "Account creation successful"
              : "Login successful",
          );

          setTimeout(() => {
            router.push("/(Pages)/Dashboard");
          }, 1200);
        }
      } catch (error) {
        if (isErrorWithCode(error)) {
          switch (error.code) {
            case statusCodes.IN_PROGRESS:
              triggerToast("info", "Info", "Google signin is in progress");
              break;
            case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
              triggerToast(
                "error",
                "Error",
                "Google play services not available",
              );
              break;
            default:
              triggerToast("error", "Error", "Unknown error");
              break;
          }
        } else triggerToast("error", "Error", `${(error as Error).message}`);
      }
    },
    handleAppleOauth = async (type: "signup" | "login") => {
      if (Platform.OS != "ios" && Platform.OS != "macos") {
        triggerToast(
          "info",
          "Apple Authentication",
          "Apple sign in, only available on ios Platforms",
        );
        return;
      }

      try {
        const credentials = await AppleSignIn({
          requestedScopes: [
            AppleAuthenticationScope.FULL_NAME,
            AppleAuthenticationScope.EMAIL,
          ],
        });

        const userStorageRequest: Response = await fetch(
            "http://192.168.0.12:4000/api/auth/register/apple/mobile",
            {
              method: "POST",
            },
          ),
          userStorageResponse = await userStorageRequest.json();

        if (!userStorageRequest.ok) {
          triggerToast("error", "Error", userStorageResponse.error);
          return;
        }

        triggerToast(
          "success",
          "Success",
          type == "signup" ? "Account creation successful" : "Login successful",
        );
        setTimeout(() => {
          router.push("/(Pages)/Dashboard");
        }, 1200);
      } catch (error) {
        triggerToast("error", "Error", (error as Error).message);
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
    <>
      <StatusBar
        backgroundColor={"transparent"}
        barStyle={theme == "light" ? "dark-content" : "light-content"}
      />
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
                padding: Platform.select({ ios: 25, android: 22 }),
                flexGrow: 1,
                justifyContent: "center",
              }}
            >
              {/* Header Section */}
              <View style={{ marginBottom: 35 }}>
                <Text
                  style={{
                    fontSize: Platform.select({ ios: 36, android: 30 }),
                    fontWeight: "800",
                    color: "#1A1A1A",
                    letterSpacing: -0.5,
                  }}
                >
                  {page === "signup" ? "Create Account" : "Welcome Back"}
                </Text>
                <Text
                  style={{
                    fontSize: Platform.select({ ios: 17, android: 15 }),
                    color: "#666",
                    marginTop: Platform.select({ ios: 8, android: 4 }),
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
                        padding: Platform.select({ ios: 18, android: 12 }),
                        borderRadius: Platform.select({ ios: 22, android: 14 }),
                        borderWidth: 1.5,
                        borderColor: "#EEE",
                        fontSize: Platform.select({ ios: 16, android: 14 }),
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
                      padding: Platform.select({ ios: 18, android: 12 }),
                      borderRadius: Platform.select({ ios: 22, android: 14 }),
                      borderWidth: 1.5,
                      borderColor: "#EEE",
                      fontSize: Platform.select({ ios: 16, android: 14 }),
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
                        padding: Platform.select({ ios: 18, android: 12 }),
                        borderRadius: Platform.select({ ios: 22, android: 14 }),
                        borderWidth: 1.5,
                        borderColor: "#EEE",
                        fontSize: Platform.select({ ios: 16, android: 14 }),
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
                  onPress={handleLegacyAuth}
                  onPressIn={() => pressIn(scale1)}
                  onPressOut={() => pressOut(scale1)}
                >
                  <Animated.View
                    style={[
                      {
                        backgroundColor: "black",
                        padding: Platform.select({ ios: 20, android: 15 }),
                        borderRadius: Platform.select({ ios: 25, android: 22 }),
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
                      style={{
                        color: "white",
                        fontSize: Platform.select({ ios: 17, android: 15 }),
                        fontWeight: "700",
                      }}
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
                  marginVertical: 32,
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
                    padding: 7,
                    borderRadius: 22,
                    borderWidth: 1,
                    borderColor: "#EEE",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() =>
                    handleGoogleOauth(page == "signup" ? "signup" : "login")
                  }
                >
                  <GoogleIcon style={{ marginRight: 5 }} />
                  <Animated.Text
                    style={[
                      { fontWeight: "600", fontSize: 14, right: 5 },
                      animatedStyle2,
                    ]}
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
                  onPress={() =>
                    handleAppleOauth(page == "login" ? "login" : "signup")
                  }
                >
                  <FontAwesome
                    name="apple"
                    size={20}
                    style={{ marginRight: 12 }}
                  />
                  <Animated.Text
                    style={[
                      { fontWeight: "600", fontSize: 14 },
                      animatedStyle3,
                    ]}
                  >
                    Continue with Apple
                  </Animated.Text>
                </Pressable>
              </View>

              {/* Footer */}
              <View style={{ marginTop: 40, alignItems: "center" }}>
                <Text
                  style={{
                    color: "#666",
                    fontSize: Platform.select({ ios: 15, android: 12 }),
                  }}
                >
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
    </>
  );
};

export default AuthScreen;
