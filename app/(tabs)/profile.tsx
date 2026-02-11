import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";

function PremiumCard({
  children,
  colors,
  isDark,
  padding = 14,
}: {
  children: React.ReactNode;
  colors: any;
  isDark: boolean;
  padding?: number;
}) {
  return (
    <View
      style={[
        styles.cardBase,
        {
          padding,
          backgroundColor: isDark ? colors.surface : colors.cardTop,
          borderColor: colors.border,
          ...(isDark
            ? {}
            : {
                shadowColor: colors.shadow,
                shadowOpacity: 0.10,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 10 },
                elevation: 6,
              }),
        },
      ]}
    >
      {/* light’ta alttan hafif gradient hissi */}
      {!isDark && <View pointerEvents="none" style={[styles.cardGlow, { backgroundColor: colors.cardBottom }]} />}
      {children}
    </View>
  );
}

function RowItem({
  icon,
  iconBg,
  title,
  subtitle,
  onPress,
  colors,
  chevronColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  colors: { text: string; muted: string };
  chevronColor: string;
}) {
  const content = (
    <View style={styles.rowItem}>
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color="#FFFFFF" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.rowSubtitle, { color: colors.muted }]}>{subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={chevronColor} />
    </View>
  );

  if (!onPress) return content;
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      {content}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { role, userName } = useAuth();
  const { colors, isDark, toggle } = useTheme();

  const user = useMemo(() => {
    if (role === "admin") {
      return {
        fullName: "Admin",
        badge: "YÖNETİCİ",
        email: "admin@gorevtakip.com",
        job: "Operasyon Müdürü",
      };
    }
    return {
      fullName: userName || "Mehmet Demir",
      badge: "ÇALIŞAN",
      email: "mehmet@gorevtakip.com",
      job: "Saha Çalışanı",
    };
  }, [role, userName]);

  const handleLogout = () => router.replace("/login");

  const chevronColor = colors.chevron;

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.h1, { color: colors.text }]}>
  {role === "admin" ? "Profil" : "Profil"}
</Text>

<Text style={[styles.h2, { color: colors.muted }]}>
  {role === "admin" ? "Uygulama ve hesap ayarları" : "Hesap bilgileri ve ayarlar"}
