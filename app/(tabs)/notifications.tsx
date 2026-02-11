import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import { base, getPremiumStyles } from "../../src/ui/premium";

type NotifType = "ASSIGNED" | "STATUS" | "COMMENT";

type NotificationItem = {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  dateText: string; // "Dün" / "8 Şub 2026"
  taskId?: string;
  userScope?: "admin" | "employee" | "all";
};

const MOCK_NOTIFS: NotificationItem[] = [
  {
    id: "n1",
    type: "ASSIGNED",
    title: "Yeni Görev Atandı",
    message: 'Size "Depo Envanter Kontrolü" görevi atandı',
    dateText: "Dün",
    taskId: "1",
    userScope: "employee",
  },
  {
    id: "n2",
    type: "STATUS",
    title: "Görev Durumu Değişti",
    message: '"Klima Bakımı" görevi devam ediyor olarak güncellendi',
    dateText: "Dün",
    taskId: "2",
    userScope: "all",
  },
  {
    id: "n3",
    type: "COMMENT",
    title: "Yeni Not Eklendi",
    message: '"Saha Müşteri Ziyareti" görevine yorum eklendi',
    dateText: "8 Şub 2026",
    taskId: "3",
    userScope: "all",
  },
  {
    id: "n4",
    type: "ASSIGNED",
    title: "Yeni Görev Atandı",
    message: 'Size "Araç Bakımı" görevi atandı',
    dateText: "8 Şub 2026",
    taskId: "5",
    userScope: "employee",
  },
];

function typeMeta(t: NotifType) {
  if (t === "ASSIGNED")
    return { icon: "notifications-outline" as const, bg: "rgba(79,70,229,0.22)" };
  if (t === "STATUS")
    return { icon: "checkmark-circle-outline" as const, bg: "rgba(16,185,129,0.18)" };
  return { icon: "chatbubble-ellipses-outline" as const, bg: "rgba(59,130,246,0.18)" };
}

function NotifCard({
  item,
  onPress,
  colors,
  ui,
}: {
  item: NotificationItem;
  onPress: () => void;
  colors: any;
  ui: any;
}) {
  const meta = typeMeta(item.type);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.card, ui.card]}>
      <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
        <Ionicons name={meta.icon} size={18} color={colors.white} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.msg, { color: colors.muted }]}>{item.message}</Text>
        <Text style={[styles.date, { color: colors.iconMuted }]}>{item.dateText}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.chevron ?? colors.iconMuted} />
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { role } = useAuth();
  const { colors, isDark } = useTheme();
  const ui = getPremiumStyles(colors, isDark);

  const data = useMemo(() => {
    if (role === "admin") return MOCK_NOTIFS.filter((n) => n.userScope !== "employee");
    return MOCK_NOTIFS.filter((n) => n.userScope === "employee" || n.userScope === "all");
  }, [role]);

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: colors.bg }]} edges={["top"]}>
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text style={[base.h1, { color: colors.text }]}>Bildirimler</Text>
            <Text style={[base.h2, { color: colors.muted }]}>{data.length} bildirim</Text>
            <View style={{ height: 14 }} />
          </>
        }
        renderItem={({ item }) => (
          <NotifCard
            item={item}
            colors={colors}
            ui={ui}
            onPress={() =>
              router.push({
                pathname: "/notification/[id]",
                params: { id: item.id },
              })
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  container: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 120 },

  card: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    alignItems: "center",
  },

  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  title: { fontSize: 14, fontWeight: "900" },
  msg: { fontSize: 12, fontWeight: "700", marginTop: 4, lineHeight: 18 },
  date: { fontSize: 11, fontWeight: "800", marginTop: 8 },
});
