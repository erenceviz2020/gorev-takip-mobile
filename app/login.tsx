import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../src/context/AuthContext";

export default function Login() {
  const router = useRouter();
  const { role, setRole, setUserName } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
  if (role === "admin") {
    router.replace("/dashboard");
  } else {
    router.replace("/tasks");
  }
};



  return (
    <LinearGradient
      colors={["#0B1220", "#0E1A2F", "#0B1220"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.inner}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Ionicons name="checkmark-circle-outline" size={44} color="#fff" />
          </View>
          <Text style={styles.title}>Görev Takip</Text>
          <Text style={styles.subtitle}>Kurumsal Görev Yönetimi</Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#A1A1AA" />
            <TextInput
              placeholder="E-posta adresiniz"
              placeholderTextColor="#A1A1AA"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#A1A1AA" />
            <TextInput
              placeholder="Şifreniz"
              placeholderTextColor="#A1A1AA"
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.button}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>

        {/* Demo Accounts */}
        <View style={styles.demoCard}>
          <Text style={styles.demoTitle}>💡 Demo Hesapları</Text>

          <View style={styles.demoRow}>
            <Text style={styles.demoLabel}>Yönetici:</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setRole("admin");
                setUserName("Admin");
                setEmail("admin@gorevtakip.com");
                setPassword("123456");
              }}
            >
              <Text style={styles.demoValue}>admin@gorevtakip.com</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.demoRow}>
            <Text style={styles.demoLabel}>Çalışan:</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setRole("employee");
                setUserName("Mehmet Demir");
                setEmail("mehmet@gorevtakip.com");
                setPassword("123456");
              }}
            >
              <Text style={styles.demoValue}>mehmet@gorevtakip.com</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          © 2026 Görev Takip. Tüm hakları saklıdır.
        </Text>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },

  header: { alignItems: "center", marginBottom: 28 },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: "800", color: "#FFFFFF" },
  subtitle: { fontSize: 14, color: "#9CA3AF", marginTop: 6 },

  card: {
    backgroundColor: "rgba(15, 27, 46, 0.9)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(0,0,0,0.12)",
    marginBottom: 12,
  },
  input: { flex: 1, marginLeft: 10, color: "#FFFFFF", fontSize: 15 },

  button: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },

  demoCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "rgba(15, 27, 46, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(79, 70, 229, 0.45)",
  },
  demoTitle: { color: "#C7D2FE", fontWeight: "700", marginBottom: 10 },
  demoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  demoLabel: { color: "#E5E7EB", fontWeight: "700" },
  demoValue: { color: "#E5E7EB" },

  footer: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 12,
    marginTop: 18,
  },
});