</Text>


      <View style={{ height: 14 }} />

      {/* Profile Card */}
      <PremiumCard colors={colors} isDark={isDark} padding={16}>
        <View style={styles.profileCardInner}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Ionicons name="person-outline" size={26} color="#FFFFFF" />
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: colors.text }]}>{user.fullName}</Text>

              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: colors.primarySoft,
                    borderColor: isDark ? "rgba(79,70,229,0.35)" : "rgba(79,70,229,0.28)",
                  },
                ]}
              >
                <Ionicons name="person-circle-outline" size={14} color="#C7D2FE" />
                <Text style={styles.badgeText}>{user.badge}</Text>
              </View>
            </View>

            <View style={{ height: 14 }} />

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: "rgba(59,130,246,0.22)" }]}>
                <Ionicons name="mail-outline" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: colors.muted }]}>E-POSTA</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{user.email}</Text>
              </View>
            </View>

            <View style={{ height: 12 }} />

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: "rgba(16,185,129,0.22)" }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: colors.muted }]}>ROL</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{user.job}</Text>
              </View>
            </View>
          </View>
        </View>
      </PremiumCard>

      <View style={{ height: 18 }} />
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Ayarlar</Text>

      {/* Dark Mode */}
      <PremiumCard colors={colors} isDark={isDark} padding={14}>
        <View style={styles.rowItem}>
          <View style={[styles.rowIcon, { backgroundColor: isDark ? colors.surface2 : "rgba(15,23,42,0.08)" }]}>
            <Ionicons name="moon-outline" size={18} color={colors.text} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Dark Mode</Text>
            <Text style={[styles.rowSubtitle, { color: colors.muted }]}>Karanlık tema kullan</Text>
          </View>

          <Switch
            value={isDark}
            onValueChange={toggle}
            trackColor={{
              false: "rgba(15,23,42,0.18)",
              true: "rgba(79,70,229,0.55)",
            }}
            thumbColor={colors.white}
          />
        </View>
      </PremiumCard>

      {/* Other settings */}
      <View style={{ height: 12 }} />

      <PremiumCard colors={colors} isDark={isDark} padding={10}>
        <RowItem
          icon="person-outline"
          iconBg={isDark ? "rgba(79,70,229,0.22)" : "rgba(79,70,229,0.34)"}
          title="Hesap Bilgileri"
          subtitle="Profil bilgilerini düzenle"
          onPress={() => {}}
          colors={{ text: colors.text, muted: colors.muted }}
          chevronColor={chevronColor}
        />
        <View style={[styles.hairline, { backgroundColor: colors.hairline }]} />
        <RowItem
          icon="notifications-outline"
          iconBg={isDark ? "rgba(245,158,11,0.20)" : "rgba(245,158,11,0.30)"}
          title="Bildirim Ayarları"
          subtitle="Bildirim tercihlerini yönet"
          onPress={() => {}}
          colors={{ text: colors.text, muted: colors.muted }}
          chevronColor={chevronColor}
        />
        <View style={[styles.hairline, { backgroundColor: colors.hairline }]} />
        <RowItem
          icon="lock-closed-outline"
          iconBg={isDark ? "rgba(16,185,129,0.20)" : "rgba(16,185,129,0.30)"}
          title="Gizlilik ve Güvenlik"
          subtitle="Şifre ve güvenlik ayarları"
          onPress={() => {}}
          colors={{ text: colors.text, muted: colors.muted }}
          chevronColor={chevronColor}
        />
      </PremiumCard>

      {/* Logout */}
      <View style={{ height: 12 }} />
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.logoutBtn,
          {
            borderColor: colors.border,
            backgroundColor: isDark ? colors.surface2 : "rgba(15,23,42,0.06)",
          },
        ]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={18} color={colors.text} />
        <Text style={[styles.logoutText, { color: colors.text }]}>Çıkış Yap</Text>
      </TouchableOpacity>

      <View style={{ height: 12 }} />
      <Text style={[styles.footer, { color: isDark ? "rgba(255,255,255,0.42)" : "rgba(15,23,42,0.55)" }]}>
        Görev Takip v1.0.0
      </Text>
      <Text style={[styles.footer2, { color: isDark ? "rgba(255,255,255,0.30)" : "rgba(15,23,42,0.40)" }]}>
        © 2026 Tüm hakları saklıdır
      </Text>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  container: { paddingHorizontal: 18, paddingTop: 70, paddingBottom: 80 },

  h1: { fontSize: 26, fontWeight: "900" },
  h2: { fontSize: 13, marginTop: 6 },

  cardBase: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardGlow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
    opacity: 0.9,
  },

  profileCardInner: { flexDirection: "row", gap: 14 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  nameRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  name: { fontSize: 18, fontWeight: "900" },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { color: "#C7D2FE", fontSize: 12, fontWeight: "900" },

  infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: { fontSize: 10, fontWeight: "900" },
  infoValue: { fontSize: 13, fontWeight: "900", marginTop: 2 },

  sectionTitle: { fontSize: 14, fontWeight: "900", marginBottom: 10 },

  rowItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 4 },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { fontSize: 14, fontWeight: "900" },
  rowSubtitle: { fontSize: 12, fontWeight: "700", marginTop: 2 },

  hairline: { height: 1, opacity: 1 },

  logoutBtn: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  logoutText: { fontSize: 14, fontWeight: "900" },

  footer: { textAlign: "center", fontWeight: "800", fontSize: 12 },
  footer2: { textAlign: "center", fontWeight: "700", fontSize: 12, marginTop: 4 },
});
