import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import { base, getPremiumStyles } from "../../src/ui/premium";

type Status = "BEKLEMEDE" | "DEVAM" | "TAMAMLANDI";
type Priority = "YÜKSEK" | "ORTA" | "DÜŞÜK";

type Task = {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  location: string;
  team: string;
  assignee: string;
  dateText: string;
};

const MOCK_TASKS: Task[] = [
  {
    id: "1",
    title: "Depo Envanter Kontrolü",
    status: "BEKLEMEDE",
    priority: "YÜKSEK",
    location: "Ana Depo - İstanbul",
    team: "Depo Ekibi",
    assignee: "Mehmet Demir",
    dateText: "12 Şub 2026",
  },
  {
    id: "2",
    title: "Klima Bakımı - Ofis 3",
    status: "DEVAM",
    priority: "ORTA",
    location: "3. Kat Ofis - Ankara",
    team: "Bakım Ekibi",
    assignee: "Ayşe Kara",
    dateText: "10 Şub 2026",
  },
  {
    id: "3",
    title: "Saha Müşteri Ziyareti",
    status: "TAMAMLANDI",
    priority: "DÜŞÜK",
    location: "ABC Şirketi - İzmir",
    team: "Saha Ekibi",
    assignee: "Mehmet Demir",
    dateText: "9 Şub 2026",
  },
  {
    id: "4",
    title: "Elektrik Panosu Kontrolü",
    status: "BEKLEMEDE",
    priority: "YÜKSEK",
    location: "Elektrik Odası - İstanbul",
    team: "Teknik Ekip",
    assignee: "Fatma Şahin",
    dateText: "11 Şub 2026",
  },
  {
    id: "5",
    title: "Araç Bakımı - TR34ABC123",
    status: "DEVAM",
    priority: "ORTA",
    location: "Servis - İstanbul",
    team: "Operasyon",
    assignee: "Ayşe Kara",
    dateText: "13 Şub 2026",
  },
  {
    id: "6",
    title: "Güvenlik Kamera Kontrolü",
    status: "BEKLEMEDE",
    priority: "ORTA",
    location: "Tüm Lokasyonlar",
    team: "Teknik Ekip",
    assignee: "Mehmet Demir",
    dateText: "14 Şub 2026",
  },
];

function statusBadgeStyle(status: Status) {
  if (status === "BEKLEMEDE")
    return {
      bg: "rgba(245,158,11,0.16)",
      border: "rgba(245,158,11,0.55)",
      text: "#F59E0B",
      label: "BEKLEMEDE",
    };
  if (status === "DEVAM")
    return {
      bg: "rgba(59,130,246,0.16)",
      border: "rgba(59,130,246,0.55)",
      text: "#3B82F6",
      label: "DEVAM EDİYOR",
    };
  return {
    bg: "rgba(16,185,129,0.16)",
    border: "rgba(16,185,129,0.55)",
    text: "#10B981",
    label: "TAMAMLANDI",
  };
}

function priorityBarColor(priority: Priority) {
  if (priority === "YÜKSEK") return "#EF4444";
  if (priority === "ORTA") return "#F59E0B";
  return "#10B981";
}

function StatusBadge({ status }: { status: Status }) {
  const cfg = statusBadgeStyle(status);
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

type FilterKey = "ALL" | Status;

function FilterPill({
  label,
  count,
  active,
  onPress,
  colors,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
  colors: any;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.pill,
        {
          backgroundColor: active ? colors.primary : colors.surface2,
          borderColor: active ? "rgba(255,255,255,0.10)" : colors.border,
        },
      ]}
    >
      <Text style={[styles.pillText, { color: active ? colors.white : colors.text }]}>{label}</Text>
      <Text style={[styles.pillCount, { color: active ? colors.white : colors.text }]}>{count}</Text>
    </TouchableOpacity>
  );
}

