import React from "react";
import { Users } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Users size={64} className="text-gray-400 mb-6" />
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        User Management
      </h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md">
        This feature is coming soon. You'll be able to manage system users, roles, and permissions here.
      </p>
    </div>
  );
}