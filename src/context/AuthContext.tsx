import React, { createContext, useContext, useMemo, useState } from "react";

export type Role = "admin" | "employee";

type AuthContextType = {
  role: Role;
  setRole: (r: Role) => void;

  userName: string; // örn: "Mehmet Demir"
  setUserName: (n: string) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("employee");
  const [userName, setUserName] = useState<string>("Mehmet Demir");

  const value = useMemo(
    () => ({ role, setRole, userName, setUserName }),
    [role, userName]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
