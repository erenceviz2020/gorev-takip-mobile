import { Stack } from "expo-router";
import { AppDataProvider } from "../src/context/AppDataContext";
import { AuthProvider } from "../src/context/AuthContext";
import { ThemeProvider, ThemeTransition } from "../src/context/ThemeContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ThemeTransition>
          <AppDataProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="login" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="task/[id]" />
              <Stack.Screen name="notification/[id]" />
            </Stack>
          </AppDataProvider>
        </ThemeTransition>
      </ThemeProvider>
    </AuthProvider>
  );
}
