// client/src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

// pages
import Home from "./pages/public/Home";
// import TimetableGenerator from './pages/public/TimetableGenerator';
import RegisterPage from "./pages/public/RegisterPage";
import VerifyOTPPage from "./pages/public/VerifyOTPPage";
import LoginPage from "./pages/public/LoginPage";
import RequireAuth from "./components/common/RequireAuth";
import Dashboard from "./pages/admin/DashboardPage";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col transition-colors duration-500">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              {/* <Route path="/timetable" element={<TimetableGenerator/>} /> */}

              {/* public auth pages */}
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-otp" element={<VerifyOTPPage />} />
              <Route path="/login" element={<LoginPage />} />

              <Route
                path="/admin/*"
                element={
                  <RequireAuth>
                    <Dashboard />{" "}
                    {/* ← Replace placeholder with your real DashboardPage */}
                  </RequireAuth>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
