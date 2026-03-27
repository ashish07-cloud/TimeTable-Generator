import React from "react";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Settings size={64} className="text-gray-400 mb-6" />
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        System Settings
      </h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md">
        This feature is coming soon. You'll be able to configure system-wide settings, email integrations, and preferences.
      </p>
    </div>
  );
}