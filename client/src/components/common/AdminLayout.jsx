// client/src/components/common/AdminLayout.jsx
import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Calendar,
  Users,
  Settings,
  BarChart2,
  Wrench,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import Navbar from "./Navbar"; // Import the new navbar

export default function AdminLayout() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: Home },
    { path: "/admin/setup/institution", label: "Setup", icon: Wrench },
    { path: "/admin/generate", label: "Generate Timetable", icon: Calendar },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/reports", label: "Reports", icon: BarChart2 },
    { path: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  // Get current page title
  const currentPage = navItems.find((item) => isActive(item.path))?.label || "Admin";

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Global Navbar */}
      <Navbar />

      <div className="flex">
        {/* Sidebar - Fixed */}
        <aside className="w-64 fixed top-[73px] bottom-0 left-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-black flex flex-col transition-colors duration-300 z-10">
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer (only decorative, no user info/logout) */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-500">
            <p>© {new Date().getFullYear()} AcadiaPlan</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </aside>

        {/* Main Content Area - Offset by sidebar width and top bar height */}
        <main className="flex-1 ml-64 mt-[73px]">
          {/* Page Content */}
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}