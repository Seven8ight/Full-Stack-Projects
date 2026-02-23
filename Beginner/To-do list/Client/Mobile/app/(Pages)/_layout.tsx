import { router, Tabs } from "expo-router";
import CustomTabBar from "../_Components/TabBar";
import {
  useEffect,
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "react-native";
import { useTheme } from "../_layout";

export type Task = {
  id: string;
  title: string;
  content: string;
  category: string;
  userId: string;
  created_at: string;
  status: "complete" | "incomplete" | "in progress";
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type User = {
  tokens: AuthTokens | null;
  userDetails: Record<string, any> | null;
  setUserDetails: Dispatch<SetStateAction<Record<string, any>>>;
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Array<Task>>>;
  errorMessage: string | null;
  error: boolean;
};

const CurrentUser = createContext<User>({
  tokens: null,
  userDetails: null,
  setUserDetails: () => {},
  tasks: [],
  setTasks: () => {},
  errorMessage: null,
  error: false,
});

export const useUserObject = () => useContext(CurrentUser);

const RootLayout = () => {
  const [accessToken, setAToken] = useState<string | null>(""),
    [refreshToken, setRToken] = useState<string | null>(""),
    [user, setUser] = useState<Record<string, any>>({}),
    [tasks, setTasks] = useState<Array<Task>>([]),
    [error, setError] = useState<string | null>(null),
    { theme } = useTheme();

  const fetchUserTasks = async (tokenToUse: string) => {
      try {
        const fetchTasks = await fetch(
            "http://192.168.0.12:4000/api/todos/get?type=all",
            {
              method: "GET",
              headers: { Authorization: `Bearer ${tokenToUse}` },
            },
          ),
          taskData = await fetchTasks.json();

        if (fetchTasks.ok) setTasks(taskData);
      } catch (err) {
        setError((err as Error).message);
      }
    },
    refreshUserToken = async (refreshT: string | null) => {
      try {
        const response = await fetch(
          "http://192.168.0.12:4000/api/auth/refresh",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: refreshT }),
          },
        );
        const data = await response.json();

        if (!response.ok) {
          setError("Session expired");
          router.push("/(Auth)/Authentication");
          return null;
        }

        await SecureStore.setItemAsync("accessToken", data.accessToken);
        setAToken(data.accessToken);
        return data.accessToken;
      } catch (err) {
        setError((err as Error).message);
        return null;
      }
    },
    fetchProfile = async (accessT: string | null, refreshT: string | null) => {
      if (!accessT) return;

      try {
        const response = await fetch("http://192.168.0.12:4000/api/users/get", {
          method: "GET",
          headers: { Authorization: `Bearer ${accessT}` },
        });
        const userData = await response.json();

        if (!response.ok) {
          if (
            userData.error?.includes("re-log in") ||
            response.status === 401
          ) {
            const newToken = await refreshUserToken(refreshT);

            if (newToken) {
              return fetchProfile(newToken, refreshT);
            }
          }
          return;
        }

        setUser(userData);
        await fetchUserTasks(accessT);
      } catch (err) {
        setError((err as Error).message);
      }
    };

  useEffect(() => {
    const accessToken = SecureStore.getItem("accessToken"),
      refreshToken = SecureStore.getItem("refreshToken");

    if (accessToken) setAToken(accessToken);
    else router.push("/(Auth)/Authentication");

    if (refreshToken) setRToken(refreshToken);
    else router.push("/(Auth)/Authentication");
  }, []);

  useEffect(() => {
    (async () => {
      await fetchProfile(accessToken, refreshToken);
    })();
  }, [accessToken, refreshToken]);

  return (
    <CurrentUser.Provider
      value={{
        userDetails: user,
        setUserDetails: setUser,
        error: error ? true : false,
        errorMessage: error,
        tasks: tasks,
        setTasks: setTasks,
        tokens: {
          accessToken: accessToken!,
          refreshToken: refreshToken!,
        },
      }}
    >
      <StatusBar
        // 1. Make the background transparent on Android
        backgroundColor="transparent"
        translucent={true}
        // 2. This controls the ICON colors (The important part!)
        // 'dark-content' = Black icons (use for light theme)
        // 'light-content' = White icons (use for dark theme)
        barStyle={theme === "light" ? "dark-content" : "light-content"}
      />
      <Tabs
        screenOptions={{
          headerShown: false,
          animation: "shift",

          // tabBarStyle: hideTabBar ? { display: "none" } : styles.tabBar,
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen name="Dashboard"></Tabs.Screen>
        <Tabs.Screen name="Tasks"></Tabs.Screen>
        <Tabs.Screen name="Profile"></Tabs.Screen>
      </Tabs>
    </CurrentUser.Provider>
  );
};

export default RootLayout;
