import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  TextInput,
  Alert,
  useWindowDimensions,
  ImageBackground,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Modal from "react-native-modal";
import DropdownComponent from "../_Components/Dropdown";
import { Feather } from "@expo/vector-icons";
import { useUserObject } from "./_layout";
import Toast from "react-native-toast-message";
import { toastConfig } from "../_Components/ToastConfig";

type Task = {
  title: string;
  category: string;
  content: string;
  status: string;
  id: string;
};

enum Months {
  January,
  February,
  March,
  April,
  May,
  June,
  July,
  August,
  September,
  October,
  November,
  December,
}

function normalize(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeek(date: Date): Date[] {
  const d = normalize(date);

  const day = d.getDay(); // 0 = Sun, 1 = Mon ...
  const diff = day === 0 ? -6 : 1 - day; // ISO Monday

  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);

  return Array.from({ length: 7 }, (_, i) => {
    const next = new Date(monday);
    next.setDate(monday.getDate() + i);
    return next;
  });
}

function getDayLabel(day: number): string {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day];
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

function formatDayTitle(date: Date) {
  const now = new Date();

  // Create versions of the dates with the time set to midnight for clean comparison
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (d.getTime() === today.getTime()) return "Today's Tasks";
  if (d.getTime() === yesterday.getTime()) return "Yesterday's Tasks";
  if (d.getTime() === tomorrow.getTime()) return "Tomorrow";

  // Robust Suffix Logic
  const day = date.getDate();
  let suffix = "th";
  if (day < 11 || day > 13) {
    switch (day % 10) {
      case 1:
        suffix = "st";
        break;
      case 2:
        suffix = "nd";
        break;
      case 3:
        suffix = "rd";
        break;
    }
  }

  return `${day}${suffix}, ${Months[date.getMonth()]}`;
}

