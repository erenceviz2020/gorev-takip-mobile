// app/task/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
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

import { dateHelpers, useAppData } from "../../src/context/AppDataContext";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import { getPremiumStyles } from "../../src/ui/premium";

type Status = "BEKLEMEDE" | "DEVAM" | "TAMAMLANDI";
type Priority = "YÜKSEK" | "ORTA" | "DÜŞÜK";

const EMPLOYEES = ["Mehmet Demir", "Ayşe Kara", "Fatma Şahin"] as const;

function statusStyle(status: Status) {
  if (status === "BEKLEMEDE")
    return { bg: "rgba(245,158,11,0.16)", border: "rgba(245,158,11,0.55)", text: "#F59E0B", label: "BEKLEMEDE" };
  if (status === "DEVAM")
    return { bg: "rgba(59,130,246,0.16)", border: "rgba(59,130,246,0.55)", text: "#3B82F6", label: "DEVAM EDİYOR" };
  return { bg: "rgba(16,185,129,0.16)", border: "rgba(16,185,129,0.55)", text: "#10B981", label: "TAMAMLANDI" };
}

function priorityStyle(priority: Priority) {
  if (priority === "YÜKSEK")
    return { bg: "rgba(239,68,68,0.16)", border: "rgba(239,68,68,0.55)", text: "#EF4444", label: "YÜKSEK" };
  if (priority === "ORTA")
    return { bg: "rgba(245,158,11,0.16)", border: "rgba(245,158,11,0.55)", text: "#F59E0B", label: "ORTA" };
  return { bg: "rgba(16,185,129,0.16)", border: "rgba(16,185,129,0.55)", text: "#10B981", label: "DÜŞÜK" };
}

function Badge({
  label,
  bg,
  border,
  text,
}: {
  label: string;
  bg: string;
  border: string;
  text: string;
}) {
  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
    </View>
  );
}

