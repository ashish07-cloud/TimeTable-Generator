import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";

const AdminLayout = () => {
  const location = useLocation();

  const nav = [
    { name: "Dashboard", path: "/admin" },
    { name: "Setup", path: "/admin/setup" },
  ];

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-white text-gray-900">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col">
        
        {/* Logo / Brand */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-xl font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
              AcadiaPlan
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Academic Scheduler
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item) => {
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                  
                  ${
                    active
                      ? "bg-green-50 text-green-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer (future user/profile area) */}
        <div className="px-4 py-4 border-t border-gray-200 text-xs text-gray-500">
          © {new Date().getFullYear()} AcadiaPlan
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;