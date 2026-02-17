import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  useColorScheme,
  TextInput,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Task = {
  title: string;
  category: string;
  content: string;
  status: string;
  id: any;
};

type backgroundTheme = "light" | "dark";

const greetingsFormatter = (): string => {
  const date = new Date(),
    time = date.getHours();

  if (time <= 12) return "Good morning";
  else if (time <= 17) return "Good afternoon";
  else return "Good evening";
};

const Dashboard = (): React.ReactNode => {
  const currentTheme = useColorScheme(),
    [theme, setTheme] = useState<backgroundTheme>("light");

  const [tasks, setTasks] = useState<Array<Task>>([]),
    [selectedTasks, setSelectedTasks] = useState<Array<Task>>([]),
    [currentFilter, setFilter] = useState<string | null>(null);

  const onClickFilters = (filter: string) => {
    setSelectedTasks(tasks.filter((task) => task.status == filter));
    setFilter(filter);
  };

  useEffect(() => {
    if (currentTheme == "dark") setTheme("dark");
    else setTheme("light");

    setTasks(
      Array.from({ length: 10 }, (_) => ({
        title: "Title",
        category: "Category",
        content: "Some lorem ipsum text here to test for functionality of work",
        status: ["Complete", "Incomplete", "Pending"][
          Math.floor(Math.random() * 3)
        ],
        id: Date.now() + Math.floor(Math.random() * 10000),
      })),
    );
  }, []);

  useEffect(() => {
    if (!currentFilter) setSelectedTasks([]);
  }, [currentFilter]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        id="profile"
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 10,
        }}
      >
        <Pressable
          style={{
            left: 27,
            alignSelf: "center",
          }}
          onPress={() => setTheme(theme == "dark" ? "light" : "dark")}
        >
          {theme == "light" ? (
            <Feather name="moon" size={40} />
          ) : (
            <Feather name="sun" size={40} />
          )}
        </Pressable>
        <Pressable style={{ alignSelf: "flex-start" }}>
          <Image
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              right: 20,
              padding: Platform.select({ ios: 5, android: 15 }),
              shadowOffset: {
                width: 0,
                height: 2,
              },

              shadowColor: "black",
              shadowRadius: 3,
              shadowOpacity: 0.08,
            }}
            width={Platform.select({ ios: 60, android: 50 })}
            height={Platform.select({ ios: 60, android: 50 })}
            source={require("./../../assets/images/react-logo.png")}
          />
        </Pressable>
      </View>
      <View id="intro-text" style={{ padding: 35, bottom: 15 }}>
        <View
          id="good mrng"
          style={{ marginBottom: Platform.select({ ios: 15, android: 10 }) }}
        >
          <Text style={{ fontSize: 20, color: "grey" }}>
            {greetingsFormatter()}, User!
          </Text>
        </View>
        <View id="summary">
          <Text style={{ fontSize: 30, fontWeight: 600 }}>
            You have{" "}
            <Text style={{ color: "rgba(0,0,175,0.75)" }}>49 Tasks</Text> this
            month
          </Text>
        </View>
        <View></View>
      </View>
      <View id="tasks" style={{ padding: 35, bottom: 40 }}>
        <View id="search" style={{ marginBottom: 30 }}>
          <TextInput
            style={{
              width: "100%",
              backgroundColor: "white",
              borderRadius: 20,
              padding: Platform.select({ ios: 20, android: 17 }),
            }}
            placeholder="Search a task"
          />
        </View>
        <View
          id="statuses"
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: Platform.select({ ios: 10, android: 7 }),
            marginBottom: 40,
          }}
        >
          {["To-do", "Progressing", "Done"].map((word, index) => (
            <Pressable
              key={index}
              onPress={() =>
                onClickFilters(
                  word == "To-do"
                    ? "Incomplete"
                    : word == "Done"
                      ? "Complete"
                      : "Pending",
                )
              }
            >
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
                size={Platform.select({ ios: 40, android: 25 })}
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
                {word}
              </Text>
            </Pressable>
          ))}
        </View>
        <View id="today-tasks" style={{ padding: 10 }}>
          <View
            id="header"
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={{ fontWeight: 600, fontSize: 27 }}>Today's tasks</Text>
            {currentFilter && (
              <Pressable onPress={() => setFilter(null)}>
                <Text style={{ top: 7 }}>Clear filter</Text>
              </Pressable>
            )}
          </View>
          <View id="tasks">
            {tasks.length <= 0 && (
              <View
                id="empty-tasks"
                style={{
                  margin: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  height: 200,
                }}
              >
                <Text
                  style={{
                    fontWeight: 500,
                  }}
                >
                  No tasks so far today, Good Job
                </Text>
              </View>
            )}
            <ScrollView style={{ top: 20 }} horizontal>
              {selectedTasks.length == 0 &&
                tasks.map((task: Task) => (
                  <View
                    style={{
                      width: 200,
                      height: 190,
                      padding: 20,
                      backgroundColor: "white",
                      borderRadius: 20,
                      marginRight: 30,
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },

                      shadowColor: "black",
                      shadowRadius: 3,
                      shadowOpacity: 0.08,
                    }}
                    key={task.id}
                  >
                    <Text style={{ fontSize: 25, marginBottom: 10 }}>
                      {task.title}
                    </Text>
                    <Text style={{ color: "grey", top: 10 }}>
                      {task.content}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        top: 45,
                      }}
                    >
                      <Text>{task.category}</Text>
                      <Text
                        style={{
                          color:
                            task.status == "Complete"
                              ? "green"
                              : task.status == "Pending"
                                ? "orange"
                                : "red",
                        }}
                      >
                        {task.status}
                      </Text>
                    </View>
                  </View>
                ))}
              {selectedTasks.length > 0 &&
                selectedTasks.map((task: Task) => (
                  <View
                    style={{
                      width: 200,
                      height: 190,
                      padding: 20,
                      backgroundColor: "white",
                      borderRadius: 20,
                      marginRight: 30,
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },

                      shadowColor: "black",
                      shadowRadius: 3,
                      shadowOpacity: 0.08,
                    }}
                    key={task.id}
                  >
                    <Text style={{ fontSize: 25, marginBottom: 10 }}>
                      {task.title}
                    </Text>
                    <Text style={{ color: "grey", top: 10 }}>
                      {task.content}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        top: 45,
                      }}
                    >
                      <Text>{task.category}</Text>
                      <Text
                        style={{
                          color:
                            task.status == "Complete"
                              ? "green"
                              : task.status == "Pending"
                                ? "orange"
                                : "red",
                        }}
                      >
                        {task.status}
                      </Text>
                    </View>
                  </View>
                ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Dashboard;
