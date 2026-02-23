import { Stack } from "expo-router";
import { useEffect } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export default function RootLayout() {
  useEffect(() => {
    GoogleSignin.configure({
      iosClientId:
        "436704239336-l7vt3iq5mc9hn1civq66p7919cglodof.apps.googleusercontent.com",
      profileImageSize: 150,
    });
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="Authentication" />
    </Stack>
  );
}
