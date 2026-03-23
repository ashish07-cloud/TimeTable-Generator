import React, { useState } from "react";
import {
  Sun,
  Moon,
  Home,
  Calendar,
  Users,
  Settings,
  LogOut,
  Plus,
  FileText,
  BarChart2,
} from "lucide-react";

import { Routes, Route, useNavigate } from "react-router-dom";
import GenerateTimetable from "./GenerateTimetable";

export default function AdminDashboardPage() {
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();

  const stats = [
    { id: 1, label: "Total Courses", value: 42 },
    { id: 2, label: "Classrooms", value: 18 },
    { id: 3, label: "Generated Timetables", value: 124 },
    { id: 4, label: "Pending Requests", value: 3 },
  ];

  const recent = [
    {
      id: "TT-001",
      name: "CS 2nd Year - Sem 4",
      created: "2025-09-28",
      status: "Active",
    },
    {
      id: "TT-002",
      name: "EE 3rd Year - Sem 5",
      created: "2025-09-26",
      status: "Pending",
    },
    {
      id: "TT-003",
      name: "ME 1st Year - Sem 1",
      created: "2025-09-22",
      status: "Active",
    },
  ];

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-gradient-to-r from-green-500 to-green-700 text-white px-3 py-2 font-semibold shadow-sm">
                Smart Timetable
              </div>
              <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Overview & management
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDark(!dark)}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button
                onClick={() => navigate("/admin/generate")}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-700 text-white shadow"
              >
                <Plus size={16} /> New Timetable
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar */}
            <aside className="col-span-12 md:col-span-3 lg:col-span-2">
              <div className="sticky top-6 space-y-4">
                <nav className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <ul className="space-y-2">
                    <li
                      onClick={() => navigate("/admin")}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                    >
                      <Home size={16} />
                      <span className="text-sm font-medium">Dashboard</span>
                    </li>

                    <li
                      onClick={() => navigate("/admin/generate")}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                    >
                      <Calendar size={16} />
                      <span className="text-sm font-medium">
                        Generate Timetable
                      </span>
                    </li>

                    <li className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                      <Users size={16} />
                      <span className="text-sm font-medium">Users</span>
                    </li>

                    <li className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                      <BarChart2 size={16} />
                      <span className="text-sm font-medium">Reports</span>
                    </li>

                    <li className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                      <Settings size={16} />
                      <span className="text-sm font-medium">Settings</span>
                    </li>

                    <li className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                      <LogOut size={16} />
                      <span className="text-sm font-medium">Sign out</span>
                    </li>
                  </ul>
                </nav>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-2">Quick Actions</h3>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => navigate("/admin/generate")}
                      className="w-full px-3 py-2 rounded-lg bg-green-600 text-white"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main content with ROUTING */}
            <main className="col-span-12 md:col-span-9 lg:col-span-10">
              <Routes>
                {/* Dashboard Home */}
                <Route
                  index
                  element={
                    <>
                      {/* Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((s) => (
                          <div
                            key={s.id}
                            className="rounded-lg p-4 border bg-white dark:bg-gray-800"
                          >
                            <div className="text-sm">{s.label}</div>
                            <div className="text-2xl font-bold">{s.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Recent */}
                      <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-3">
                          Recent Timetables
                        </h3>
                        <ul>
                          {recent.map((r) => (
                            <li key={r.id}>{r.name}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  }
                />

                {/* Generate Page */}
                <Route path="generate" element={<GenerateTimetable />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
