
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";
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
  { id: "1", title: "Depo Envanter Kontrolü", status: "BEKLEMEDE", priority: "YÜKSEK", location: "Ana Depo - İstanbul", team: "Depo Ekibi", assignee: "Mehmet Demir", dateText: "12 Şub 2026" },
  { id: "2", title: "Klima Bakımı - Ofis 3", status: "DEVAM", priority: "ORTA", location: "3. Kat Ofis - Ankara", team: "Bakım Ekibi", assignee: "Ayşe Kara", dateText: "10 Şub 2026" },
  { id: "3", title: "Saha Müşteri Ziyareti", status: "TAMAMLANDI", priority: "DÜŞÜK", location: "ABC Şirketi - İzmir", team: "Saha Ekibi", assignee: "Mehmet Demir", dateText: "9 Şub 2026" },
  { id: "4", title: "Elektrik Panosu Kontrolü", status: "BEKLEMEDE", priority: "YÜKSEK", location: "Elektrik Odası - İstanbul", team: "Teknik Ekip", assignee: "Fatma Şahin", dateText: "11 Şub 2026" },
  { id: "5", title: "Araç Bakımı - TR34ABC123", status: "DEVAM", priority: "ORTA", location: "Servis - İstanbul", team: "Operasyon", assignee: "Ayşe Kara", dateText: "13 Şub 2026" },
  { id: "6", title: "Güvenlik Kamera Kontrolü", status: "BEKLEMEDE", priority: "ORTA", location: "Tüm Lokasyonlar", team: "Teknik Ekip", assignee: "Mehmet Demir", dateText: "14 Şub 2026" },
];

/** ---------- Premium helpers (no extra deps) ---------- */

function PremiumCard({
  ui,
  isDark,
  children,
  padding = 14,
}: {
  ui: any;
  isDark: boolean;
  children: React.ReactNode;
  padding?: number;
}) {
  return (
    <View style={[ui.card, { padding, marginTop: 12 }]}>
      {!isDark && <View pointerEvents="none" style={ui.glowBottom} />}
      {children}
    </View>
  );
}

