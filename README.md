# 📋 Görev Takip Uygulaması | Task Management Mobile App

Modern, rol bazlı ve tema destekli bir **mobil görev yönetim uygulaması**.  
Bu proje, **React Native + TypeScript** kullanılarak geliştirilmiştir ve gerçek hayattaki iş akışlarını simüle eder.

A modern **task management mobile application** built with **React Native and TypeScript**, designed to simulate real-world work processes with role-based access and theme support.

---

## 🇹🇷 Türkçe Açıklama

### 🎯 Projenin Amacı
Bu uygulama;
- Görevlerin yönetilmesi
- Çalışanlara görev atanması
- Görevlerin durumlarının takip edilmesi
- Kullanıcı rollerine göre farklı yetkiler sunulması  

amaçlarıyla geliştirilmiştir.

Proje, **modern mobil UI/UX**, **temiz kod mimarisi** ve **ölçeklenebilir yapı** göstermek için hazırlanmıştır.

---

### 👤 Kullanıcı Rolleri

#### 👑 Yönetici (Admin)
- Tüm görevleri görüntüleyebilir
- Yeni görev oluşturabilir
- Görevleri çalışanlara atayabilir
- Görev istatistiklerini dashboard üzerinden görebilir

#### 👨‍💼 Çalışan (Employee)
- Sadece kendisine atanmış görevleri görebilir
- Görev detaylarını inceleyebilir
- Bildirimleri takip edebilir

---

### 🌗 Tema Desteği
- Dark Mode & Light Mode
- Tema değişimi anlık olarak tüm ekranlara uygulanır
- iOS ve Android uyumludur

---

### 🧭 Uygulama Ekranları

#### 🏠 Dashboard
- Toplam görev sayısı
- Beklemede / Devam / Tamamlanan görevler
- Tamamlanma oranı
- Son görevler listesi
- Admin kullanıcılar için **“+” butonu** ile görev oluşturma

#### ✅ Görevler
- Görev listesi
- Arama özelliği
- Duruma göre filtreleme
- Öncelik göstergeleri (Yüksek / Orta / Düşük)

#### 🔔 Bildirimler
- Yeni görev atamaları
- Görev durumu değişiklikleri
- Bildirime tıklayınca detay sayfasına geçiş

#### 📄 Görev Detayı
- Görev başlığı
- Durum ve öncelik
- Açıklama
- Atanan kişi
- Lokasyon, ekip ve bitiş tarihi

---

### ➕ Görev Oluşturma (Admin)
Yönetici kullanıcılar;
- Görev başlığı
- Açıklama
- Çalışan seçimi
- Kategori seçimi (Saha, Bakım, Depo, Operasyon)
- Lokasyon
- Ekip
- Öncelik
- Bitiş tarihi  

bilgilerini girerek yeni görev oluşturabilir.

---

### 🛠️ Kullanılan Teknolojiler
- React Native
- Expo Router
- TypeScript
- Context API
- @expo/vector-icons
- @react-native-community/datetimepicker

---

## 🇬🇧 English Description

### 🎯 Project Purpose
This application is developed to:
- Manage tasks efficiently
- Assign tasks to employees
- Track task statuses
- Provide role-based access control  

The project demonstrates **modern mobile UI/UX**, **clean architecture**, and **scalable state management**.

---

### 👤 User Roles

#### 👑 Admin
- View all tasks
- Create new tasks
- Assign tasks to employees
- View task statistics on the dashboard

#### 👨‍💼 Employee
- View only assigned tasks
- See task details
- Receive notifications

---

### 🌗 Theme Support
- Dark Mode & Light Mode
- Theme changes apply instantly across the entire app
- Compatible with both iOS and Android

---

### 🧭 Application Screens

#### 🏠 Dashboard
- Total task count
- Pending / In Progress / Completed tasks
- Completion rate
- Recent tasks
- Admin-only **“+” button** for task creation

#### ✅ Tasks
- Task list
- Search functionality
- Status-based filtering
- Priority indicators (High / Medium / Low)

#### 🔔 Notifications
- Task assignment notifications
- Status update notifications
- Navigation to detail screen on tap

#### 📄 Task Detail
- Task title
- Status & priority badges
- Description
- Assigned employee
- Location, team, and due date

---

### ➕ Task Creation (Admin)
Admins can create tasks by selecting:
- Task title
- Description
- Employee
- Category (Field, Maintenance, Warehouse, Operations)
- Location
- Team
- Priority
- Due date

---

### 🛠️ Technologies Used
- React Native
- Expo Router
- TypeScript
- Context API (State Management)
- Vector Icons
- Date Picker

---

## ▶️ Installation & Run

```bash
git clone https://github.com/username/task-management-app.git
cd task-management-app
npm install
npx expo start
