import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Rect } from "react-native-svg";

import { dateHelpers, useAppData } from "../../src/context/AppDataContext";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import { base, getPremiumStyles } from "../../src/ui/premium";

type TaskStatus = "BEKLEMEDE" | "DEVAM" | "TAMAMLANDI";
type Priority = "YÜKSEK" | "ORTA" | "DÜŞÜK";

type StatCard = {
  title: string;
  value: number;
  deltaText: string;
  deltaPositive: boolean;
  iconName: keyof typeof Ionicons.glyphMap;
  iconBg: string;
};

// --- Demo stats (UI) ---
const stats: StatCard[] = [
  { title: "Toplam Görev", value: 6, deltaText: "+12%", deltaPositive: true, iconName: "pulse-outline", iconBg: "#2E2A66" },
  { title: "Beklemede", value: 3, deltaText: "3", deltaPositive: true, iconName: "time-outline", iconBg: "#6B4B14" },
  { title: "Devam Ediyor", value: 2, deltaText: "2", deltaPositive: true, iconName: "alert-circle-outline", iconBg: "#123B6B" },
  { title: "Tamamlandı", value: 1, deltaText: "+17%", deltaPositive: true, iconName: "checkmark-circle-outline", iconBg: "#0F4A3A" },
];

const EMPLOYEES = ["Mehmet Demir", "Ayşe Kara", "Fatma Şahin"] as const;
const CATEGORIES = ["Saha", "Bakım", "Depo", "Operasyon"] as const;

function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg =
    status === "BEKLEMEDE"
      ? { bg: "rgba(245,158,11,0.16)", border: "rgba(245,158,11,0.55)", text: "#F59E0B", label: "BEKLEMEDE" }
      : status === "DEVAM"
      ? { bg: "rgba(59,130,246,0.16)", border: "rgba(59,130,246,0.55)", text: "#3B82F6", label: "DEVAM EDİYOR" }
      : { bg: "rgba(16,185,129,0.16)", border: "rgba(16,185,129,0.55)", text: "#10B981", label: "TAMAMLANDI" };

  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

function ProgressBar({ value }: { value: number }) {
  const width = 220;
  const height = 10;
  const r = 6;
  const filled = Math.max(0, Math.min(1, value)) * width;

  return (
    <Svg width={width} height={height}>
      <Rect x="0" y="0" width={width} height={height} rx={r} ry={r} fill="rgba(255,255,255,0.12)" />
      <Rect x="0" y="0" width={filled} height={height} rx={r} ry={r} fill="#10B981" />
    </Svg>
  );
}