function SectionHeader({
  title,
  icon,
  right,
  colors,
  isDark,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  right?: React.ReactNode;
  colors: any;
  isDark: boolean;
}) {
  return (
    <View style={styles.cardHeader}>
      <View style={styles.cardHeaderLeft}>
        <View
          style={[
            styles.cardHeaderIcon,
            { backgroundColor: isDark ? "rgba(79,70,229,0.18)" : "rgba(79,70,229,0.14)" },
          ]}
        >
          <Ionicons name={icon} size={16} color="#C7D2FE" />
        </View>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

/** ---------- Stat Card ---------- */

function StatCard({
  icon,
  label,
  value,
  accent,
  ui,
  colors,
  isDark,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  accent?: string;
  ui: any;
  colors: any;
  isDark: boolean;
}) {
  return (
    <View style={[ui.card, styles.statCard]}>
      {!isDark && <View pointerEvents="none" style={ui.glowBottom} />}
      <View style={[styles.statIcon, { backgroundColor: accent ?? (isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)") }]}>
        <Ionicons name={icon} size={18} color="#FFFFFF" />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

/** ---------- PIE CHART (react-native-svg) ---------- */

function degToRad(deg: number) {
  return (Math.PI / 180) * deg;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = degToRad(angleDeg - 90);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

function StatusPie({
  beklemede,
  devam,
  tamam,
  colors,
}: {
  beklemede: number;
  devam: number;
  tamam: number;
  colors: any;
}) {
  const slices = [
    { label: "Beklemede", value: beklemede, color: "#F59E0B" },
    { label: "Devam Ediyor", value: devam, color: "#3B82F6" },
    { label: "Tamamlandı", value: tamam, color: "#10B981" },
  ].filter((x) => x.value > 0);

  const total = slices.reduce((s, x) => s + x.value, 0);

  const size = 230;
  const cx = size / 2;
  const cy = size / 2;
  const r = 82;

  if (total === 0) {
    return (
      <View style={styles.pieWrap}>
        <Text style={[styles.mutedText, { color: colors.muted }]}>Veri yok</Text>
      </View>
    );
  }

  let startAngle = 0;

  return (
    <View style={styles.pieWrap}>
      <Svg width={size} height={size}>
        <G>
          {slices.map((s, idx) => {
            const angle = (s.value / total) * 360;
            const endAngle = startAngle + angle;
            const d = describeArc(cx, cy, r, startAngle, endAngle);

            const mid = startAngle + angle / 2;
            const pos = polarToCartesian(cx, cy, r * 0.62, mid);

            const el = (
              <G key={idx}>
                <Path d={d} fill={s.color} />
                <SvgText
                  x={pos.x}
                  y={pos.y}
                  fill="#0B1220"
                  fontSize="14"
                  fontWeight="900"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {s.value}
                </SvgText>
              </G>
            );

            startAngle = endAngle;
            return el;
          })}
        </G>
      </Svg>

      <View style={styles.pieLegend}>
        <Text style={[styles.pieLegendText, { color: "#F59E0B" }]}>Beklemede: {beklemede}</Text>
        <Text style={[styles.pieLegendText, { color: "#3B82F6" }]}>Devam Ediyor: {devam}</Text>
        <Text style={[styles.pieLegendText, { color: "#10B981" }]}>Tamamlandı: {tamam}</Text>
      </View>
    </View>
  );
}

/** ---------- Simple Bar Chart ---------- */

function SimpleBarChart({
  labels,
  values,
  colors,
  isDark,
}: {
  labels: string[];
  values: number[];
  colors: any;
  isDark: boolean;
}) {
  const max = Math.max(1, ...values);
  return (
    <View>
      <View
        style={[
          styles.chartArea,
          {
            borderColor: colors.border,
            backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)",
          },
        ]}
      >
        {values.map((v, i) => {
          const h = (v / max) * 120;
          return (
            <View key={labels[i]} style={styles.barCol}>
              <View style={[styles.bar, { height: h, backgroundColor: colors.primary }]} />
              <Text style={[styles.barLabel, { color: colors.muted }]} numberOfLines={1}>
                {labels[i]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** ---------- Screen ---------- */

export default function ReportsScreen() {
  const { role, userName } = useAuth();
  const { colors, isDark } = useTheme();
  const ui = getPremiumStyles(colors, isDark);

  // UI amaçlı
  const [dateFrom] = useState("01.02.2026");
  const [dateTo] = useState("28.02.2026");
  const [statusLabel] = useState("Tümü");

  const scopedTasks = useMemo(() => {
    return role === "admin" ? MOCK_TASKS : MOCK_TASKS.filter((t) => t.assignee === userName);
  }, [role, userName]);

  const stats = useMemo(() => {
    const total = scopedTasks.length;
    const beklemede = scopedTasks.filter((t) => t.status === "BEKLEMEDE").length;
    const devam = scopedTasks.filter((t) => t.status === "DEVAM").length;
    const tamam = scopedTasks.filter((t) => t.status === "TAMAMLANDI").length;
    const aktif = beklemede + devam;
    return { total, beklemede, devam, tamam, aktif };
  }, [scopedTasks]);

  const adminPerf = useMemo(() => {
    const names = ["Mehmet", "Ayşe", "Fatma"];
    const values = [
      scopedTasks.filter((t) => t.assignee.includes("Mehmet") && t.status === "TAMAMLANDI").length,
      scopedTasks.filter((t) => t.assignee.includes("Ayşe") && t.status === "TAMAMLANDI").length,
      scopedTasks.filter((t) => t.assignee.includes("Fatma") && t.status === "TAMAMLANDI").length,
    ];
    return { names, values };
  }, [scopedTasks]);

  const employeePerf = useMemo(() => {
    const labels = ["H1", "H2", "H3", "H4"];
    const values = [1, 2, 1, 3];
    return { labels, values };
  }, []);

 const isEmployee = role === "employee";

  return (
    <ScrollView style={ui.page} contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 70, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
      <Text style={[base.h1, { color: colors.text }]}>
  {isEmployee ? "Özet" : "Raporlar"}
</Text>

<Text style={[base.h2, { color: colors.muted }]}>
  {isEmployee ? "Kişisel görev özetin" : "Görev istatistikleri ve analizler"}
</Text>
      <View style={{ height: 14 }} />

      {/* Top Stats */}
      <View style={styles.statsRow}>
        <StatCard icon="pulse-outline" label="TOPLAM" value={stats.total} accent="rgba(79,70,229,0.22)" ui={ui} colors={colors} isDark={isDark} />
        <StatCard icon="trending-up-outline" label="AKTİF" value={stats.aktif} accent="rgba(59,130,246,0.18)" ui={ui} colors={colors} isDark={isDark} />
        <StatCard icon="checkmark-circle-outline" label="BİTTİ" value={stats.tamam} accent="rgba(16,185,129,0.18)" ui={ui} colors={colors} isDark={isDark} />
      </View>

      <View style={{ height: 4 }} />

      {/* Filters */}
      <PremiumCard ui={ui} isDark={isDark}>
        <SectionHeader title="Filtreler" icon="funnel-outline" colors={colors} isDark={isDark} />

        <View style={{ height: 12 }} />

        <Text style={[styles.fieldLabel, { color: colors.muted }]}>TARİH ARALIĞI</Text>
        <View style={styles.row2}>
          <TouchableOpacity activeOpacity={0.85} style={[styles.inputBox, { borderColor: colors.border, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)" }]}>
            <Text style={[styles.inputText, { color: colors.text }]}>{dateFrom}</Text>
            <Ionicons name="calendar-outline" size={16} color={colors.iconMuted} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={[styles.inputBox, { borderColor: colors.border, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)" }]}>
            <Text style={[styles.inputText, { color: colors.text }]}>{dateTo}</Text>
            <Ionicons name="calendar-outline" size={16} color={colors.iconMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 12 }} />

        <Text style={[styles.fieldLabel, { color: colors.muted }]}>DURUM</Text>
        <TouchableOpacity activeOpacity={0.85} style={[styles.selectBox, { borderColor: colors.border, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)" }]}>
          <Text style={[styles.inputText, { color: colors.text }]}>{statusLabel}</Text>
        </TouchableOpacity>

        {role === "admin" && (
          <>
            <View style={{ height: 12 }} />
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>ÇALIŞAN</Text>
            <TouchableOpacity activeOpacity={0.85} style={[styles.selectBox, { borderColor: colors.border, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)" }]}>
              <Text style={[styles.inputText, { color: colors.text }]}>Tüm Çalışanlar</Text>
            </TouchableOpacity>
          </>
        )}
      </PremiumCard>

      {/* SQL Preview only admin */}
      {role === "admin" && (
        <PremiumCard ui={ui} isDark={isDark}>
          <SectionHeader
            title="SQL Query Preview"
            icon="code-slash-outline"
            colors={colors}
            isDark={isDark}
            right={
              <TouchableOpacity activeOpacity={0.85}>
                <Text style={[styles.linkText, { color: colors.primary }]}>Göster</Text>
              </TouchableOpacity>
            }
          />
          <View style={{ height: 10 }} />
          <Text style={[styles.mutedText, { color: colors.muted }]}>Seçilen filtreler backend&apos;de bu SQL sorgusu ile işlenir</Text>
        </PremiumCard>
      )}

      {/* Durum dağılımı */}
      <PremiumCard ui={ui} isDark={isDark}>
        <SectionHeader title="Durum Dağılımı" icon="pie-chart-outline" colors={colors} isDark={isDark} />
        <View style={{ height: 10 }} />
        <StatusPie beklemede={stats.beklemede} devam={stats.devam} tamam={stats.tamam} colors={colors} />
      </PremiumCard>

      {/* Performans */}
      <PremiumCard ui={ui} isDark={isDark}>
        <SectionHeader title={isEmployee ? "Kişisel Performans" : "Çalışan Performansı"} icon="bar-chart-outline" colors={colors} isDark={isDark} />
        <View style={{ height: 10 }} />

        {isEmployee ? (
          <>
            <Text style={[styles.mutedText, { color: colors.muted }]}>Son 4 haftada tamamlanan görevler</Text>
            <View style={{ height: 10 }} />
            <SimpleBarChart labels={employeePerf.labels} values={employeePerf.values} colors={colors} isDark={isDark} />
          </>
        ) : (
          <>
            <Text style={[styles.mutedText, { color: colors.muted }]}>Tamamlanan görevlere göre kıyas</Text>
            <View style={{ height: 10 }} />
            <SimpleBarChart labels={adminPerf.names} values={adminPerf.values} colors={colors} isDark={isDark} />
          </>
        )}
      </PremiumCard>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: "row", gap: 10 },

  statCard: { flex: 1, padding: 12 },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: { fontSize: 22, fontWeight: "900" },
  statLabel: { fontSize: 11, fontWeight: "900", marginTop: 2, opacity: 0.9 },

  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardHeaderIcon: {
    width: 30,
    height: 30,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 14, fontWeight: "900" },

  fieldLabel: { fontSize: 11, fontWeight: "900" },
  row2: { flexDirection: "row", gap: 10, marginTop: 8 },
  inputBox: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectBox: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: 8,
  },
  inputText: { fontSize: 13, fontWeight: "800" },

  mutedText: { fontSize: 12, fontWeight: "700", lineHeight: 18 },
  linkText: { fontWeight: "900" },

  // Pie
  pieWrap: { alignItems: "center", justifyContent: "center" },
  pieLegend: { marginTop: 8, gap: 6, alignItems: "center" },
  pieLegendText: { fontSize: 12, fontWeight: "900" },

  // Bar chart
  chartArea: {
    height: 150,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  barCol: { width: 54, alignItems: "center", justifyContent: "flex-end" },
  bar: { width: 44, borderRadius: 12 },
  barLabel: { fontSize: 11, fontWeight: "800", marginTop: 8 },
});
