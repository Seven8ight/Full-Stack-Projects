import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, FontAwesome } from "@expo/vector-icons";
import GoogleIcon from "../_Components/Icons";
import Toast from "react-native-toast-message";
import { toastConfig } from "../_Components/ToastConfig";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

const Save = async (key: string, value: string) =>
    await SecureStore.setItemAsync(key, value),
  GetToken = async (key: string) => await SecureStore.getItemAsync(key);

type AuthenticationProps = {
  pageHandler: Dispatch<SetStateAction<"signup" | "login">>;
  email: string;
  password: string;
  username: string;
  usernameHandler: Dispatch<SetStateAction<string>>;
  emailHandler: Dispatch<SetStateAction<string>>;
  passwordHandler: Dispatch<SetStateAction<string>>;
  submitHandler: () => Promise<void>;
};

const Login = ({
    pageHandler,
    email,
    password,
    emailHandler,
    passwordHandler,
    submitHandler,
  }: Omit<AuthenticationProps, "username" | "usernameHandler">) => {
    const [visible, setVisible] = useState<boolean>(false);

    return (
      <View>
        <View id="intro-text">
          <Text
            style={{
              fontSize: 35,
              fontWeight: "700",
              marginBottom: 10,
            }}
          >
            Welcome back
          </Text>
          <Text style={{ fontSize: 19, color: "grey" }}>
            Get back into your account to continue your progress
          </Text>
        </View>

        <View id="inputs" style={{ marginTop: 35 }}>
          <View id="email-input">
            <Text
              style={{
                fontSize: 16,
              }}
            >
              Email
            </Text>
            <TextInput
              placeholder={`Doe@gmail.com`}
              style={{
                marginBottom: 30,
                marginTop: 15,
                padding: 17,
                backgroundColor: "#fff",
                borderRadius: 30,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                elevation: 5,
              }}
              onChangeText={emailHandler}
              value={email}
            />
          </View>
          <View id="password-input">
            <Text
              style={{
                fontSize: 16,
              }}
            >
              Password
            </Text>
            <Pressable onPress={() => setVisible(!visible)}>
              <View
                style={{
                  position: "absolute",
                  left: "89%",
                  top: 29,
                }}
              >
                {visible ? (
                  <Feather name="eye" size={20} />
                ) : (
                  <Feather name="eye-off" size={20} />
                )}
              </View>
            </Pressable>
            <TextInput
              placeholder="eh193jk409(*)2-4r-_efe"
              secureTextEntry={!visible}
              style={{
                marginBottom: 30,
                marginTop: 15,
                padding: 17,
                backgroundColor: "#fff",
                borderRadius: 30,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                elevation: 5,
                zIndex: -1,
              }}
              onChangeText={passwordHandler}
              value={password}
            />
          </View>

          <Pressable
            style={{ marginTop: 15, marginBottom: 25, alignItems: "center" }}
            onPress={() => submitHandler()}
          >
            <Text
              style={{
                padding: 20,
                backgroundColor: "black",
                color: "white",
                width: "100%",
                textAlign: "center",
                borderRadius: 30,
                fontWeight: 500,
              }}
            >
              Log in
            </Text>
          </Pressable>
        </View>
        <View
          id="or"
          style={{
            marginVertical: 20,
            marginBottom: 40,
          }}
        >
          <View
            style={{
              width: "40%",
              backgroundColor: "black",
              height: 1,
              left: 17,
              alignSelf: "flex-start",
              top: 10,
            }}
          />
          <Text style={{ textAlign: "center" }}>Or</Text>
          <View
            style={{
              width: "40%",
              backgroundColor: "black",
              height: 1,
              right: 17,
              alignSelf: "flex-end",
              bottom: 8,
            }}
          />
        </View>

        <View id="oauth" style={{ alignItems: "center", top: 1 }}>
          <Pressable
            style={{
              backgroundColor: "white",
              padding: 20,
              width: "100%",
              borderRadius: 30,
              marginBottom: 25,
              borderBlockColor: "grey",
              borderWidth: 1,
            }}
          >
            <GoogleIcon style={{ position: "absolute", left: 105, top: 8 }} />
            <Text style={{ textAlign: "center", left: 10, fontWeight: 600 }}>
              Sign in with google
            </Text>
          </Pressable>
          <Pressable
            style={{
              backgroundColor: "white",
              padding: 20,
              width: "100%",
              borderRadius: 30,
              marginBottom: 25,
              borderBlockColor: "grey",
              borderWidth: 1,
            }}
          >
            <FontAwesome
              name="apple"
              size={23}
              style={{
                position: "absolute",
                left: 122.5,
                top: 15,
              }}
            />
            <Text style={{ textAlign: "center", left: 10, fontWeight: 600 }}>
              Sign in with apple
            </Text>
          </Pressable>
        </View>

        <View id="login option" style={{ alignItems: "center", top: 20 }}>
          <Text>
            Don't have an account?{" "}
            <Pressable onPress={() => pageHandler("signup")}>
              <Text
                style={{
                  position: "relative",
                  top: 4,
                  color: "black",
                  fontWeight: "bold",
                }}
              >
                Sign up
              </Text>
            </Pressable>
          </Text>
        </View>
      </View>
    );
  },
  Signup = ({
    pageHandler,
    email,
    username,
    password,
    usernameHandler,
    passwordHandler,
    emailHandler,
    submitHandler,
  }: AuthenticationProps) => {
    const [visible, setVisible] = useState<boolean>(false);

    return (
      <View>
        <View id="intro-text">
          <Text
            style={{
              fontSize: 30,
              fontWeight: "700",
              marginBottom: 10,
            }}
          >
            Create an account
          </Text>
          <Text style={{ fontSize: 19, color: "grey" }}>
            To get started on your organization journey
          </Text>
        </View>

        <View id="inputs" style={{ marginTop: 35 }}>
          <View id="username-input">
            <Text
              style={{
                fontSize: 16,
              }}
            >
              Username
            </Text>
            <TextInput
              onChangeText={usernameHandler}
              value={username}
              placeholder="John Doe"
              style={{
                marginBottom: 30,
                marginTop: 15,
                padding: 17,
                backgroundColor: "#fff",
                borderRadius: 30,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                elevation: 5,
              }}
            />
          </View>
          <View id="email-input">
            <Text
              style={{
                fontSize: 16,
              }}
            >
              Email
            </Text>
            <TextInput
              onChangeText={emailHandler}
              value={email}
              placeholder={`Doe@gmail.com`}
              style={{
                marginBottom: 30,
                marginTop: 15,
                padding: 17,
                backgroundColor: "#fff",
                borderRadius: 30,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                elevation: 5,
              }}
            />
          </View>
          <View id="password-input">
            <Text
              style={{
                fontSize: 16,
              }}
            >
              Password
            </Text>
            <TextInput
              placeholder="eh193jk409(*)2-4r-_efe"
              onChangeText={passwordHandler}
              value={password}
              secureTextEntry={!visible}
              style={{
                marginBottom: 30,
                marginTop: 15,
                padding: 17,
                backgroundColor: "#fff",
                borderRadius: 30,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                elevation: 5,
              }}
            />
            <Pressable onPress={() => setVisible(!visible)}>
              <View style={{ position: "absolute", left: "89%", bottom: 45 }}>
                {visible ? (
                  <Feather name="eye" size={20} />
                ) : (
                  <Feather name="eye-off" size={20} />
                )}
              </View>
            </Pressable>
          </View>

          <Pressable
            style={{ marginTop: 15, marginBottom: 25, alignItems: "center" }}
            onPress={() => submitHandler()}
          >
            <Text
              style={{
                padding: 20,
                backgroundColor: "black",
                color: "white",
                width: "100%",
                textAlign: "center",
                borderRadius: 30,
              }}
            >
              Sign up
            </Text>
          </Pressable>
        </View>
        <View
          id="or"
          style={{
            marginBottom: 25,
          }}
        >
          <View
            style={{
              width: "40%",
              backgroundColor: "black",
              height: 1,
              left: 17,
              alignSelf: "flex-start",
              top: 10,
            }}
          />
          <Text style={{ textAlign: "center" }}>Or</Text>
          <View
            style={{
              width: "40%",
              backgroundColor: "black",
              height: 1,
              right: 17,
              alignSelf: "flex-end",
              bottom: 8,
            }}
          />
        </View>

        <View id="oauth" style={{ alignItems: "center", top: 1 }}>
          <Pressable
            style={{
              backgroundColor: "white",
              padding: 20,
              width: "100%",
              borderRadius: 30,
              marginBottom: 25,
              borderBlockColor: "grey",
              borderWidth: 1,
            }}
          >
            <GoogleIcon style={{ position: "absolute", left: 108, top: 9 }} />
            <Text style={{ textAlign: "center", left: 10 }}>
              Sign in with google
            </Text>
          </Pressable>
          <Pressable
            style={{
              backgroundColor: "white",
              padding: 20,
              width: "100%",
              borderRadius: 30,
              marginBottom: 25,
              borderBlockColor: "grey",
              borderWidth: 1,
            }}
          >
            <FontAwesome
              name="apple"
              size={23}
              style={{
                position: "absolute",
                left: 122.5,
                top: 15,
              }}
            />
            <Text style={{ textAlign: "center", left: 10 }}>
              Sign in with apple
            </Text>
          </Pressable>
        </View>

        <View id="login option" style={{ alignItems: "center", top: 20 }}>
          <Text>
            Already have an account?{" "}
            <Pressable onPress={() => pageHandler("login")}>
              <Text
                style={{
                  position: "relative",
                  top: 4,
                  color: "black",
                  fontWeight: "bold",
                }}
              >
                Log In
              </Text>
            </Pressable>
          </Text>
        </View>
      </View>
    );
  };