function InfoCard({
  icon,
  title,
  value,
  colors,
  ui,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  colors: any;
  ui: any;
}) {
  return (
    <View style={[styles.infoCard, ui.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.infoIcon, { backgroundColor: colors.surface3 }]}>
        <Ionicons name={icon} size={18} color={colors.text} />
      </View>
      <Text style={[styles.infoTitle, { color: colors.muted }]}>{title}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

/** ---- simple Select Sheet ---- */
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
      <View style={styles.sheetWrap}>
        <View style={[styles.sheetCard, ui.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onClose}
              style={[styles.iconBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
            >
              <Ionicons name="close" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              activeOpacity={0.9}
              onPress={() => {
                onSelect(opt);
                onClose();
              }}
              style={[styles.sheetRow, { borderColor: colors.hairline, backgroundColor: colors.surface2 }]}
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

/** ---- Edit Modal ---- */
function EditTaskModal({
  visible,
  onClose,
  task,
  onSave,
  colors,
  ui,
}: {
  visible: boolean;
  onClose: () => void;
  task: any;
  onSave: (patch: any) => void;
  colors: any;
  ui: any;
}) {
  const [title, setTitle] = useState(String(task?.title ?? ""));
  const [description, setDescription] = useState(String(task?.description ?? ""));
  const [location, setLocation] = useState(String(task?.location ?? ""));
  const [team, setTeam] = useState(String(task?.team ?? ""));

  const [status, setStatus] = useState<Status>((task?.status ?? "BEKLEMEDE") as Status);
  const [priority, setPriority] = useState<Priority>((task?.priority ?? "ORTA") as Priority);

  const [assignee, setAssignee] = useState<string>(
    String(task?.personFullName ?? task?.assignee ?? task?.person ?? "")
  );

  const initialDate = useMemo(() => {
    const iso = task?.dueISO;
    if (iso) return new Date(String(iso));
    return null;
  }, [task]);

  const [dueDate, setDueDate] = useState<Date | null>(initialDate);
  const [showPicker, setShowPicker] = useState(false);

  const [assigneeSheet, setAssigneeSheet] = useState(false);
  const [statusSheet, setStatusSheet] = useState(false);
  const [prioritySheet, setPrioritySheet] = useState(false);

  const dueText = useMemo(() => {
    if (!dueDate) return "";
    // dateHelpers varsa onu kullanalım, yoksa fallback:
    try {
      return dateHelpers.formatLongTR(dueDate);

    } catch {
      const dd = String(dueDate.getDate()).padStart(2, "0");
      const mm = String(dueDate.getMonth() + 1).padStart(2, "0");
      const yyyy = dueDate.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
    }
  }, [dueDate]);

  const onDateChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") setShowPicker(false);
    if (selected) setDueDate(selected);
  };

  const canSave =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    location.trim().length > 0 &&
    team.trim().length > 0 &&
    assignee.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />

      <View style={styles.modalWrap}>
        <View style={[styles.modalCard, ui.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Görevi Düzenle</Text>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.85}
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
                value={description}
                onChangeText={setDescription}
                multiline
                placeholder="Görev hakkında detaylı açıklama..."
                placeholderTextColor={colors.iconMuted}
                style={[styles.inputText, { color: colors.text }]}
              />
            </View>

            <View style={{ height: 10 }} />
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>ATANAN</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setAssigneeSheet(true)}
              style={[styles.select, { backgroundColor: colors.surface2, borderColor: colors.border }]}
            >
              <Ionicons name="person-outline" size={16} color={colors.iconMuted} />
              <Text style={[styles.selectText, { color: assignee ? colors.text : colors.iconMuted }]}>
                {assignee || "Çalışan seçin..."}
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
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>DURUM</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setStatusSheet(true)}
              style={[styles.select, { backgroundColor: colors.surface2, borderColor: colors.border }]}
            >
              <Ionicons name="swap-horizontal-outline" size={16} color={colors.iconMuted} />
              <Text style={[styles.selectText, { color: colors.text }]}>
                {status === "BEKLEMEDE" ? "Beklemede" : status === "DEVAM" ? "Devam Ediyor" : "Tamamlandı"}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.chevron ?? colors.iconMuted} />
            </TouchableOpacity>

            <View style={{ height: 10 }} />
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>ÖNCELİK</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setPrioritySheet(true)}
              style={[styles.select, { backgroundColor: colors.surface2, borderColor: colors.border }]}
            >
              <Ionicons name="flag-outline" size={16} color={colors.iconMuted} />
              <Text style={[styles.selectText, { color: colors.text }]}>
                {priority === "DÜŞÜK" ? "Düşük" : priority === "ORTA" ? "Orta" : "Yüksek"}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.chevron ?? colors.iconMuted} />
            </TouchableOpacity>

            <View style={{ height: 10 }} />
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>BİTİŞ TARİHİ</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setShowPicker(true)}
              style={[styles.select, { backgroundColor: colors.surface2, borderColor: colors.border }]}
            >
              <Ionicons name="calendar-outline" size={16} color={colors.iconMuted} />
              <Text style={[styles.selectText, { color: dueText ? colors.text : colors.iconMuted }]}>
                {dueText || "Tarih seçin..."}
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
                disabled={!canSave}
                onPress={() => {
                  const patch: any = {
                    title,
                    description,
                    location,
                    team,
                    status,
                    priority,

                    // sende personFullName kullanıyorsun:
                    personFullName: assignee,
                   
                  };

                  // tarih:
                  if (dueDate) {
                    try {
                      patch.dateText = dateHelpers.formatShortTR(dueDate);
                      patch.dueISO = dateHelpers.toISODate(dueDate);
                    } catch {
                      // fallback
                      patch.dateText = dueText;
                      patch.dueISO = dueDate.toISOString().slice(0, 10);
                    }
                  }

                  onSave(patch);
                  onClose();
                }}
                style={[
                  styles.footerBtn,
                  {
                    backgroundColor: canSave ? colors.primary : "rgba(148,163,184,0.35)",
                    borderColor: "transparent",
                  },
                ]}
              >
                <Text style={{ color: colors.white, fontWeight: "900" }}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      <SelectSheet
        visible={assigneeSheet}
        title="Çalışan Seç"
        options={EMPLOYEES}
        onClose={() => setAssigneeSheet(false)}
        onSelect={setAssignee}
        colors={colors}
        ui={ui}
      />

      <SelectSheet
        visible={statusSheet}
        title="Durum Seç"
        options={["BEKLEMEDE", "DEVAM", "TAMAMLANDI"] as const}
        onClose={() => setStatusSheet(false)}
        onSelect={(v) => setStatus(v as Status)}
        colors={colors}
        ui={ui}
      />

      <SelectSheet
        visible={prioritySheet}
        title="Öncelik Seç"
        options={["DÜŞÜK", "ORTA", "YÜKSEK"] as const}
        onClose={() => setPrioritySheet(false)}
        onSelect={(v) => setPriority(v as Priority)}
        colors={colors}
        ui={ui}
      />
    </Modal>
  );
}

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { colors, isDark } = useTheme();
  const ui = getPremiumStyles(colors, isDark);

  const { role, userName } = useAuth();
  const { tasks, updateTask } = useAppData();

  const [editOpen, setEditOpen] = useState(false);

  const task = useMemo(() => {
    const t = tasks.find((x: any) => String(x.id) === String(id));
    return t ?? tasks[0];
  }, [tasks, id]);

  if (!task) {
    return (
      <View style={[styles.page, { backgroundColor: colors.bg }]}>
        <View style={[styles.emptyWrap, { paddingTop: 30 }]}>
          <Text style={{ color: colors.text, fontWeight: "900", fontSize: 16 }}>
            Görev bulunamadı
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.9}
          >
            <Text style={{ color: colors.white, fontWeight: "900" }}>Geri</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const assigneeFull = String(task?.personFullName ?? "—");



  // çalışan erişim kuralı (istersen)
  if (role === "employee" && userName && assigneeFull !== userName) {
    return (
      <View style={[styles.page, { backgroundColor: colors.bg }]}>
        <View style={[styles.emptyWrap, { paddingTop: 30 }]}>
          <Text style={{ color: colors.text, fontWeight: "900", fontSize: 16 }}>
            Bu göreve erişimin yok
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.9}
          >
            <Text style={{ color: colors.white, fontWeight: "900" }}>Geri</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const status = (task.status ?? "BEKLEMEDE") as Status;
  const priority = (task.priority ?? "ORTA") as Priority;

  const s = statusStyle(status);
  const p = priorityStyle(priority);

  const title = String(task.title ?? "—");
  const desc = String(task.description ?? "—");
  const location = String(task.location ?? "—");
  const team = String(task.team ?? "—");
  const dateText = String(task.dateText ?? "—");

  return (
    <View style={[styles.page, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
          >
            <Ionicons name="arrow-back" size={18} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.topTitle, { color: colors.text }]}>Görev Detayı</Text>

          {role === "admin" ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setEditOpen(true)}
              style={[styles.editBtn, { backgroundColor: colors.surface2, borderColor: colors.border }]}
            >
              <Ionicons name="create-outline" size={18} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* Hero */}
        <View style={[styles.hero, ui.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.heroTop}>
            <Text style={[styles.heroTitle, { color: colors.text }]}>{title}</Text>
            <Badge label={p.label} bg={p.bg} border={p.border} text={p.text} />
          </View>

          <View style={{ height: 10 }} />
          <Badge label={s.label} bg={s.bg} border={s.border} text={s.text} />
        </View>

        {/* Description */}
        <View style={[styles.descCard, ui.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.descRow}>
            <View style={[styles.descIcon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="document-text-outline" size={18} color={colors.text} />
            </View>
            <Text style={[styles.descTitle, { color: colors.text }]}>Açıklama</Text>
          </View>

          <Text style={[styles.descText, { color: colors.muted }]}>{desc}</Text>
        </View>

        {/* Info grid */}
        <View style={styles.grid}>
          <InfoCard icon="person-outline" title="ATANAN" value={assigneeFull} colors={colors} ui={ui} />
          <InfoCard icon="calendar-outline" title="BİTİŞ" value={dateText} colors={colors} ui={ui} />
          <InfoCard icon="location-outline" title="LOKASYON" value={location} colors={colors} ui={ui} />
          <InfoCard icon="people-outline" title="EKİP" value={team} colors={colors} ui={ui} />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Edit modal */}
      <EditTaskModal
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        task={task}
        onSave={(patch) => updateTask(String(task.id), patch)}
        colors={colors}
        ui={ui}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  container: { paddingHorizontal: 18, paddingTop: 60, paddingBottom: 40 },

  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  topTitle: { fontSize: 18, fontWeight: "900" },

  hero: { borderRadius: 22, borderWidth: 1, padding: 16 },
  heroTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  heroTitle: { flex: 1, fontSize: 22, fontWeight: "900", lineHeight: 28 },

  badge: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, alignSelf: "flex-start" },
  badgeText: { fontSize: 12, fontWeight: "900" },

  descCard: { marginTop: 14, borderRadius: 22, borderWidth: 1, padding: 16 },
  descRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  descIcon: { width: 38, height: 38, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  descTitle: { fontSize: 14, fontWeight: "900" },
  descText: { fontSize: 13, fontWeight: "700", lineHeight: 20 },

  grid: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  infoCard: { width: "48%", borderRadius: 22, borderWidth: 1, padding: 14 },
  infoIcon: { width: 40, height: 40, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  infoTitle: { fontSize: 11, fontWeight: "900" },
  infoValue: { marginTop: 6, fontSize: 14, fontWeight: "900" },

  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyBtn: { height: 46, paddingHorizontal: 18, borderRadius: 14, alignItems: "center", justifyContent: "center" },

  // modal
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

  footerBtn: { flex: 1, height: 52, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  iosDone: { marginTop: 10, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },

  // sheet
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  sheetWrap: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 24 },
  sheetCard: { borderRadius: 20, borderWidth: 1, padding: 14 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  sheetTitle: { fontSize: 15, fontWeight: "900" },
  sheetRow: { height: 52, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sheetRowText: { fontSize: 14, fontWeight: "900" },
});