/** ✅ Seçim Sheet: sadece seçer, addTask yapmaz */
function SelectSheet({
  visible,
  title,
  options,
  onClose,
  onSelect,
  colors,
  ui,
}: {
  visible: boolean;
  title: string;
  options: readonly string[];
  onClose: () => void;
  onSelect: (v: string) => void;
  colors: any;
  ui: any;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: "transparent" }]}>
        <View style={[styles.sheetCard, ui.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{title}</Text>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              style={[styles.iconBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
            >
              <Ionicons name="close" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={{ height: 10 }} />

          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              activeOpacity={0.9}
              onPress={() => {
                onSelect(opt);
                onClose();
              }}
              style={[styles.sheetRow, { borderColor: colors.hairline }]}
            >
              <Text style={[styles.sheetRowText, { color: colors.text }]}>{opt}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.chevron ?? colors.iconMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

function CreateTaskModal({
  visible,
  onClose,
  colors,
  ui,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  colors: any;
  ui: any;
  onCreate: (payload: {
    title: string;
    desc: string;
    employee: string;
    category: string;
    location: string;
    team: string;
    priority: Priority;
    dueDate: Date;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const [employee, setEmployee] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const [location, setLocation] = useState("");
  const [team, setTeam] = useState("");

  const [priority, setPriority] = useState<Priority>("ORTA");

  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const [employeeSheet, setEmployeeSheet] = useState(false);
  const [categorySheet, setCategorySheet] = useState(false);

  const dueText = useMemo(() => {
    if (!dueDate) return "";
    const d = dueDate;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }, [dueDate]);

  const canSubmit =
    title.trim().length > 0 &&
    desc.trim().length > 0 &&
    employee.trim().length > 0 &&
    category.trim().length > 0 &&
    location.trim().length > 0 &&
    team.trim().length > 0 &&
    !!dueDate;

  const onDateChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") setShowPicker(false);
    if (selected) setDueDate(selected);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />

      <View style={styles.modalWrap}>
        <View style={[styles.modalCard, ui.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Yeni Görev Oluştur</Text>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              style={[styles.iconBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
            >
              <Ionicons name="close" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>GÖREV BAŞLIĞI</Text>
            <View style={[styles.input, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Örn: Depo Envanter Kontrolü"
                placeholderTextColor={colors.iconMuted}
                style={[styles.inputText, { color: colors.text }]}
              />
            </View>

            <View style={{ height: 10 }} />
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>AÇIKLAMA</Text>
            <View style={[styles.inputArea, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
              <TextInput
                value={desc}
                onChangeText={setDesc}
                multiline
                placeholder="Görev hakkında detaylı açıklama..."
                placeholderTextColor={colors.iconMuted}
                style={[styles.inputText, { color: colors.text }]}
              />
            </View>

            <View style={{ height: 10 }} />
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>ÇALIŞAN SEÇ</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setEmployeeSheet(true)}
              style={[styles.select, { backgroundColor: colors.surface2, borderColor: colors.border }]}
            >
              <Ionicons name="person-outline" size={16} color={colors.iconMuted} />
              <Text style={[styles.selectText, { color: employee ? colors.text : colors.iconMuted }]}>
                {employee || "Bir çalışan seçin..."}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.chevron ?? colors.iconMuted} />
            </TouchableOpacity>

            <View style={{ height: 10 }} />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.muted }]}>LOKASYON</Text>
                <View style={[styles.input, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                  <TextInput
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Örn: Ana Depo"
                    placeholderTextColor={colors.iconMuted}
                    style={[styles.inputText, { color: colors.text }]}
                  />
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.muted }]}>EKİP</Text>
                <View style={[styles.input, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                  <TextInput
                    value={team}
                    onChangeText={setTeam}
                    placeholder="Örn: Depo Ekibi"
                    placeholderTextColor={colors.iconMuted}
                    style={[styles.inputText, { color: colors.text }]}
                  />
                </View>
              </View>
            </View>

            <View style={{ height: 10 }} />
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>BİTİŞ TARİHİ</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setShowPicker(true)}
              style={[styles.select, { backgroundColor: colors.surface2, borderColor: colors.border }]}
            >
              <Ionicons name="calendar-outline" size={16} color={colors.iconMuted} />
              <Text style={[styles.selectText, { color: dueText ? colors.text : colors.iconMuted }]}>
                {dueText || "gg.aa.yyyy"}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.chevron ?? colors.iconMuted} />
            </TouchableOpacity>

            {showPicker && (
              <View style={{ marginTop: 8 }}>
                <DateTimePicker
                  value={dueDate ?? new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={onDateChange}
                />
                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setShowPicker(false)}
                    style={[styles.iosDone, { backgroundColor: colors.primary }]}
                  >
                    <Text style={{ color: colors.white, fontWeight: "900" }}>Tamam</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={{ height: 10 }} />
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>KATEGORİ</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setCategorySheet(true)}
              style={[styles.select, { backgroundColor: colors.surface2, borderColor: colors.border }]}
            >
              <Ionicons name="briefcase-outline" size={16} color={colors.iconMuted} />
              <Text style={[styles.selectText, { color: category ? colors.text : colors.iconMuted }]}>
                {category ? `• ${category}` : "Seçin... (Saha / Bakım / Depo / Operasyon)"}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.chevron ?? colors.iconMuted} />
            </TouchableOpacity>

            <View style={{ height: 10 }} />
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>ÖNCELİK</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {(["DÜŞÜK", "ORTA", "YÜKSEK"] as Priority[]).map((p) => {
                const active = priority === p;
                const dot = p === "DÜŞÜK" ? "#10B981" : p === "ORTA" ? "#F59E0B" : "#EF4444";

                return (
                  <TouchableOpacity
                    key={p}
                    activeOpacity={0.9}
                    onPress={() => setPriority(p)}
                    style={[
                      styles.prioBtn,
                      {
                        backgroundColor: active ? "rgba(245,158,11,0.10)" : colors.surface2,
                        borderColor: active ? "#F59E0B" : colors.border,
                      },
                    ]}
                  >
                    <View style={[styles.prioDot, { backgroundColor: dot }]} />
                    <Text style={{ color: colors.text, fontWeight: "900" }}>
                      {p === "DÜŞÜK" ? "Düşük" : p === "ORTA" ? "Orta" : "Yüksek"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ height: 16 }} />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={onClose}
                style={[styles.footerBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
              >
                <Text style={{ color: colors.text, fontWeight: "900" }}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                disabled={!canSubmit}
                onPress={() => {
                  if (!dueDate) return;

                  onCreate({
                    title: title.trim(),
                    desc: desc.trim(),
                    employee: employee.trim(),
                    category: category.trim(),
                    location: location.trim(),
                    team: team.trim(),
                    priority,
                    dueDate,
                  });

                  // form reset (premium his)
                  setTitle("");
                  setDesc("");
                  setEmployee("");
                  setCategory("");
                  setLocation("");
                  setTeam("");
                  setPriority("ORTA");
                  setDueDate(null);
                  setShowPicker(false);

                  onClose();
                }}
                style={[
                  styles.footerBtn,
                  {
                    backgroundColor: canSubmit ? colors.primary : "rgba(148,163,184,0.35)",
                    borderColor: "transparent",
                  },
                ]}
              >
                <Text style={{ color: colors.white, fontWeight: "900" }}>Oluştur</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      <SelectSheet
        visible={employeeSheet}
        title="Çalışan Seç"
        options={EMPLOYEES}
        onClose={() => setEmployeeSheet(false)}
        onSelect={(v) => setEmployee(v)}
        colors={colors}
        ui={ui}
      />
      <SelectSheet
        visible={categorySheet}
        title="Kategori Seç"
        options={CATEGORIES}
        onClose={() => setCategorySheet(false)}
        onSelect={(v) => setCategory(v)}
        colors={colors}
        ui={ui}
      />
    </Modal>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { role } = useAuth();
  const { colors, isDark } = useTheme();
  const ui = getPremiumStyles(colors, isDark);

  const { tasks, addTask } = useAppData();

  const completion = 0.17;
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <View style={[styles.page, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[base.h1, { color: colors.text }]}>Dashboard</Text>
          <Text style={[base.h2, { color: colors.muted }]}>Görev yönetimi genel görünümü</Text>
        </View>

        <View style={styles.grid}>
          {stats.map((s) => (
            <View
              key={s.title}
              style={[styles.kpiCard, ui.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.kpiIcon, { backgroundColor: s.iconBg }]}>
                <Ionicons name={s.iconName} size={20} color={colors.white} />
              </View>

              <View style={styles.kpiRow}>
                <Text style={[styles.kpiValue, { color: colors.text }]}>{s.value}</Text>
                <Text style={[styles.kpiDelta, { color: s.deltaPositive ? "#10B981" : "#EF4444" }]}>{s.deltaText}</Text>
              </View>

              <Text style={[styles.kpiTitle, { color: colors.muted }]}>{s.title}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.bigCard, ui.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.bigCardTop}>
            <View>
              <Text style={[styles.bigTitle, { color: colors.text }]}>Tamamlanma Oranı</Text>
              <Text style={[styles.bigSub, { color: colors.muted }]}>Bu ayki genel performans</Text>
            </View>
            <Text style={[styles.bigPercent, { color: colors.text }]}>{Math.round(completion * 100)}%</Text>
          </View>

          <View style={{ marginTop: 14 }}>
            <ProgressBar value={completion} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Son Görevler</Text>
          <Text style={[styles.sectionMeta, { color: colors.muted }]}>{tasks.length} görev</Text>
        </View>

        <View style={{ gap: 15, paddingBottom: 90 }}>
          {tasks.map((t) => (
            <TouchableOpacity
              key={t.id}
              activeOpacity={0.85}
              style={[styles.taskCard, ui.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push(`/task/${t.id}`)}
            >
              <View style={styles.taskTop}>
                <Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={1}>
                  {t.title}
                </Text>
                <StatusBadge status={t.status as TaskStatus} />
              </View>

              <View style={styles.taskBottom}>
                <Text style={[styles.taskPerson, { color: colors.text }]} numberOfLines={1}>
                  {(t as any).personFullName ?? (t as any).person ?? "—"}
                </Text>
                <Text style={[styles.taskDate, { color: colors.muted }]}>
                  {t.dateText}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {role === "admin" && (
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => setCreateOpen(true)}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </TouchableOpacity>
      )}

      <CreateTaskModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        colors={colors}
        ui={ui}
        onCreate={({ title, desc, employee, category, location, team, priority, dueDate }) => {
          addTask({
            title,
            personFullName: employee,
            dateText: dateHelpers.formatShortTR(dueDate),
            dueISO: dateHelpers.toISODate(dueDate),
            status: "BEKLEMEDE",
            priority,
            description: desc,
            location,
            team,
            category: category as any,
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  container: { paddingHorizontal: 18, paddingTop: 60 },

  header: { marginBottom: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 12 },

  kpiCard: { width: "48%", borderRadius: 20, padding: 14, borderWidth: 1, marginBottom: 12 },
  kpiIcon: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  kpiRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  kpiValue: { fontSize: 26, fontWeight: "800" },
  kpiDelta: { fontSize: 12, fontWeight: "700", marginBottom: 4 },
  kpiTitle: { fontSize: 13, fontWeight: "800", marginTop: 6 },

  bigCard: { borderRadius: 20, padding: 16, borderWidth: 1, marginTop: 6 },
  bigCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  bigTitle: { fontSize: 14, fontWeight: "900" },
  bigSub: { fontSize: 12, marginTop: 4, fontWeight: "700" },
  bigPercent: { fontSize: 22, fontWeight: "900" },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 18, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "900" },
  sectionMeta: { fontSize: 12, fontWeight: "800" },

  taskCard: { borderRadius: 20, padding: 14, borderWidth: 1 },
  taskTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  taskTitle: { fontSize: 14, fontWeight: "900", flex: 1 },
  taskBottom: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, gap: 12 },
  taskPerson: { fontSize: 13, fontWeight: "800", flex: 1 },
  taskDate: { fontSize: 12, fontWeight: "800" },

  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: "900" },

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

  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  modalWrap: { flex: 1, justifyContent: "center", paddingHorizontal: 16 },
  modalCard: { borderRadius: 20, borderWidth: 1, padding: 14, maxHeight: "88%" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  modalTitle: { fontSize: 16, fontWeight: "900" },

  iconBtn: { width: 36, height: 36, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },

  fieldLabel: { fontSize: 11, fontWeight: "900", marginTop: 6 },

  input: { height: 48, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, justifyContent: "center", marginTop: 8 },
  inputArea: { minHeight: 92, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12, marginTop: 8 },
  inputText: { fontSize: 14, fontWeight: "800" },

  select: { height: 48, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, marginTop: 8, flexDirection: "row", alignItems: "center", gap: 10 },
  selectText: { flex: 1, fontSize: 14, fontWeight: "800" },

  prioBtn: { flex: 1, height: 48, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10 },
  prioDot: { width: 10, height: 10, borderRadius: 999 },

  footerBtn: { flex: 1, height: 52, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center" },

  iosDone: { marginTop: 10, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },

  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 24 },
  sheetCard: { borderRadius: 20, borderWidth: 1, padding: 14 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sheetTitle: { fontSize: 15, fontWeight: "900" },

  sheetRow: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetRowText: { fontSize: 14, fontWeight: "900" },
});
