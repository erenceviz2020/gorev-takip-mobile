import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../src/context/ThemeContext";
import { base, getPremiumStyles } from "../../src/ui/premium";

type NotifType = "ASSIGNED" | "STATUS" | "COMMENT";

type NotificationItem = {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  dateText: string;
  taskId?: string;
};

const MOCK_NOTIFS: NotificationItem[] = [
  {
    id: "n1",
    type: "ASSIGNED",
    title: "Yeni Görev Atandı",
    message: 'Size "Depo Envanter Kontrolü" görevi atandı',
    dateText: "Dün",
    taskId: "1",
  },
  {
    id: "n2",
    type: "STATUS",
    title: "Görev Durumu Değişti",
    message: '"Klima Bakımı" görevi devam ediyor olarak güncellendi',
    dateText: "Dün",
    taskId: "2",
  },
  {
    id: "n3",
    type: "COMMENT",
    title: "Yeni Not Eklendi",
    message: '"Saha Müşteri Ziyareti" görevine yorum eklendi',
    dateText: "8 Şub 2026",
    taskId: "3",
  },
  {
    id: "n4",
    type: "ASSIGNED",
    title: "Yeni Görev Atandı",
    message: 'Size "Araç Bakımı" görevi atandı',
    dateText: "8 Şub 2026",
    taskId: "5",
  },
];

function typeMeta(t: NotifType) {
  if (t === "ASSIGNED")
    return { icon: "notifications-outline" as const, bg: "rgba(79,70,229,0.22)" };
  if (t === "STATUS")
    return { icon: "checkmark-circle-outline" as const, bg: "rgba(16,185,129,0.18)" };
  return { icon: "chatbubble-ellipses-outline" as const, bg: "rgba(59,130,246,0.18)" };
}

export default function NotificationDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const ui = getPremiumStyles(colors, isDark);

  const item = useMemo(() => MOCK_NOTIFS.find((n) => n.id === id), [id]);

  if (!item) {
    return (
      <SafeAreaView style={[styles.page, { backgroundColor: colors.bg }]} edges={["top"]}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>Geri</Text>
          </TouchableOpacity>

          <View style={[styles.card, ui.card]}>
            <Text style={[base.h1, { color: colors.text }]}>Bildirim</Text>
            <Text style={[base.h2, { color: colors.muted }]}>Bulunamadı</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const meta = typeMeta(item.type);

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: colors.bg }]} edges={["top"]}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>Bildirimler</Text>
        </TouchableOpacity>

        <View style={[styles.card, ui.card]}>
          <View style={styles.header}>
            <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
              <Ionicons name={meta.icon} size={18} color={colors.white} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.date, { color: colors.iconMuted }]}>{item.dateText}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.hairline }]} />

          <Text style={[styles.msg, { color: colors.muted }]}>{item.message}</Text>

          {!!item.taskId && (
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push(`/task/${item.taskId}`)}
            >
              <Ionicons name="open-outline" size={18} color={colors.white} />
              <Text style={[styles.primaryText, { color: colors.white }]}>Görevi Aç</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  container: { paddingHorizontal: 18, paddingTop: 12 },

  backRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  backText: { fontSize: 14, fontWeight: "900" },

  card: { padding: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },

  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  title: { fontSize: 16, fontWeight: "900" },
  date: { fontSize: 12, fontWeight: "800", marginTop: 4 },

  divider: { height: 1, marginVertical: 12 },

  msg: { fontSize: 13, fontWeight: "800", lineHeight: 20 },

  primaryBtn: {
    marginTop: 14,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  primaryText: { fontSize: 13, fontWeight: "900" },
});