const AuthScreen = () => {
  const [page, setPage] = useState<"signup" | "login">("signup"),
    [username, setUsername] = useState<string>(""),
    [email, setEmail] = useState<string>(""),
    [password, setPassword] = useState<string>("");

  const router = useRouter();

  const submitHandler = async () => {
      try {
        let authenticationRequest: Response, authenticationResponse: any;

        if (page == "login") {
          if (
            !email ||
            email.length <= 0 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          ) {
            triggerToast(
              "error",
              "Error",
              "Invalid email, pass in a valid email",
            );
            return;
          } else if (!password || password.length <= 0) {
            triggerToast(
              "error",
              "Error",
              "Invalid password, pass in a password",
            );
            return;
          }

          ((authenticationRequest = await fetch(
            "http://localhost:4000/api/auth/login/legacy",
            {
              method: "POST",
              body: JSON.stringify({
                email,
                username,
                password,
              }),
            },
          )),
            (authenticationResponse = await authenticationRequest.json()));

          if (!authenticationRequest.ok) {
            if (authenticationResponse.error.includes("duplicate")) {
              if (authenticationResponse.error.includes("username"))
                triggerToast(
                  "error",
                  "Error",
                  `Duplicate username, try another`,
                );
              else if (authenticationResponse.error.includes("email"))
                triggerToast("error", "Error", `Duplicate email, try another`);
            }

            return;
          }

          triggerToast("success", "Success", "Log in successful");

          await Save("accessToken", authenticationResponse.accessToken);
          await Save("refreshToken", authenticationResponse.refreshToken);

          setTimeout(() => router.push("/(Pages)/Dashboard"), 2500);
        } else {
          if (!username || username.length <= 0) {
            triggerToast(
              "error",
              "Error",
              "Invalid username, pass in a username",
            );
            return;
          } else if (
            !email ||
            email.length <= 0 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          ) {
            triggerToast(
              "error",
              "Error",
              "Invalid email, pass in a valid email",
            );
            return;
          } else if (!password || password.length <= 0) {
            triggerToast(
              "error",
              "Error",
              "Invalid password, pass in a password",
            );
            return;
          }

          ((authenticationRequest = await fetch(
            "http://localhost:4000/api/auth/register/legacy",
            {
              method: "POST",
              body: JSON.stringify({
                email,
                username,
                password,
              }),
            },
          )),
            (authenticationResponse = await authenticationRequest.json()));

          if (!authenticationRequest.ok) {
            if (authenticationResponse.error.includes("duplicate")) {
              if (authenticationResponse.error.includes("username"))
                triggerToast(
                  "error",
                  "Error",
                  `Duplicate username, try another`,
                );
              else if (authenticationResponse.error.includes("email"))
                triggerToast("error", "Error", `Duplicate email, try another`);
            } else
              triggerToast("error", "Error", `${authenticationResponse.error}`);
            return;
          }

          triggerToast("success", "Success", "Account creation successful");

          await Save("accessToken", authenticationResponse.accessToken);
          await Save("refreshToken", authenticationResponse.refreshToken);

          setTimeout(() => router.push("/(Pages)/Dashboard"), 2500);
        }
      } catch (error) {
        triggerToast("error", "Error", `${(error as Error).message}`);
      }
    },
    triggerToast = (type: string, text1: string, text2: string) =>
      Toast.show({
        type: type,
        text1: text1,
        text2: text2,
        position: "bottom",
      });

  useEffect(() => {
    (async () => {
      if (await GetToken("accessToken")) router.push("/(Pages)/Dashboard");
    })();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      {page === "signup" ? (
        <Signup
          pageHandler={setPage}
          username={username}
          usernameHandler={setUsername}
          email={email}
          emailHandler={setEmail}
          password={password}
          passwordHandler={setPassword}
          submitHandler={submitHandler}
        />
      ) : (
        <Login
          pageHandler={setPage}
          email={email}
          emailHandler={setEmail}
          password={password}
          passwordHandler={setPassword}
          submitHandler={submitHandler}
        />
      )}
      <Toast config={toastConfig} />
    </SafeAreaView>
  );
};

export default AuthScreen;
