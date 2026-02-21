import { Feather } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  Alert,
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
import { useUserObject } from "./_layout";
import Toast from "react-native-toast-message";
import { toastConfig } from "../_Components/ToastConfig";
import { useTheme } from "../_layout";

const ProfilePage = () => {
  const [switchValue, setSwitch] = useState<boolean>(),
    [modal, setModal] = useState<boolean>(false),
    [modalType, setType] = useState<
      "user profile" | "password" | "email" | null
    >(null),
    { height } = useWindowDimensions(),
    { userDetails, tasks, tokens, setUserDetails } = useUserObject();

  const router = useRouter(),
    { theme } = useTheme();

  const [newDetails, setNewDetails] = useState({
      username: "",
      email: "",
      password: "",
      confirmPass: "",
    }),
    [profileImage, setImage] = useState<string>("");

  const doneTasks = useCallback(
      () => tasks.filter((task) => task.status == "complete").length,
      [tasks],
    ),
    inProgressTasks = useCallback(
      () => tasks.filter((task) => task.status == "incomplete").length,
      [tasks],
    ),
    incompleteTasks = useCallback(
      () => tasks.filter((task) => task.status == "in progress").length,
      [tasks],
    );

  const updateField = (key: string, value: string) => {
      setNewDetails((details) => ({
        ...details,
        [key]: value,
      }));
    },
    updateProfile = async () => {
      let filledDetails: Record<string, string> = {};

      for (let [key, value] of Object.entries(newDetails)) {
        if (value.length > 0) filledDetails[key] = value;
      }

      if (filledDetails.password) {
        if (filledDetails.confirmPass != filledDetails.password) {
          Toast.show({
            text1: "Error",
            text2: "Passwords do not match",
            type: "error",
          });
          return;
        }
      }

      if (profileImage.length > 0) filledDetails["profileimage"] = profileImage;

      try {
        const updateRequest = await fetch(
            "http://192.168.0.12:4000/api/users/edit",
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${tokens?.accessToken}`,
                "Content-type": "application/json",
              },
              body: JSON.stringify(filledDetails),
            },
          ),
          updateResponse = await updateRequest.json();

        if (!updateRequest.ok) {
          Toast.show({
            text1: "Error",
            text2: `${updateResponse.error}`,
            type: "error",
          });
          return;
        }

        Toast.show({
          text1: "Success",
          text2: "Update successful",
          type: "success",
        });

        setUserDetails((user) => ({
          ...updateResponse.updatedUser,
        }));
      } catch (error) {
        Toast.show({
          text1: "Error",
          text2: `${(error as Error).message}`,
          type: "error",
        });
      }
    };

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

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    };

  useEffect(() => {
    if (!modal) {
      setNewDetails({
        username: "",
        email: "",
        password: "",
        confirmPass: "",
      });
      setImage("");
    }
  }, [modal]);

  return (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: theme == "light" ? "#FDFDFD" : "#121212",
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* 1. Refined Header */}
          <View style={{ paddingHorizontal: 25, paddingTop: 10 }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "700",
                color: theme == "light" ? "#1A1A1A" : "#F2F2F7",
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
              backgroundColor:
                theme == "light" ? "rgba(255, 255, 255, 0.95)" : "#1a1a1a", // Subtle translucency
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
                source={
                  userDetails!.profileImage
                    ? { uri: userDetails!.profileImage }
                    : require("./../../assets/images/icon.png")
                }
                style={{
                  width: 65,
                  height: 65,
                  borderRadius: 32.5,
                  marginRight: 15,
                  borderWidth: 2,
                  borderColor: theme == "light" ? "#fff" : "#121212",
                }}
              />
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: theme == "light" ? "#1A1A1A" : "#f2f2f7",
                  }}
                >
                  {userDetails!.username}
                </Text>
                <Text style={{ fontSize: 14, color: "#8E8E93", marginTop: 2 }}>
                  {userDetails!.email}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => logOutHandler()}
              style={({ pressed }) => ({
                padding: 10,
                backgroundColor: pressed
                  ? "#FEE2E2"
                  : theme == "light"
                    ? "#FFF1F1"
                    : "#0B0E11",
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
                color: theme == "light" ? "#1A1A1A" : "#f2f2f7",
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
                        backgroundColor: theme == "light" ? "white" : "#121212",
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
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: theme == "light" ? "#121212" : "#f2f2f7",
                      }}
                    >
                      {word == "Done"
                        ? doneTasks()
                        : word == "Progressing"
                          ? inProgressTasks()
                          : incompleteTasks()}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: theme == "light" ? "grey" : "#f2f2f7",
                        marginTop: 2,
                      }}
                    >
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
                { icon: "user", text: "Change profile" },
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
                            item.text === "Change profile"
                              ? "user profile"
                              : "password",
                          );
                          setModal(true);
                        }
                      : undefined
                  }
                  style={({ pressed }) => ({
                    backgroundColor: theme == "light" ? "white" : "#1a1a1a",
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
                      backgroundColor: theme == "light" ? "#F8F9FA" : "#121212",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 15,
                    }}
                  >
                    <Feather
                      name={item.icon as any}
                      size={20}
                      color={theme == "light" ? "#1A1A1A" : "#f2f2f7"}
                    />
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontWeight: "600",
                      fontSize: 15,
                      color: theme == "light" ? "#1a1a1a" : "#f2f2f7",
                    }}
                  >
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
                onPress={() => {
                  setType("email");
                  setModal(true);
                }}
              >
                <Text style={{ fontWeight: "700", fontSize: 14 }}>
                  Write an email
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
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
            height:
              modalType === "user profile"
                ? height * 0.6
                : modalType == "password"
                  ? height * 0.4
                  : height * 0.35,
            backgroundColor: theme == "light" ? "#F8F9FA" : "#121212",
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
                  style={{
                    fontSize: 26,
                    fontWeight: "700",
                    color: theme == "light" ? "#1A1A1A" : "#f2f2f7",
                  }}
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
                        : userDetails!.profileImage
                          ? { uri: userDetails!.profileImage }
                          : require("./../../assets/images/icon.png")
                    }
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      borderWidth: 4,
                      borderColor: theme == "light" ? "white" : "#1f1f1f",
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
                      borderColor: theme == "light" ? "white" : "#1f1f1f",
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
                  onChangeText={(text) => updateField("username", text)}
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
                  onChangeText={(text) => updateField("email", text)}
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
                  onPress={() => updateProfile()}
                >
                  <Text
                    style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}
                  >
                    Update Profile
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : modalType == "password" ? (
            <View>
              <View style={{ marginBottom: 25 }}>
                <Text
                  style={{
                    fontSize: 26,
                    fontWeight: "700",
                    color: theme == "light" ? "#1A1A1A" : "#f2f2f7",
                  }}
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
                onChangeText={(text) => updateField("password", text)}
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
                onChangeText={(text) => updateField("confirmPass", text)}
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
                onPress={() => updateProfile()}
              >
                <Text
                  style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}
                >
                  Update Password
                </Text>
              </Pressable>
            </View>
          ) : (
            <View>
              <View style={{ marginBottom: 25 }}>
                <Text
                  style={{
                    fontSize: 26,
                    fontWeight: "700",
                    color: theme == "light" ? "#1A1A1A" : "#f2f2f7",
                  }}
                >
                  Feedback
                </Text>
                <Text style={{ color: "#8E8E93", marginTop: 4 }}>
                  Express your concerns
                </Text>
              </View>

              <TextInput
                placeholder="Add your feedback here..."
                placeholderTextColor="#A0A0A0"
                multiline
                numberOfLines={4}
                style={{
                  backgroundColor: "#FFF",
                  padding: 16,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: "#F0F0F0",
                  fontSize: 16,
                  height: 100,
                  textAlignVertical: "top",
                  marginBottom: 20,
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
                onPress={() => updateProfile()}
              >
                <Text
                  style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}
                >
                  Send Feedback
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>
      <Toast config={toastConfig} />
    </>
  );
};

export default ProfilePage;
