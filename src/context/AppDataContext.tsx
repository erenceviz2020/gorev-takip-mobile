import React, { createContext, useContext, useMemo, useState } from "react";

/** ---------------- Types ---------------- */

export type TaskStatus = "BEKLEMEDE" | "DEVAM" | "TAMAMLANDI";
export type Priority = "YÜKSEK" | "ORTA" | "DÜŞÜK";

export type TaskItem = {
  id: string;
  title: string;
  personFullName: string; // "Mehmet Demir"
  dateText: string;       // "12 Şub" (dashboard kısa tarih)
  dueISO: string;         // "2026-02-12"
  status: TaskStatus;
  priority: Priority;
  description: string;
  location: string;
  team: string;
  category: "Saha" | "Bakım" | "Depo" | "Operasyon";
};

export type NotifType = "ASSIGNED" | "STATUS" | "COMMENT";

export type NotificationItem = {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  dateText: string; // "Dün" / "8 Şub 2026"
  taskId?: string;
  userScope?: "admin" | "employee" | "all";
  assignee?: string; // "Mehmet Demir"
};

export const dateHelpers = {
  toISODate,
  formatShortTR,
  formatLongTR,
};

type AppDataContextType = {
  tasks: TaskItem[];
  notifications: NotificationItem[];
  addTask: (t: Omit<TaskItem, "id">) => void;
  updateTask: (id: string, patch: Partial<TaskItem>) => void;
};

/** ---------------- Context ---------------- */

const AppDataContext = createContext<AppDataContextType | null>(null);

/** ---------------- Date Helpers ---------------- */

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function monthTR(m: number) {
  const arr = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  return arr[m] ?? "Oca";
}

function formatShortTR(d: Date) {
  return `${d.getDate()} ${monthTR(d.getMonth())}`;
}

function formatLongTR(d: Date) {
  return `${d.getDate()} ${monthTR(d.getMonth())} ${d.getFullYear()}`;
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** ---------------- Mock Data ---------------- */

const INITIAL_TASKS: TaskItem[] = [
  {
    id: "1",
    title: "Depo Envanter Kontrolü",
    personFullName: "Mehmet Demir",
    dateText: "12 Şub",
    dueISO: "2026-02-12",
    status: "BEKLEMEDE",
    priority: "YÜKSEK",
    description: "Ana deponun envanter sayımı ve eksik malzemelerin tespiti",
    location: "Ana Depo",
    team: "Depo Ekibi",
    category: "Depo",
  },
  {
    id: "2",
    title: "Klima Bakımı - Ofis 3",
    personFullName: "Ayşe Kara",
    dateText: "10 Şub",
    dueISO: "2026-02-10",
    status: "DEVAM",
    priority: "ORTA",
    description: "Üçüncü kat ofis klimalarının periyodik bakımı",
    location: "3. Kat Ofis",
    team: "Bakım Ekibi",
    category: "Bakım",
  },
  {
    id: "3",
    title: "Saha Müşteri Ziyareti",
    personFullName: "Mehmet Demir",
    dateText: "9 Şub",
    dueISO: "2026-02-09",
    status: "TAMAMLANDI",
    priority: "DÜŞÜK",
    description: "Müşteri sahasında kontrol ve raporlama",
    location: "Saha",
    team: "Operasyon",
    category: "Saha",
  },
  {
    id: "4",
    title: "Elektrik Panosu Kontrolü",
    personFullName: "Fatma Şahin",
    dateText: "11 Şub",
    dueISO: "2026-02-11",
    status: "BEKLEMEDE",
    priority: "ORTA",
    description: "Elektrik panolarının güvenlik kontrolleri",
    location: "Atölye",
    team: "Bakım Ekibi",
    category: "Bakım",
  },
];

const INITIAL_NOTIFS: NotificationItem[] = [
  {
    id: "n1",
    type: "ASSIGNED",
    title: "Yeni Görev Atandı",
    message: 'Size "Depo Envanter Kontrolü" görevi atandı',
    dateText: "Dün",
    taskId: "1",
    userScope: "employee",
    assignee: "Mehmet Demir",
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
];

/** ---------------- Provider ---------------- */

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFS);

  const addTask: AppDataContextType["addTask"] = (t) => {
    const id = String(Date.now()); // demo id

    setTasks((prev) => [{ ...t, id }, ...prev]);

    const due = new Date(t.dueISO);
    const notif: NotificationItem = {
      id: `n_${Date.now()}`,
      type: "ASSIGNED",
      title: "Yeni Görev Atandı",
      message: `Size "${t.title}" görevi atandı`,
      dateText: formatLongTR(due),
      taskId: id,
      userScope: "employee",
      assignee: t.personFullName,
    };

    setNotifications((prev) => [notif, ...prev]);
  };

  const updateTask: AppDataContextType["updateTask"] = (id, patch) => {
    setTasks((prev) => prev.map((t) => (String(t.id) === String(id) ? { ...t, ...patch } : t)));
  };

  const value = useMemo<AppDataContextType>(
    () => ({
      tasks,
      notifications,
      addTask,
      updateTask,
    }),
    [tasks, notifications]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

/** ---------------- Hook ---------------- */

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}
