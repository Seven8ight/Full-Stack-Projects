import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  Alert,
  Platform,
  FlatList,
  Switch,
  useWindowDimensions,
  TextInput,
  ImageBackground,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

const AuthScreen = () => {
  const [switchValue, setSwitch] = useState<boolean>(),
    [modal, setModal] = useState<boolean>(false),
    [modalType, setType] = useState<"user profile" | "password" | null>(null),
    { height } = useWindowDimensions();

  const router = useRouter();

  const [username, setUsername] = useState<string>(""),
    [email, setEmail] = useState<string>(""),
    [password, setPassword] = useState<string>(""),
    [confirmPass, setConfirmedPass] = useState<string>(""),
    [profileImage, setImage] = useState<string>("");

  const logOutHandler = async () => {
      Alert.alert("Log out", "Are you sure, this action is irreversible", [
        {
          text: "Log out",
          style: "destructive",
          onPress: async () => {
            const accessToken = await SecureStore.getItemAsync("accessToken"),
              refreshToken = await SecureStore.getItemAsync("refreshToken");

            if (accessToken) SecureStore.deleteItemAsync("accessToken");
            if (refreshToken) SecureStore.deleteItemAsync("refreshToken");

            router.push("/(Auth)");
          },
        },
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => console.log("Cancelled"),
        },
      ]);
    },
    pickImage = async () => {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission required",
          "Permission to access the media library is required.",
        );
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log(result);

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    };

  useEffect(() => {
    if (!modal) {
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmedPass("");
      setImage("");
    }
  }, [modal]);

  return (
    <>
      <ImageBackground
        source={require("../../assets/images/topography.png")}
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          position: "absolute",
        }}
        resizeMode="cover"
        imageStyle={{ width: "100%", height: "100%" }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* 1. Refined Header */}
          <View style={{ paddingHorizontal: 25, paddingTop: 10 }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "700",
                color: "#1A1A1A",
                marginBottom: 25,
              }}
            >
              Profile
            </Text>
          </View>

          {/* 2. Enhanced Profile Card */}
          <View
            style={{
              marginHorizontal: 25,
              padding: 20,
              borderRadius: 28,
              backgroundColor: "rgba(255, 255, 255, 0.95)", // Subtle translucency
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between", // Better than fixed 'left' offsets
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.05,
              shadowRadius: 15,
              elevation: 5,
              marginBottom: 30,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("./../../assets/images/icon.png")}
                style={{
                  width: 65,
                  height: 65,
                  borderRadius: 32.5,
                  marginRight: 15,
                  borderWidth: 2,
                  borderColor: "#fff",
                }}
              />
              <View>
                <Text
                  style={{ fontSize: 20, fontWeight: "600", color: "#1A1A1A" }}
                >
                  John Doe
                </Text>
                <Text style={{ fontSize: 14, color: "#8E8E93", marginTop: 2 }}>
                  jdoe@gmail.com
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => logOutHandler()}
              style={({ pressed }) => ({
                padding: 10,
                backgroundColor: pressed ? "#FEE2E2" : "#FFF1F1",
                borderRadius: 12,
              })}
            >
              <Feather name="log-out" size={20} color="#EF4444" />
            </Pressable>
          </View>

          {/* 3. Summary Section - Matching Dashboard Style */}
          <View style={{ paddingHorizontal: 25, marginBottom: 30 }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: "#1A1A1A",
                marginBottom: 20,
              }}
            >
              Task Summary
            </Text>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {["To-do", "Progressing", "Done"].map((word, index) => {
                const config = {
                  "To-do": { color: "#FF5252", label: "Incomplete" },
                  Progressing: { color: "#FFB347", label: "In Progress" },
                  Done: { color: "#4CAF50", label: "Completed" },
                }[word as "To-do" | "Progressing" | "Done"];

                return (
                  <View key={index} style={{ alignItems: "center", flex: 1 }}>
                    <View
                      style={{
                        padding: 15,
                        borderRadius: 20,
                        backgroundColor: "white",
                        borderWidth: 1,
                        borderColor: config.color + "30",
                        marginBottom: 10,
                      }}
                    >
                      <Feather
                        name={
                          word == "Done"
                            ? "check-circle"
                            : word == "Progressing"
                              ? "activity"
                              : "alert-octagon"
                        }
                        color={config.color}
                        size={24}
                      />
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: "700" }}>0</Text>
                    <Text style={{ fontSize: 11, color: "grey", marginTop: 2 }}>
                      {config.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* 4. Options List - Cleaned up alignment */}
          <View style={{ paddingHorizontal: 25, flex: 1 }}>
            <FlatList
              data={[
                { icon: "user", text: "User Profile" },
                { icon: "lock", text: "Change Password" },
                { icon: "bell", text: "Push notifications" },
              ]}
              keyExtractor={(item) => item.text}
              renderItem={({ item }) => (
                <Pressable
                  onPress={
                    item.text !== "Push notifications"
                      ? () => {
                          setType(
                            item.text === "User Profile"
                              ? "user profile"
                              : "password",
                          );
                          setModal(true);
                        }
                      : undefined
                  }
                  style={({ pressed }) => ({
                    backgroundColor: "white",
                    padding: 16,
                    borderRadius: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 15,
                    opacity:
                      pressed && item.text !== "Push notifications" ? 0.8 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: "#F8F9FA",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 15,
                    }}
                  >
                    <Feather
                      name={item.icon as any}
                      size={20}
                      color="#1A1A1A"
                    />
                  </View>
                  <Text style={{ flex: 1, fontWeight: "600", fontSize: 15 }}>
                    {item.text}
                  </Text>

                  {item.text === "Push notifications" ? (
                    <Switch
                      style={{ top: 4 }}
                      trackColor={{ false: "grey", true: "rgba(0,255,0,0.75)" }}
                      thumbColor={"white"}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={setSwitch}
                      value={switchValue}
                    />
                  ) : (
                    <Feather name="chevron-right" size={18} color="#C7C7CD" />
                  )}
                </Pressable>
              )}
            />
          </View>

          {/* 5. Feedback Footer - Card Style */}
          <View style={{ padding: 25, paddingBottom: 40, bottom: 50 }}>
            <View
              style={{
                backgroundColor: "#1A1A1A",
                padding: 20,
                borderRadius: 25,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 14,
                  textAlign: "center",
                  opacity: 0.8,
                }}
              >
                Found a bug or have a suggestion?
              </Text>
              <Pressable
                style={{
                  marginTop: 15,
                  backgroundColor: "white",
                  paddingHorizontal: 25,
                  paddingVertical: 10,
                  borderRadius: 15,
                }}
              >
                <Text style={{ fontWeight: "700", fontSize: 14 }}>
                  Write an email
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
      <Modal
        style={{ margin: 0, justifyContent: "flex-end" }}
        isVisible={modal}
        onBackButtonPress={() => setModal(false)}
        onBackdropPress={() => setModal(false)}
        swipeDirection={"down"}
        onSwipeComplete={() => setModal(false)}
        backdropOpacity={0.3}
      >
        <View
          style={{
            height: modalType === "user profile" ? height * 0.6 : height * 0.4,
            backgroundColor: "#F8F9FA",
            borderTopLeftRadius: 35,
            borderTopRightRadius: 35,
            paddingHorizontal: 25,
            paddingTop: 15,
          }}
        >
          {/* Drag Handle */}
          <View
            style={{
              width: 50,
              height: 5,
              backgroundColor: "#E0E0E0",
              borderRadius: 10,
              alignSelf: "center",
              marginBottom: 25,
            }}
          />

          {modalType === "user profile" ? (
            <View>
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{ fontSize: 26, fontWeight: "700", color: "#1A1A1A" }}
                >
                  User Profile
                </Text>
                <Text style={{ color: "#8E8E93", marginTop: 4 }}>
                  Update your personal information
                </Text>
              </View>

              {/* Profile Image Section */}
              <View style={{ alignItems: "center", marginVertical: 15 }}>
                <Pressable
                  onPress={() => pickImage()}
                  style={{ position: "relative" }}
                >
                  <Image
                    source={
                      profileImage.includes("file")
                        ? { uri: profileImage }
                        : require("./../../assets/images/icon.png")
                    }
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      borderWidth: 4,
                      borderColor: "white",
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      right: 0,
                      bottom: 0,
                      backgroundColor: "black",
                      padding: 8,
                      borderRadius: 20,
                      borderWidth: 3,
                      borderColor: "#F8F9FA",
                    }}
                  >
                    <Feather name="camera" size={14} color="white" />
                  </View>
                </Pressable>
              </View>

              {/* Form Fields */}
              <View style={{ marginTop: 10 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#555",
                    marginLeft: 8,
                    marginBottom: 8,
                  }}
                >
                  Username
                </Text>
                <TextInput
                  placeholder="Enter username"
                  placeholderTextColor="#A0A0A0"
                  style={{
                    backgroundColor: "#FFF",
                    padding: 16,
                    borderRadius: 20,
                    borderWidth: 1.5,
                    borderColor: "#F0F0F0",
                    fontSize: 16,
                    marginBottom: 20,
                  }}
                />

                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#555",
                    marginLeft: 8,
                    marginBottom: 8,
                  }}
                >
                  Email
                </Text>
                <TextInput
                  placeholder="Enter email"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                  style={{
                    backgroundColor: "#FFF",
                    padding: 16,
                    borderRadius: 20,
                    borderWidth: 1.5,
                    borderColor: "#F0F0F0",
                    fontSize: 16,
                    marginBottom: 30,
                  }}
                />

                <Pressable
                  style={({ pressed }) => ({
                    backgroundColor: "#000",
                    paddingVertical: 18,
                    borderRadius: 25,
                    alignItems: "center",
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <Text
                    style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}
                  >
                    Update Profile
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View>
              <View style={{ marginBottom: 25 }}>
                <Text
                  style={{ fontSize: 26, fontWeight: "700", color: "#1A1A1A" }}
                >
                  Security
                </Text>
                <Text style={{ color: "#8E8E93", marginTop: 4 }}>
                  Change your account password
                </Text>
              </View>

              <TextInput
                placeholder="New Password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                style={{
                  backgroundColor: "#FFF",
                  padding: 16,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: "#F0F0F0",
                  fontSize: 16,
                  marginBottom: 20,
                }}
              />
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                style={{
                  backgroundColor: "#FFF",
                  padding: 16,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: "#F0F0F0",
                  fontSize: 16,
                  marginBottom: 30,
                }}
              />

              <Pressable
                style={({ pressed }) => ({
                  backgroundColor: "#000",
                  paddingVertical: 18,
                  borderRadius: 25,
                  alignItems: "center",
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <Text
                  style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}
                >
                  Update Password
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};
// <View id="summary">
//           <View id="done">
//             <Text>Completed</Text>
//             <Text>0</Text>
//           </View>
//           <View id="in progress">
//             <Text>In progress</Text>
//             <Text>0</Text>
//           </View>
//           <View id="incomplete">
//             <Text>Completed</Text>
//             <Text>0</Text>
//           </View>
//         </View>
export default AuthScreen;
