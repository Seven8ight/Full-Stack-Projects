import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  useWindowDimensions,
  KeyboardAvoidingView,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserObject, Task } from "./_layout";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";
import { toastConfig } from "../_Components/ToastConfig";
import { useTheme } from "../_layout";

const greetingsFormatter = (): string => {
  const date = new Date(),
    time = date.getHours();

  if (time <= 12) return "Good morning";
  else if (time <= 17) return "Good afternoon";
  else return "Good evening";
};

const Dashboard = (): React.ReactNode => {
  const router = useRouter(),
    { theme, setTheme } = useTheme(),
    [modal, setModal] = useState<boolean>(false),
    { height } = useWindowDimensions();

  const [title, setTitle] = useState<string>(""),
    [content, setContent] = useState<string>(""),
    [category, setCategory] = useState<string>("");

  const [selectedTasks, setSelectedTasks] = useState<Array<Task>>([]),
    [currentFilter, setFilter] = useState<string | null>(null);

  const { tokens, userDetails, tasks, setTasks } = useUserObject(),
    [todayTasks, setTodayTasks] = useState<Array<Task>>([]),
    [currentMonthTasks, setCurrentMonthTasks] = useState<number>(0),
    [doneTasks, setDoneTasks] = useState<Array<Task>>([]);

  const onClickFilters = (filter: string) => {
      setSelectedTasks(tasks!.filter((task) => task.status == filter));
      setFilter(filter);
    },
    addTask = async () => {
      try {
        if (!title || !content || !category) {
          Toast.show({
            text1: "Error",
            text2: "One of the fields is empty",
            type: "error",
          });
          return;
        }

        const taskCreation: Response = await fetch(
            "http://localhost:4000/api/todos/create",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${tokens?.accessToken}`,
              },
              body: JSON.stringify({
                title: title,
                content: content,
                category: category,
              }),
            },
          ),
          taskResponse = await taskCreation.json();

        if (!taskCreation.ok) {
          Toast.show({
            text1: "Error",
            text2: `${taskResponse.error}`,
            type: "error",
          });
          return;
        }

        setTasks([
          ...tasks,
          {
            ...taskResponse,
          },
        ]);
        Toast.show({
          text1: "Success",
          text2: "Task created successfully",
          type: "success",
        });

        setTitle("");
        setContent("");
        setCategory("");
      } catch (error) {
        Toast.show({
          text1: "Error",
          text2: `${(error as Error).message}`,
          type: "error",
        });
      }
    };

  useEffect(() => {
    if (!currentFilter) setSelectedTasks([]);
    else {
      setSelectedTasks(() =>
        tasks.filter((task) => {
          const currentDate = new Date(),
            taskDate = new Date(task.created_at);

          return (
            task.status == currentFilter.toLowerCase() &&
            taskDate.getDate() == currentDate.getDate() &&
            taskDate.getMonth() == currentDate.getMonth() &&
            taskDate.getFullYear() == currentDate.getFullYear()
          );
        }),
      );
    }
  }, [currentFilter]);

  useEffect(() => {
    setTodayTasks(
      tasks
        .map((task) => {
          const taskDate = new Date(task.created_at),
            currentDate = new Date();

          if (taskDate.getDate() == currentDate.getDate()) return task;
        })
        .filter((task) => task != undefined),
    );

    setCurrentMonthTasks(
      tasks.map((task) => {
        const taskDate = new Date(task.created_at),
          currentDate = new Date();

        if (taskDate.getMonth() == currentDate.getMonth() + 1) return task;
      }).length,
    );

    setDoneTasks(
      tasks
        .map((task) => {
          const taskDate = new Date(task.created_at),
            currentDate = new Date();

          if (
            taskDate.getDate() == currentDate.getDate() &&
            task.status == "complete"
          )
            return task;
        })
        .filter((task) => task != undefined),
    );
  }, [tasks]);

  return (
    <>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: theme == "light" ? "#FDFDFD" : "#121212",
        }}
      >
        {/* Header Section */}
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 25,
            paddingVertical: 15,
          }}
        >
          <Pressable
            style={({ pressed }) => ({
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: theme === "light" ? "#F0F0F0" : "#333",
              justifyContent: "center",
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
            })}
            onPress={() => setTheme(theme == "dark" ? "light" : "dark")}
          >
            <Feather
              name={theme === "light" ? "moon" : "sun"}
              size={24}
              color={theme === "light" ? "#333" : "#FFF"}
            />
          </Pressable>

          <Pressable onPress={() => router.push("/(Pages)/Profile")}>
            <Image
              style={{
                borderRadius: 18,
                borderWidth: 3,
                borderColor: "white",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
              }}
              width={55}
              height={55}
              source={
                userDetails?.profileImage
                  ? { uri: userDetails?.profileImage }
                  : require("./../../assets/images/react-logo.png")
              }
            />
          </Pressable>
        </View>

        {/* Intro Text */}
        <View
          style={{ paddingHorizontal: 30, marginTop: 10, marginBottom: 25 }}
        >
          <Text style={{ fontSize: 18, color: "#8E8E93", fontWeight: "500" }}>
            {greetingsFormatter()}, {userDetails!.username}! 👋
          </Text>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "700",
              marginTop: 8,
              color: theme == "light" ? "#1A1A1A" : "#F2F2F7",
              lineHeight: 38,
            }}
          >
            You have{" "}
            <Text style={{ color: "#4A90E2" }}>
              {currentMonthTasks} {currentMonthTasks == 1 ? "Task" : "Tasks"}
            </Text>{" "}
            this month
          </Text>
        </View>

        {/* Main Content Area */}
        <View style={{ paddingHorizontal: 30 }}>
          <View
            style={{
              width: "100%",
              backgroundColor: "#000",
              borderRadius: 25,
              padding: 20,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 30,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 15,
              elevation: 10,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 13,
                  fontWeight: "600",
                  marginBottom: 2.5,
                }}
              >
                DAILY GOAL
              </Text>
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 20,
                  fontWeight: "700",
                  marginTop: 4,
                  marginBottom: 2,
                }}
              >
                {doneTasks.length >= 3 ? "Almost there! 🚀" : "Get it done ✍️"}
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 14,
                  marginTop: 2,
                }}
              >
                {doneTasks.length}/5 tasks completed
              </Text>
            </View>

            {/* A Simple Progress Percentage */}
            <View
              style={{
                width: 65,
                height: 65,
                borderRadius: 35,
                borderWidth: 5,
                borderColor: "rgba(255,255,255,0.1)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFF", fontWeight: "bold" }}>
                {(doneTasks.length * 100) / 5}%
              </Text>
            </View>
          </View>

          {/* Status Filter Buttons */}
          <FlatList
            horizontal
            data={["To-do", "Progressing", "Done"]}
            contentContainerStyle={{
              flex: 1,
              justifyContent: "space-around",
              marginBottom: 35,
            }}
            scrollEnabled={false}
            renderItem={({ item }) => {
              const colors = {
                "To-do": { main: "#FF5252", bg: "#FFF5F5" },
                Progressing: { main: "#FFB347", bg: "#FFF9F2" },
                Done: { main: "#4CAF50", bg: "#F2FFF2" },
              };
              const config = colors[item as keyof typeof colors];

              return (
                <Pressable
                  key={item}
                  onPress={() =>
                    onClickFilters(
                      item == "To-do"
                        ? "Incomplete"
                        : item == "Done"
                          ? "Complete"
                          : "In Progress",
                    )
                  }
                  style={({ pressed }) => ({
                    alignItems: "center",
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  })}
                >
                  <View
                    style={{
                      padding: 18,
                      borderRadius: 22,
                      backgroundColor: theme == "light" ? config.bg : "#1A1A1A",
                      borderWidth: 1.5,
                      borderColor: config.main + "20",
                    }}
                  >
                    <Feather
                      name={
                        item == "Done"
                          ? "check-circle"
                          : item == "Progressing"
                            ? "activity"
                            : "alert-octagon"
                      }
                      color={config.main}
                      size={26}
                    />
                  </View>
                  <Text
                    style={{
                      textAlign: "center",
                      marginTop: 8,
                      fontWeight: "600",
                      fontSize: 13,
                      color: "#444",
                    }}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            }}
          />

          {/* Today's Tasks Section */}
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 24,
                  color: theme == "light" ? "#1A1A1A" : "#F2F2F7",
                }}
              >
                Today's Tasks
              </Text>
              {currentFilter && (
                <Pressable onPress={() => setFilter(null)}>
                  <Text style={{ color: "#4A90E2", fontWeight: "600" }}>
                    Clear filter
                  </Text>
                </Pressable>
              )}
            </View>
            <FlatList
              horizontal
              contentContainerStyle={{
                borderBlockColor: "transparent",
                backgroundColor: "transparent",
              }}
              ListEmptyComponent={() => (
                <View
                  style={{
                    width: 380,
                    height: 240,
                    backgroundColor: "#F9F9F9",
                    borderRadius: 25,
                    borderStyle: "dashed",
                    borderWidth: 2,
                    borderColor: "#DDD",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#999", fontWeight: "500" }}>
                    {!currentFilter
                      ? "No tasks so far today. Rest up!"
                      : currentFilter == "Complete"
                        ? "No tasks complete today"
                        : currentFilter == "Incomplete"
                          ? "No tasks incomplete today"
                          : "No tasks pending"}
                  </Text>
                  <Pressable
                    style={{
                      position: "absolute",
                      bottom: 15,
                      right: 15,
                      backgroundColor: "#000",
                      width: 45,
                      height: 45,
                      borderRadius: 22.5,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => setModal(true)}
                  >
                    <Feather name="plus" size={24} color="white" />
                  </Pressable>
                </View>
              )}
              data={currentFilter ? selectedTasks : todayTasks}
              renderItem={({ item }) => (
                <View
                  key={item.id}
                  style={{
                    width: 240, // Slightly wider for better text fit
                    height: 180,
                    padding: 22,
                    backgroundColor: theme == "light" ? "white" : "#1A1A1A",
                    borderRadius: 28,
                    marginRight: 20,
                    justifyContent: "space-between", // Key for layout consistency
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.05,
                    shadowRadius: 15,
                    elevation: 4,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "700",
                        color: theme == "light" ? "#1A1A1A" : "#F2F2F7",
                      }}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={{
                        color: "#8E8E93",
                        marginTop: 8,
                        fontSize: 14,
                      }}
                      numberOfLines={2}
                    >
                      {item.content}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor:
                          theme == "light" ? "#F2F2F7" : "#0B0E11",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#666",
                          fontWeight: "600",
                        }}
                      >
                        {item.category}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 13,
                        color:
                          item.status.toLowerCase() == "complete"
                            ? "#4CAF50"
                            : item.status.toLowerCase() == "in progress"
                              ? "#FFB347"
                              : "#FF5252",
                      }}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
              )}
            />
            {!currentFilter && todayTasks.length > 0 && (
              <Pressable
                style={{
                  position: "absolute",
                  bottom: -40,
                  right: 15,
                  backgroundColor: "#000",
                  width: 45,
                  height: 45,
                  borderRadius: 22.5,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => setModal(true)}
              >
                <Feather name="plus" size={24} color="white" />
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>
      <Modal
        isVisible={modal}
        style={{ margin: 0, justifyContent: "flex-end" }}
        backdropOpacity={0.4}
        onBackdropPress={() => setModal(false)}
        swipeDirection="down"
        onSwipeComplete={() => setModal(false)}
      >
        <KeyboardAvoidingView behavior="padding">
          <View
            style={{
              height: height * 0.6,
              backgroundColor: theme == "light" ? "#F8F9FA" : "#1A1A1A",
              borderTopLeftRadius: 35,
              borderTopRightRadius: 35,
              paddingHorizontal: 25,
              paddingTop: 15,
            }}
          >
            {/* Drag Indicator */}
            <View
              style={{
                width: 45,
                height: 5,
                backgroundColor: "#E0E0E0",
                borderRadius: 10,
                alignSelf: "center",
                marginBottom: 20,
              }}
            />

            <View style={{ marginBottom: 25 }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: theme == "light" ? "#1A1A1A" : "#F2F2F7",
                }}
              >
                New Task
              </Text>
              <Text style={{ color: "#8E8E93", marginTop: 4 }}>
                Fill in the details below to stay organized
              </Text>
            </View>

            <View id="body">
              {/* Title Input */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#555",
                  marginLeft: 8,
                  marginBottom: 8,
                }}
              >
                Title
              </Text>
              <TextInput
                placeholder="e.g. Morning Yoga"
                placeholderTextColor="#A0A0A0"
                style={{
                  backgroundColor: theme == "light" ? "#FFF" : "#F2F2F7",
                  padding: 16,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: "#F0F0F0",
                  fontSize: 16,
                  marginBottom: 20,
                }}
                value={title}
                onChangeText={setTitle}
              />

              {/* Content Input */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#555",
                  marginLeft: 8,
                  marginBottom: 8,
                }}
              >
                Content
              </Text>
              <TextInput
                placeholder="Add details about this task..."
                placeholderTextColor="#A0A0A0"
                multiline
                numberOfLines={4}
                style={{
                  backgroundColor: theme == "light" ? "#FFF" : "#F2F2F7",
                  padding: 16,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: "#F0F0F0",
                  fontSize: 16,
                  height: 100,
                  textAlignVertical: "top",
                  marginBottom: 20,
                }}
                value={content}
                onChangeText={setContent}
              />

              {/* Category Input */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#555",
                  marginLeft: 8,
                  marginBottom: 8,
                }}
              >
                Category
              </Text>
              <TextInput
                placeholder="Work, Health, Personal..."
                placeholderTextColor="#A0A0A0"
                style={{
                  backgroundColor: theme == "light" ? "#FFF" : "#F2F2F7",
                  padding: 16,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: "#F0F0F0",
                  fontSize: 16,
                  marginBottom: 30,
                }}
                value={category}
                onChangeText={setCategory}
              />

              {/* Primary Action Button */}
              <Pressable
                style={({ pressed }) => ({
                  backgroundColor: "#000",
                  paddingVertical: 18,
                  borderRadius: 25,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 5,
                  elevation: 6,
                })}
                onPress={() => addTask()}
              >
                <Feather
                  name="plus"
                  size={20}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{ color: "#FFF", fontSize: 17, fontWeight: "600" }}
                >
                  Create Task
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Toast config={toastConfig} />
    </>
  );
};

export default Dashboard;
