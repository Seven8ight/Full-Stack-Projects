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
} from "react-native";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

const AuthScreen = () => {
  //Permissions

  const [switchValue, setSwitch] = useState<boolean>(),
    [modal, setModal] = useState<boolean>(false),
    [modalType, setType] = useState<"user profile" | "password" | null>(null),
    { height } = useWindowDimensions();

  const [username, setUsername] = useState<string>(""),
    [email, setEmail] = useState<string>(""),
    [password, setPassword] = useState<string>(""),
    [confirmPass, setConfirmedPass] = useState<string>(""),
    [profileImage, setImage] = useState<string>("");

  const pickImage = async () => {
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
      <SafeAreaView style={{ flex: 1, padding: 22.5 }}>
        <View id="header">
          <Text style={{ fontSize: 35, fontWeight: 600, marginBottom: 30 }}>
            Profile
          </Text>
        </View>
        <View
          id="Profile Card"
          style={{
            padding: 15,
            borderRadius: 30,
            shadowOffset: {
              width: 0,
              height: 2,
            },
            backgroundColor: "#fff",
            marginBottom: 25,
            shadowColor: "black",
            shadowRadius: 3,
            shadowOpacity: 0.08,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View id="image">
            <Image
              source={require("./../../assets/images/icon.png")}
              width={50}
              height={50}
              style={{
                borderRadius: 50,
                width: 60,
                height: 60,
                marginRight: 20,
              }}
            />
          </View>
          <View id="details">
            <Text style={{ fontSize: 20, bottom: 3 }}>John Doe</Text>
            <Text style={{ top: 3, color: "grey" }}>jdoe@gmail.com</Text>
          </View>
          <View id="log out" style={{ left: 150 }}>
            <Pressable>
              <Feather name="log-out" size={18} />
            </Pressable>
          </View>
        </View>
        <View id="summary" style={{ top: 10 }}>
          <Text style={{ fontSize: 30, fontWeight: 600, marginBottom: 20 }}>
            Summary
          </Text>
          <View
            id="summary-of-tasks"
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 10,
            }}
          >
            {["To-do", "Progressing", "Done"].map((word, index) => (
              <Pressable key={index}>
                <Feather
                  name={
                    word == "Done"
                      ? "check-circle"
                      : word == "Progressing"
                        ? "activity"
                        : "alert-octagon"
                  }
                  color={
                    word == "To-do"
                      ? "rgba(200,0,0,0.8)"
                      : word == "Progressing"
                        ? "#FFB347"
                        : "rgba(0,200,0,0.8)"
                  }
                  size={Platform.select({ ios: 30, android: 25 })}
                  style={{
                    alignSelf: "center",
                    borderColor:
                      word == "To-do"
                        ? "rgba(200,0,0,0.5)"
                        : word == "Progressing"
                          ? "#FFB347"
                          : "rgba(0,200,0,0.5)",
                    borderWidth: 2,
                    backgroundColor:
                      word == "Todo"
                        ? "rgba(200,0,0,0.025)"
                        : word == "Progressing"
                          ? "rgba(255, 179, 71,0.025)"
                          : "rgba(0,200,0,0.025)",
                    padding: 20,
                    borderRadius: 50,
                  }}
                />
                <Text style={{ textAlign: "center", top: 10, fontWeight: 500 }}>
                  0{" "}
                  {word == "To-do"
                    ? "Done"
                    : word == "Progressing"
                      ? "In progress"
                      : "Incomplete"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View id="options" style={{ marginTop: 40 }}>
          <FlatList
            data={[
              {
                icon: "user",
                text: "User Profile",
              },
              {
                icon: "lock",
                text: "Change Password",
              },
              {
                icon: "bell",
                text: "Push notifications",
              },
            ]}
            renderItem={({ item }) => (
              <Pressable
                onPress={
                  item.text != "Push notifications"
                    ? () => {
                        if (item.text == "User Profile")
                          setType("user profile");
                        else setType("password");

                        setModal(!modal);
                      }
                    : () => {}
                }
                style={{
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  backgroundColor: "#fff",
                  marginBottom: 25,
                  shadowColor: "black",
                  shadowRadius: 3,
                  shadowOpacity: 0.08,
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 15,
                  borderRadius: 20,
                }}
              >
                <Feather
                  name={item.icon as any}
                  size={25}
                  style={{ marginRight: 20 }}
                />
                <Text style={{ fontWeight: 500 }}>{item.text}</Text>
                {item.text == "Push notifications" ? (
                  <Switch
                    style={{ left: 130 }}
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={1 == 1 ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={setSwitch}
                    value={switchValue}
                  />
                ) : (
                  <Feather
                    name="arrow-right"
                    size={17}
                    style={{ position: "absolute", right: 25 }}
                  />
                )}
              </Pressable>
            )}
            keyExtractor={(_, index) => index.toString()}
          />
        </View>
        <View
          id="feedback"
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: 100,
          }}
        >
          <View
            style={{
              alignItems: "center",
              width: "100%",
              borderBlockColor: "black",
              padding: 25,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              backgroundColor: "#fff",
              borderRadius: 25,
              shadowColor: "black",
              shadowRadius: 3,
              shadowOpacity: 0.08,
            }}
          >
            <Text>Anything to add or fix, write us an email</Text>
            <Pressable
              style={{ alignItems: "center", top: 15 }}
              // onPress={() => submitHandler()}
            >
              <Text
                style={{
                  padding: 8,
                  backgroundColor: "black",
                  color: "white",
                  width: 200,
                  textAlign: "center",
                  borderRadius: 20,
                  fontWeight: 500,
                }}
              >
                Write an email
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
      <Modal
        style={{ margin: 0, justifyContent: "flex-end" }}
        isVisible={modal}
        onBackButtonPress={() => setModal(false)}
        onBackdropPress={() => setModal(false)}
        swipeDirection={"down"}
        onSwipeComplete={() => setModal(false)}
      >
        {modalType == "user profile" ? (
          <View
            style={{
              height: height * 0.6, // 👈 75% screen height
              backgroundColor: "white",
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,

              padding: 20,
            }}
          >
            <View
              id="scroller"
              style={{
                width: 60,
                height: 5,
                backgroundColor: "#ccc",
                borderRadius: 10,
                alignSelf: "center",
                marginBottom: 20,
              }}
            />
            <View id="content">
              <View id="header">
                <Text
                  style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}
                >
                  User Profile
                </Text>
              </View>
              <View id="form">
                <View id="text">
                  <Text style={{ fontSize: 18 }}>
                    Change your profile details
                  </Text>
                </View>
                <View id="form content" style={{ top: 20 }}>
                  <View id="image" style={{ marginBottom: 30 }}>
                    <Pressable onPress={() => pickImage()}>
                      <Image
                        source={
                          profileImage.includes("file")
                            ? { uri: profileImage }
                            : require("./../../assets/images/icon.png")
                        }
                        width={50}
                        height={50}
                        style={{
                          borderRadius: 50,
                          width: 80,
                          height: 80,
                          marginRight: 20,
                          alignSelf: "center",
                        }}
                      />
                      <Feather
                        name="pen-tool"
                        size={20}
                        style={{
                          color: "white",
                          position: "absolute",
                          left: "50%",
                          bottom: 10,
                        }}
                      />
                    </Pressable>
                  </View>
                  <Text style={{ left: 5, color: "grey", fontSize: 16 }}>
                    Username
                  </Text>
                  <TextInput
                    style={{
                      marginBottom: 30,
                      marginTop: 15,
                      padding: 10,
                      width: "100%",
                      alignSelf: "flex-end",
                      backgroundColor: "#fff",
                      borderRadius: 30,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4.65,
                      elevation: 5,
                      zIndex: -1,
                    }}
                  />
                  <Text style={{ left: 5, color: "grey", fontSize: 16 }}>
                    Email
                  </Text>
                  <TextInput
                    style={{
                      marginBottom: 30,
                      marginTop: 15,
                      padding: 10,
                      width: "100%",
                      alignSelf: "flex-end",
                      backgroundColor: "#fff",
                      borderRadius: 30,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4.65,
                      elevation: 5,
                      zIndex: -1,
                    }}
                  />

                  <Pressable
                    style={{
                      marginTop: 40,
                      marginBottom: 25,
                      alignItems: "center",
                    }}
                    // onPress={() => submitHandler()}
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
                      Update
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View
            style={{
              height: height * 0.4, // 👈 75% screen height
              backgroundColor: "white",
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,

              padding: 20,
            }}
          >
            <View
              style={{
                width: 60,
                height: 5,
                backgroundColor: "#ccc",
                borderRadius: 10,
                alignSelf: "center",
                marginBottom: 20,
              }}
            />

            <View>
              <View id="header">
                <Text
                  style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}
                >
                  Change Password
                </Text>
              </View>
              <View id="form">
                <TextInput
                  style={{
                    marginBottom: 30,
                    marginTop: 15,
                    padding: 15,
                    width: "100%",
                    alignSelf: "flex-end",
                    backgroundColor: "#fff",
                    borderRadius: 30,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4.65,
                    elevation: 5,
                    zIndex: -1,
                  }}
                  placeholder="New Password"
                />
                <TextInput
                  style={{
                    marginBottom: 30,
                    marginTop: 15,
                    padding: 15,
                    width: "100%",
                    alignSelf: "flex-end",
                    backgroundColor: "#fff",
                    borderRadius: 30,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4.65,
                    elevation: 5,
                    zIndex: -1,
                  }}
                  placeholder="Confirm Password"
                />
                <Pressable
                  style={{
                    marginTop: 15,
                    marginBottom: 25,
                    alignItems: "center",
                  }}
                  // onPress={() => submitHandler()}
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
                    Update
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
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
