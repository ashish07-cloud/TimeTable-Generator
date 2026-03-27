import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

// Components
import RequireAuth from "./components/common/RequireAuth";
import PublicLayout from "./components/common/PublicLayout";
import AdminLayout from "./components/common/AdminLayout";
import LoadingScreen from "./components/common/LoadingScreen";

// Public Pages
import Home from "./pages/public/Home";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";

// Admin Pages (Lazy)
const Dashboard = lazy(() => import("./pages/admin/DashboardPage"));
const OnboardingWizard = lazy(() => import("./pages/admin/OnboardingWizard"));
const GenerateTimetable = lazy(() => import("./pages/admin/GenerateTimetable"));
const TimetableEditor = lazy(() => import("./pages/admin/TimetableEditor"));

// 🔥 New Admin Pages
const UsersPage = lazy(() => import("./pages/admin/UsersPage"));
const ReportsPage = lazy(() => import("./pages/admin/ReportsPage"));
const SettingsPage = lazy(() => import("./pages/admin/SettingsPage"));

// 🔥 Setup Step Components
const InstitutionalConfig = lazy(() =>
  import("./components/admin/InstitutionalConfig")
);
const RoomManager = lazy(() => import("./components/admin/RoomManager"));
const SubjectManager = lazy(() => import("./components/admin/SubjectManager"));
const FacultyManager = lazy(() => import("./components/admin/FacultyManager"));
const EnrollmentManager = lazy(() =>
  import("./components/admin/EnrollmentManager")
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* PUBLIC DOMAIN */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* ADMIN DOMAIN */}
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              {/* Dashboard */}
              <Route index element={<Dashboard />} />

              {/* 🔥 SETUP SYSTEM */}
              <Route path="setup" element={<OnboardingWizard />}>
                <Route index element={<Navigate to="institution" replace />} />
                <Route path="institution" element={<InstitutionalConfig />} />
                <Route path="rooms" element={<RoomManager />} />
                <Route path="subjects" element={<SubjectManager />} />
                <Route path="faculty" element={<FacultyManager />} />
                <Route path="enrollment" element={<EnrollmentManager />} />
              </Route>

              {/* TIMETABLE */}
              <Route path="generate" element={<GenerateTimetable />} />
              <Route path="edit/:id" element={<TimetableEditor />} />

              {/* 🔥 NEW ADMIN PAGES */}
              <Route path="users" element={<UsersPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />

              {/* MANAGEMENT (future) – keeping these for now, but they might conflict with the setup routes */}
              <Route path="faculty" element={<div>Faculty Management</div>} />
              <Route path="rooms" element={<div>Room Management</div>} />
            </Route>

            {/* GLOBAL FALLBACK */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;