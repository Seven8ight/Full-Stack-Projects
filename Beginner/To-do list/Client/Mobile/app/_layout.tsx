import { Stack } from "expo-router";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { useColorScheme } from "react-native";

type BackgroundTheme = {
  setTheme: Dispatch<SetStateAction<string>>;
  theme: string;
};

const ThemeContext = createContext<BackgroundTheme>({
  theme: "light",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export default function RootLayout() {
  const [theme, setTheme] = useState<string>(useColorScheme()!);

  return (
    <ThemeContext.Provider value={{ theme: theme, setTheme: setTheme }}>
      <Stack screenOptions={{ headerShown: false }}></Stack>
    </ThemeContext.Provider>
  );
}