function TaskCard({
  task,
  onPress,
  colors,
  ui,
}: {
  task: Task;
  onPress: () => void;
  colors: any;
  ui: any;
}) {
  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={[styles.taskCard, ui.card]}>
      <View style={[styles.priorityBar, { backgroundColor: priorityBarColor(task.priority) }]} />
      <View style={styles.taskInner}>
        <View style={styles.taskTop}>
          <Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={1}>
            {task.title}
          </Text>
          <StatusBadge status={task.status} />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={colors.iconMuted} />
            <Text style={[styles.metaText, { color: colors.muted }]} numberOfLines={1}>
              {task.location}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color={colors.iconMuted} />
            <Text style={[styles.metaText, { color: colors.muted }]} numberOfLines={1}>
              {task.team}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.hairline }]} />

        <View style={styles.bottomRow}>
          <Text style={[styles.assignee, { color: colors.text }]} numberOfLines={1}>
            {task.assignee}
          </Text>
          <Text style={[styles.dateText, { color: colors.text }]}>{task.dateText}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function TasksScreen() {
  const router = useRouter();
  const { role, userName } = useAuth();
  const { colors, isDark } = useTheme();
  const ui = getPremiumStyles(colors, isDark);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("ALL");

  const scopedTasks = useMemo(() => {
    return role === "admin" ? MOCK_TASKS : MOCK_TASKS.filter((t) => t.assignee === userName);
  }, [role, userName]);

  const counts = useMemo(() => {
    const all = scopedTasks.length;
    const beklemede = scopedTasks.filter((t) => t.status === "BEKLEMEDE").length;
    const devam = scopedTasks.filter((t) => t.status === "DEVAM").length;
    const tamam = scopedTasks.filter((t) => t.status === "TAMAMLANDI").length;
    return { all, beklemede, devam, tamam };
  }, [scopedTasks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return scopedTasks.filter((t) => {
      const passFilter = filter === "ALL" ? true : t.status === filter;
      const passQuery =
        q.length === 0
          ? true
          : `${t.title} ${t.location} ${t.team} ${t.assignee}`.toLowerCase().includes(q);

      return passFilter && passQuery;
    });
  }, [query, filter, scopedTasks]);

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: colors.bg }]} edges={["top"]}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text style={[base.h1, { color: colors.text }]}>Tüm Görevler</Text>
            <Text style={[base.h2, { color: colors.muted }]}>{filtered.length} aktif görev</Text>

            <View style={[styles.searchBox, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
              <Ionicons name="search-outline" size={18} color={colors.iconMuted} />
              <TextInput
                placeholder="Görev ara..."
                placeholderTextColor={colors.iconMuted}
                value={query}
                onChangeText={setQuery}
                style={[styles.searchInput, { color: colors.text }]}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
              <FilterPill label="Tümü" count={counts.all} active={filter === "ALL"} onPress={() => setFilter("ALL")} colors={colors} />
              <FilterPill label="Beklemede" count={counts.beklemede} active={filter === "BEKLEMEDE"} onPress={() => setFilter("BEKLEMEDE")} colors={colors} />
              <FilterPill label="Devam" count={counts.devam} active={filter === "DEVAM"} onPress={() => setFilter("DEVAM")} colors={colors} />
              <FilterPill label="Tamam" count={counts.tamam} active={filter === "TAMAMLANDI"} onPress={() => setFilter("TAMAMLANDI")} colors={colors} />
            </ScrollView>

            <View style={{ height: 14 }} />
          </>
        }
        renderItem={({ item }) => (
          <TaskCard task={item} onPress={() => router.push(`/task/${item.id}`)} colors={colors} ui={ui} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {role === "admin" && (
        <TouchableOpacity activeOpacity={0.9} style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => {}}>
          <Ionicons name="add" size={26} color={colors.white} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  container: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 120 },

  searchBox: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: "700" },

  pillsRow: { flexDirection: "row", gap: 10, paddingRight: 18 },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: { fontWeight: "900", fontSize: 13 },
  pillCount: { fontWeight: "900", fontSize: 13 },

  taskCard: { flexDirection: "row", overflow: "hidden" as const },
  priorityBar: { width: 5 },
  taskInner: { flex: 1, padding: 14 },

  taskTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  taskTitle: { flex: 1, fontSize: 15, fontWeight: "900" },

  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: "900" },

  metaRow: { flexDirection: "row", gap: 14, marginTop: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  metaText: { fontSize: 12, fontWeight: "800", flex: 1 },

  divider: { height: 1, marginTop: 12 },

  bottomRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, gap: 12 },
  assignee: { fontSize: 12, fontWeight: "900", flex: 1 },
  dateText: { fontSize: 12, fontWeight: "900" },

  fab: {
    position: "absolute",
    right: 18,
    bottom: 40,
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
});
