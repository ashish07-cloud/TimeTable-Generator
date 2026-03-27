import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Users,
  Calendar,
  Clock,
  ChevronRight,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  // Mock stats – replace with actual data later
  const stats = [
    { id: 1, label: "Total Courses", value: 42, icon: FileText },
    { id: 2, label: "Classrooms", value: 18, icon: Users },
    { id: 3, label: "Generated Timetables", value: 124, icon: Calendar },
    { id: 4, label: "Pending Requests", value: 3, icon: Clock },
  ];

  const recent = [
    {
      id: "TT-001",
      name: "CS 2nd Year - Sem 4",
      created: "2025-09-28",
      status: "Active",
      statusColor:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    {
      id: "TT-002",
      name: "EE 3rd Year - Sem 5",
      created: "2025-09-26",
      status: "Pending",
      statusColor:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    {
      id: "TT-003",
      name: "ME 1st Year - Sem 1",
      created: "2025-09-22",
      status: "Active",
      statusColor:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
  ];

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <stat.icon size={24} className="text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Timetables */}
      <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Timetables</h2>
          <button
            onClick={() => navigate("/admin/generate")}
            className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1"
          >
            View all <ChevronRight size={16} />
          </button>
        </div>
        <div className="space-y-4">
          {recent.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <FileText size={18} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Created: {item.created}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${item.statusColor}`}
                >
                  {item.status}
                </span>
                <button className="text-gray-400 hover:text-orange-500">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}