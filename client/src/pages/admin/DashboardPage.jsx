import React, { useState } from 'react';
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
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [dark, setDark] = useState(false);

  const stats = [
    { id: 1, label: 'Total Courses', value: 42 },
    { id: 2, label: 'Classrooms', value: 18 },
    { id: 3, label: 'Generated Timetables', value: 124 },
    { id: 4, label: 'Pending Requests', value: 3 },
  ];

  const recent = [
    { id: 'TT-001', name: 'CS 2nd Year - Sem 4', created: '2025-09-28', status: 'Active' },
    { id: 'TT-002', name: 'EE 3rd Year - Sem 5', created: '2025-09-26', status: 'Pending' },
    { id: 'TT-003', name: 'ME 1st Year - Sem 1', created: '2025-09-22', status: 'Active' },
  ];

  return (
    // `dark` class on the top wrapper enables Tailwind's dark: variants (set darkMode: 'class' in tailwind.config.js)
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-gradient-to-r from-green-500 to-green-700 text-white px-3 py-2 font-semibold shadow-sm">Smart Timetable</div>
              <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Overview & management</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDark(!dark)}
                aria-label="toggle theme"
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-700 text-white shadow hover:opacity-95">
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
                    <li className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                      <Home size={16} />
                      <span className="text-sm font-medium">Dashboard</span>
                    </li>
                    <li className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                      <Calendar size={16} />
                      <span className="text-sm font-medium">Timetables</span>
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

                <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-2">Quick Actions</h3>
                  <div className="flex flex-col gap-2">
                    <button className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-700 text-white">Generate</button>
                    <button className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">Import CSV</button>
                    <button className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">Manage Rooms</button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <main className="col-span-12 md:col-span-9 lg:col-span-10 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-lg p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{s.label}</div>
                        <div className="text-2xl font-bold mt-1">{s.value}</div>
                      </div>
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-green-500 to-green-700 text-white">
                        <FileText size={18} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts + Recent items */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-lg p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Usage Overview</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Last 30 days</div>
                  </div>

                  {/* Simple placeholder chart (SVG) */}
                  <div className="h-40 w-full bg-gradient-to-r from-green-50 to-white dark:from-transparent dark:to-transparent rounded-md flex items-center justify-center">
                    <svg width="90%" height="110" viewBox="0 0 600 110" preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="4"
                        points="0,80 60,60 120,40 180,50 240,30 300,20 360,40 420,35 480,25 540,30 600,10"
                      />
                    </svg>
                  </div>

                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">Quick summary: generation success rate 98% · average runtime 4.2s</div>
                </div>

                <div className="rounded-lg p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
                  <h3 className="text-lg font-medium mb-3">Recent Timetables</h3>
                  <ul className="space-y-3">
                    {recent.map((r) => (
                      <li key={r.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{r.name}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">{r.id} · {r.created}</div>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs ${r.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                            {r.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-lg p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Recent Actions</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Showing latest 10</div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">ID</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Name</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Created</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Owner</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {recent.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                          <td className="px-4 py-3 text-sm">{r.id}</td>
                          <td className="px-4 py-3 text-sm">{r.name}</td>
                          <td className="px-4 py-3 text-sm">{r.created}</td>
                          <td className="px-4 py-3 text-sm">Admin</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${r.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>{r.status}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <button className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r from-green-500 to-green-700 text-white">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

             
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
