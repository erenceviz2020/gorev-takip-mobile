import { StyleSheet } from "react-native";

export function getPremiumStyles(colors: any, isDark: boolean) {
  const cardShadow = isDark
    ? {}
    : {
        shadowColor: colors.shadow,
        shadowOpacity: 0.10,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 10 },
        elevation: 6,
      };

  return {
    page: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    card: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: isDark ? colors.surface : colors.cardTop,
      overflow: "hidden" as const,

      ...cardShadow,
    },
    cardPadding14: { padding: 14 },
    cardPadding16: { padding: 16 },
    glowBottom: {
      position: "absolute" as const,
      left: 0,
      right: 0,
      bottom: 0,
      height: 60,
      backgroundColor: colors.cardBottom,
      opacity: 0.9,
    },
    hairline: {
      height: 1,
      backgroundColor: colors.hairline,
    },

    // input / pill
    inputBox: {
      height: 48,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)",
      paddingHorizontal: 12,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 10,
    },

    pillActive: {
      backgroundColor: colors.primary,
      borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.10)",
    },
    pillInactive: {
      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)",
      borderColor: colors.border,
    },

    // icons
    iconTileBg: isDark ? colors.surface2 : "rgba(15,23,42,0.08)",
    iconBgStrong: (rgba: string) => (isDark ? rgba : rgba.replace("0.2", "0.3")),
  };
}

export const base = StyleSheet.create({
  h1: { fontSize: 26, fontWeight: "900" },
  h2: { fontSize: 13, marginTop: 6 },
});
