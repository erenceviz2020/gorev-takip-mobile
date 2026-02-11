import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";

type ThemeColors = {
  bg: string;

  surface: string;
  surface2: string;
  surface3: string;

  cardTop: string;
  cardBottom: string;

  border: string;
  hairline: string;

  text: string;
  muted: string;

  primary: string;
  primarySoft: string;

  iconMuted: string;
  chevron: string;

  shadow: string;
  white: string;
};

const darkColors: ThemeColors = {
  bg: "#0B1220",

  surface: "rgba(15, 27, 46, 0.85)",
  surface2: "rgba(255,255,255,0.04)",
  surface3: "rgba(255,255,255,0.06)",

  cardTop: "rgba(15, 27, 46, 0.90)",
  cardBottom: "rgba(15, 27, 46, 0.78)",

  border: "rgba(255,255,255,0.14)",
  hairline: "rgba(255,255,255,0.10)",

  text: "#FFFFFF",
  muted: "#9CA3AF",

  primary: "#4F46E5",
  primarySoft: "rgba(79,70,229,0.18)",

  iconMuted: "rgba(255,255,255,0.72)",
  chevron: "rgba(255,255,255,0.35)",

  shadow: "#000000",
  white: "#FFFFFF",
};

const lightColors: ThemeColors = {
  bg: "#F5F7FB",

  surface: "rgba(255,255,255,0.92)",
  surface2: "rgba(15,23,42,0.04)",
  surface3: "rgba(15,23,42,0.06)",

  cardTop: "rgba(255,255,255,0.96)",
  cardBottom: "rgba(245,247,251,0.92)",

  border: "rgba(15,23,42,0.12)",
  hairline: "rgba(15,23,42,0.10)",

  text: "#0F172A",
  muted: "rgba(15,23,42,0.62)",

  primary: "#4F46E5",
  primarySoft: "rgba(79,70,229,0.12)",

  iconMuted: "rgba(15,23,42,0.62)",
  chevron: "rgba(15,23,42,0.55)",

  shadow: "#0B1220",
  white: "#FFFFFF",
};

type ThemeContextType = {
  isDark: boolean;
  colors: ThemeColors;
  toggle: () => void;
  setDark: (v: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  const value = useMemo<ThemeContextType>(
    () => ({
      isDark,
      colors: isDark ? darkColors : lightColors,
      toggle: () => setIsDark((p) => !p),
      setDark: (v: boolean) => setIsDark(v),
    }),
    [isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

export function ThemeTransition({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    opacity.setValue(0.92);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [isDark, opacity]);

  return <Animated.View style={{ flex: 1, opacity }}>{children}</Animated.View>;
}