const TasksScreen = () => {
  const { tasks, tokens, setTasks } = useUserObject(),
    [selectedDate, setSelectedDate] = useState<Date>(() =>
      normalize(new Date()),
    ),
    [selectedDateTasks, setDateTasks] = useState<Array<Task>>([]),
    [dayTitle, setDayTitle] = useState<string>(formatDayTitle(selectedDate)),
    [openMenuId, setOpenMenuId] = useState<string | null>(null),
    [taskId, setTaskId] = useState<string | null>(null),
    [openModal, setModal] = useState<boolean>(false),
    [modalType, setType] = useState<"edit" | "filter" | "add">("edit"),
    { height } = useWindowDimensions();

  const [newTaskDetails, setNewTaskDetails] = useState<
      Omit<Partial<Task>, "id" | "status">
    >({
      title: "",
      content: "",
      category: "",
    }),
    [newStatus, setStatus] = useState<string | null>("");

  const [title, setTitle] = useState<string>(""),
    [content, setContent] = useState<string>(""),
    [category, setCategory] = useState<string>("");

  const handleTaskDetails = (key: string, value: string) => {
    setNewTaskDetails((details) => {
      return {
        ...details,
        [key]: value,
      };
    });
  };

  const menuOptions = [
      { label: "Edit", value: "edit" },
      { label: "Delete", value: "delete" },
    ],
    handleMenuAction = (action: string, task: Task) => {
      if (action === "edit") {
        setModal(!openModal);
      }

      if (action === "delete") {
        Alert.alert("Delete task", "Are you sure, this action is permanent", [
          {
            text: "Delete",
            style: "destructive",
            onPress: () => console.log("To be deleted"),
          },
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => console.log("Cancelled"),
          },
        ]);
      }
      setTaskId(openMenuId);
      setOpenMenuId(null);
    };

  const week = getWeek(selectedDate);

  const addTask = async () => {
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
      } catch (error) {
        Toast.show({
          text1: "Error",
          text2: `${(error as Error).message}`,
          type: "error",
        });
      }
    },
    updateTask = async (taskId: string) => {
      let filledDetails: Record<string, any> = {};

      for (let [key, value] of Object.entries(newTaskDetails)) {
        if (key && value && value.length > 0) filledDetails[key] = value;
      }

      if (newStatus && newStatus.length > 0)
        filledDetails["status"] = newStatus;

      try {
        const updateRequest: Response = await fetch(
            "http://192.168.0.12:4000/api/todos/edit",
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${tokens!.accessToken}`,
                "Content-type": "application/json",
              },
              body: JSON.stringify({ id: taskId, ...filledDetails }),
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

        setTasks(
          tasks.map((task) => {
            if (task.id == taskId)
              return {
                ...task,
                ...filledDetails,
              };
            else return task;
          }),
        );
        Toast.show({
          text1: "Success",
          text2: "Update successful",
          type: "success",
        });
        setTaskId(null);
      } catch (error) {
        Toast.show({
          text1: "Error",
          text2: "Error updating task, try again",
          type: "error",
        });
        return;
      }
    };

  useEffect(() => {
    const filtered = tasks.filter((task) => {
      const taskDate = new Date(task.created_at);
      const currentDate = new Date();

      return (
        taskDate.getDate() === currentDate.getDate() &&
        taskDate.getMonth() === currentDate.getMonth() &&
        taskDate.getFullYear() === currentDate.getFullYear()
      );
    });

    setDateTasks(filtered);
  }, [tasks]);

  useEffect(() => {
    const filtered = tasks.filter((task) => {
      const taskDate = new Date(task.created_at);

      return (
        taskDate.getDate() === selectedDate.getDate() &&
        taskDate.getMonth() === selectedDate.getMonth() &&
        taskDate.getFullYear() === selectedDate.getFullYear()
      );
    });
    setDateTasks(filtered);
    setDayTitle(formatDayTitle(selectedDate));
  }, [selectedDate]);

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FDFDFD" }}>
        {/* 1. Improved Calendar Header */}
        <View style={{ paddingHorizontal: 25, paddingTop: 10 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 28, fontWeight: "700", color: "#1A1A1A" }}>
              Schedule
            </Text>
            <Pressable
              onPress={() => {
                setType("filter");
                setModal(true);
              }}
              style={({ pressed }) => ({
                padding: 10,
                backgroundColor: "#F0F0F0",
                borderRadius: 12,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Feather name="sliders" size={20} color="#1A1A1A" />
            </Pressable>
          </View>

          {/* Date Scroller */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={week}
            keyExtractor={(item) => item.toISOString()}
            contentContainerStyle={{ paddingRight: 40, height: 90 }}
            renderItem={({ item }) => {
              const active = isSameDay(item, selectedDate);

              return (
                <Pressable
                  onPress={() => setSelectedDate(item)}
                  style={{
                    alignItems: "center",
                    marginRight: 20,
                    width: 55,
                    height: 75,
                    justifyContent: "center",
                    borderRadius: 20,
                    backgroundColor: active ? "#1A1A1A" : "transparent",
                    borderWidth: active ? 0 : 1,
                    borderColor: "#EEE",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: active ? "#FFF" : "#AAA",
                      marginBottom: 4,
                    }}
                  >
                    {getDayLabel(item.getDay()).toUpperCase()}
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: active ? "#FFF" : "#1A1A1A",
                    }}
                  >
                    {item.getDate()}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        {/* 2. Tasks List */}
        <View style={{ flex: 1, paddingHorizontal: 25, marginTop: 10 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#1A1A1A",
              marginBottom: 15,
            }}
          >
            {dayTitle}
          </Text>

          <FlatList
            data={selectedDateTasks}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 25,
                  padding: 20,
                  marginBottom: 15,
                  borderWidth: 1,
                  borderColor: "#F0F0F0",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.03,
                  shadowRadius: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: "#1A1A1A",
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={{
                        color: "#8E8E93",
                        marginTop: 4,
                        fontSize: 14,
                        lineHeight: 20,
                      }}
                      numberOfLines={2}
                    >
                      {item.content}
                    </Text>
                  </View>

                  <View>
                    <Pressable
                      onPress={() => {
                        setOpenMenuId(openMenuId === item.id ? null : item.id);
                        setType("edit");
                      }}
                      style={{ padding: 5 }}
                    >
                      <Feather name="more-vertical" size={20} color="#CCC" />
                    </Pressable>

                    {openMenuId === item.id && (
                      <View
                        style={{
                          position: "absolute",
                          top: 30,
                          right: 0,
                          backgroundColor: "white",
                          zIndex: 999,
                          borderRadius: 15,
                          width: 120,
                          borderWidth: 1,
                          borderColor: "#EEE",
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 10 },
                          shadowOpacity: 0.1,
                          shadowRadius: 12,
                          elevation: 5,
                        }}
                      >
                        {menuOptions.map((option) => (
                          <Pressable
                            key={option.value}
                            onPress={() => handleMenuAction(option.value, item)}
                            style={{
                              padding: 12,
                              borderBottomWidth:
                                option.value === "edit" ? 1 : 0,
                              borderBottomColor: "#F5F5F5",
                            }}
                          >
                            <Text
                              style={{
                                color:
                                  option.value === "delete"
                                    ? "#EF4444"
                                    : "#1A1A1A",
                                fontWeight: "500",
                              }}
                            >
                              {option.label}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 15,
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#F5F5F5",
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{ fontSize: 12, color: "#666", fontWeight: "600" }}
                    >
                      {item.category}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color:
                        item.status.toLowerCase() === "complete"
                          ? "#4CAF50"
                          : item.status === "in progress"
                            ? "#FFB347"
                            : "#FF5252",
                    }}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={() => (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  marginTop: 100,
                  top: 100,
                }}
              >
                <Feather name="coffee" size={50} color="#EEE" />
                <Text style={{ color: "#AAA", marginTop: 15, fontSize: 16 }}>
                  No tasks for this day
                </Text>
              </View>
            )}
          />
        </View>
        <View id="add">
          <Pressable
            style={{
              position: "absolute",
              bottom: 100,
              right: 28,
              backgroundColor: "#000",
              width: 45,
              height: 45,
              borderRadius: 22.5,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => {
              setType("add");
              setModal(true);
            }}
          >
            <Feather name="plus" size={24} color="white" />
          </Pressable>
        </View>
      </SafeAreaView>
      <Modal
        style={{ justifyContent: "flex-end", margin: 0 }}
        isVisible={openModal}
        onBackButtonPress={() => setModal(false)}
        onBackdropPress={() => setModal(false)}
        swipeDirection={"down"}
        onSwipeComplete={() => setModal(false)}
        backdropOpacity={0.3}
      >
        {modalType == "edit" ? (
          <View
            style={{
              padding: 24,
              height: height * 0.835,
              backgroundColor: "#fff",
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
            }}
          >
            {/* Drag Handle */}
            <View
              style={{
                width: 40,
                height: 5,
                backgroundColor: "#EBEBEB",
                borderRadius: 10,
                alignSelf: "center",
                marginBottom: 25,
              }}
            />

            <Text
              style={{
                fontSize: 26,
                fontWeight: "700",
                color: "#1A1A1A",
                marginBottom: 8,
              }}
            >
              Edit Task
            </Text>
            <Text style={{ fontSize: 14, color: "#8E8E93", marginBottom: 25 }}>
              Update your task details below
            </Text>

            <View style={{ gap: 18 }}>
              <View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#AEAEB2",
                    marginBottom: 8,
                    marginLeft: 4,
                  }}
                >
                  TITLE
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#F9F9FB",
                    padding: 16,
                    borderRadius: 15,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: "#F2F2F7",
                  }}
                  placeholder="Task title"
                  value={newTaskDetails.title}
                  onChangeText={(text) => handleTaskDetails("title", text)}
                />
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#AEAEB2",
                    marginBottom: 8,
                    marginLeft: 4,
                  }}
                >
                  CONTENT
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#F9F9FB",
                    padding: 16,
                    borderRadius: 15,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: "#F2F2F7",
                    height: 80,
                    textAlignVertical: "top",
                  }}
                  placeholder="Task description"
                  multiline
                  value={newTaskDetails.content}
                  onChangeText={(text) => handleTaskDetails("content", text)}
                />
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#AEAEB2",
                    marginBottom: 8,
                    marginLeft: 4,
                  }}
                >
                  CATEGORY
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#F9F9FB",
                    padding: 16,
                    borderRadius: 15,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: "#F2F2F7",
                  }}
                  placeholder="e.g. Work"
                  value={newTaskDetails.category}
                  onChangeText={(text) => handleTaskDetails("category", text)}
                />
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: "#AEAEB2",
                    marginBottom: 8,
                    marginLeft: 4,
                  }}
                >
                  STATUS
                </Text>
                <DropdownComponent setValue={setStatus} value={newStatus} />
              </View>

              <Pressable
                style={({ pressed }) => ({
                  marginTop: 15,
                  backgroundColor: "black",
                  padding: 20,
                  borderRadius: 18,
                  alignItems: "center",
                  opacity: pressed ? 0.8 : 1,
                })}
                onPress={() => updateTask(taskId!)}
              >
                <Text
                  style={{ color: "white", fontWeight: "700", fontSize: 16 }}
                >
                  Update Task
                </Text>
              </Pressable>
            </View>

            <Text
              style={{
                textAlign: "center",
                marginTop: 25,
                color: "#C7C7CD",
                fontSize: 12,
                fontStyle: "italic",
              }}
            >
              All fields are optional
            </Text>
          </View>
        ) : modalType == "filter" ? (
          <View
            style={{
              height: height * 0.6,
              backgroundColor: "white",
              borderTopLeftRadius: 35,
              borderTopRightRadius: 35,
              padding: 25,
            }}
          >
            <View
              style={{
                width: 40,
                height: 5,
                backgroundColor: "#F2F2F7",
                borderRadius: 10,
                alignSelf: "center",
                marginBottom: 25,
              }}
            />

            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                marginBottom: 25,
                color: "#1A1A1A",
              }}
            >
              Filter Tasks
            </Text>

            <Text
              style={{
                fontSize: 12,
                fontWeight: "800",
                color: "#AEAEB2",
                marginBottom: 12,
                letterSpacing: 0.5,
              }}
            >
              TIME RANGE
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 30,
              }}
            >
              {["Today", "Last week", "Week before"].map((label) => (
                <Pressable
                  key={label}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: "#F2F2F7",
                  }}
                >
                  <Text style={{ color: "#48484A", fontWeight: "600" }}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text
              style={{
                fontSize: 12,
                fontWeight: "800",
                color: "#AEAEB2",
                marginBottom: 12,
                letterSpacing: 0.5,
              }}
            >
              CATEGORY
            </Text>
            <View style={{ gap: 10, marginBottom: 40 }}>
              {["Work", "Personal", "Health", "Study"].map((cat) => (
                <Pressable
                  key={cat}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 16,
                    borderRadius: 14,
                    backgroundColor: "#F9F9FB",
                    borderWidth: 1,
                    borderColor: "#F2F2F7",
                  }}
                >
                  <Text style={{ fontWeight: "500", color: "#1C1C1E" }}>
                    {cat}
                  </Text>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: "#E5E5EA",
                    }}
                  />
                </Pressable>
              ))}
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 16,
                  backgroundColor: "#F2F2F7",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "700", color: "#48484A" }}>
                  Clear
                </Text>
              </Pressable>

              <Pressable
                style={{
                  flex: 2,
                  paddingVertical: 16,
                  borderRadius: 16,
                  backgroundColor: "black",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "700" }}>
                  Apply Filters
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <KeyboardAvoidingView behavior="padding">
            <View
              style={{
                height: height * 0.6,
                backgroundColor: "#F8F9FA",
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
                  style={{ fontSize: 28, fontWeight: "700", color: "#1A1A1A" }}
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
                    backgroundColor: "#FFF",
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
                    backgroundColor: "#FFF",
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
        )}
      </Modal>
      <Toast config={toastConfig} />
    </>
  );
};

export default TasksScreen;
