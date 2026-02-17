import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DropdownComponent from "../_Components/Dropdown";

type Task = {
  title: string;
  category: string;
  content: string;
  status: string;
  id: any;
};

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

const TasksScreen = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
      normalize(new Date()),
    ),
    [selectedDateTasks, setDateTasks] = useState<Array<Task>>([]),
    [openMenuId, setOpenMenuId] = useState<string | null>(null),
    [openModal, setModal] = useState<boolean>(false);

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
        // setDateTasks((prev) => prev.filter((t) => t.id !== task.id));
      }

      setOpenMenuId(null);
    };

  const week = getWeek(selectedDate),
    colors: string[] = ["#7b6069", "#D72D66", "#2DD7A1"];

  useEffect(() => {
    setDateTasks(
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

  return (
    <SafeAreaView style={{ flex: 1, alignItems: "center", padding: 25 }}>
      <View
        id="dates"
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginBottom: 5,
          width: "100%",
        }}
      >
        {week.map((date) => {
          const active = isSameDay(date, selectedDate);

          return (
            <Pressable
              key={date.toISOString()}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={{ marginBottom: 5, color: active ? "#d72d66" : "" }}>
                {getDayLabel(date.getDay())}
              </Text>
              <Pressable>
                <Text
                  style={{
                    alignSelf: "center",
                    color: active ? "#d72d66" : "",
                  }}
                >
                  {date.getDate()}
                </Text>
              </Pressable>
              {active && (
                <View
                  id="selected"
                  style={{
                    top: 7,
                    alignSelf: "center",
                    width: 5,
                    height: 5,
                    backgroundColor: "#d72d66",
                    borderRadius: 50,
                  }}
                />
              )}
            </Pressable>
          );
        })}
      </View>
      <View id="tasks" style={{ flex: 0.925, padding: 15, top: 10 }}>
        <FlatList
          data={selectedDateTasks}
          renderItem={({ item }) => (
            <View
              style={{
                borderRadius: 25,
                backgroundColor: "white",
                padding: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 22 }}>{item.title}</Text>
                <View style={{ position: "relative" }}>
                  <Pressable
                    onPress={() =>
                      setOpenMenuId(openMenuId === item.id ? null : item.id)
                    }
                  >
                    <Text style={{ fontSize: 18 }}>⋮</Text>
                  </Pressable>

                  {openMenuId === item.id && (
                    <View
                      style={{
                        position: "absolute",
                        top: 25,
                        right: 0,
                        backgroundColor: "white",
                        zIndex: 999,
                        borderRadius: 10,
                        paddingVertical: 5,
                        elevation: 10,
                        width: 150,
                        shadowOffset: {
                          width: 0,
                          height: 2,
                        },
                        shadowColor: "black",
                        shadowRadius: 3,
                        shadowOpacity: 0.08,
                      }}
                    >
                      {menuOptions.map((option) => (
                        <Pressable
                          key={option.value}
                          onPress={() => handleMenuAction(option.value, item)}
                          style={{ padding: 10 }}
                        >
                          <Text>{option.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              <Text style={{ marginBottom: 10, color: "grey" }}>
                {item.content}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: "black" }}>{item.category}</Text>
                <Pressable>
                  <Text
                    style={{
                      color:
                        item.status == "Complete"
                          ? "green"
                          : item.status == "Pending"
                            ? "orange"
                            : "red",
                    }}
                  >
                    {item.status}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ marginVertical: 10 }} />}
          ListEmptyComponent={() => (
            <View
              id="empty"
              style={{
                justifyContent: "center",
                alignSelf: "center",
              }}
            >
              <Text style={{ top: 320 }}>No tasks on this day</Text>
            </View>
          )}
        />
        <Modal
          presentationStyle="formSheet"
          visible={openModal}
          animationType="slide"
          onRequestClose={() => setModal(false)}
        >
          <View style={{ padding: 25 }}>
            <View id="header">
              <Text style={{ marginBottom: 20, fontSize: 25 }}>Edit Task</Text>
            </View>
            <View style={{ top: 15 }}>
              <Text
                style={{
                  fontSize: 17,
                }}
              >
                Title
              </Text>
              <TextInput
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
                keyboardType="ascii-capable"
              />
              <Text
                style={{
                  fontSize: 17,
                }}
              >
                Content
              </Text>
              <TextInput
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
                keyboardType="ascii-capable"
              />
              <Text
                style={{
                  fontSize: 17,
                }}
              >
                Category
              </Text>
              <TextInput
                style={{
                  marginBottom: 40,
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
                keyboardType="ascii-capable"
              />
              <Text style={{ fontSize: 17 }}>Status</Text>
              <DropdownComponent />
              <Pressable
                style={{
                  marginTop: 30,
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
                  Update tasks
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default TasksScreen;
