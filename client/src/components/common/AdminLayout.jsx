import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  Home,
  Calendar,
  Users,
  Settings,
  LogOut,
  Plus,
  BarChart2,
  Wrench,
  ChevronRight,
  FileText,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get current page title from navItems
  const currentPage = navItems.find((item) => isActive(item.path))?.label || "Admin";

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <div className="flex">
        {/* Sidebar - Fixed */}
        <aside className="w-64 fixed inset-y-0 left-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-black flex flex-col transition-colors duration-300 z-20">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-xl font-semibold tracking-tight">
              <span className="bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
                AcadiaPlan
              </span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Admin Dashboard</p>
          </div>

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

          {/* User & Logout */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-semibold">
                {user?.username?.charAt(0) || "A"}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{user?.username || "Admin"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 w-full transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main Content Area - Offset by sidebar width */}
        <main className="flex-1 ml-64">
          {/* Sticky Top Bar */}
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h1 className="text-2xl font-semibold">{currentPage}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {user?.username || "Admin"}!
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button
                  onClick={() => navigate("/admin/generate")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  <Plus size={16} /> New Timetable
                </button>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}