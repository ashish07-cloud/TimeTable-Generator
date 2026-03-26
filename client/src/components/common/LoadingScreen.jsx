import React from 'react';
import { Zap } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-black transition-colors duration-500">
      <div className="relative flex items-center justify-center">
        {/* Outer Rotating Ring */}
        <div className="w-20 h-20 border-4 border-gray-100 dark:border-gray-800 rounded-full"></div>
        
        {/* Inner Spinning Gradient Ring */}
        <div className="absolute w-20 h-20 border-4 border-t-green-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        
        {/* Pulsing Core Icon */}
        <div className="absolute flex items-center justify-center bg-gradient-to-br from-green-500 to-green-700 w-12 h-12 rounded-2xl shadow-lg shadow-green-500/40 animate-pulse">
          <Zap className="text-white fill-white" size={24} />
        </div>
      </div>

      {/* Branded Loading Text */}
      <div className="mt-8 text-center">
        <h2 className="text-xl font-bold tracking-tighter text-gray-900 dark:text-white">
          SmartTable <span className="text-green-500">AI</span>
        </h2>
        <div className="flex items-center gap-1 mt-2 justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-bounce"></span>
        </div>
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mt-4">
          Initializing Engine
        </p>
      </div>

      {/* Background Decorative Blur (Subtle) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/10 dark:bg-green-500/5 blur-[100px] rounded-full pointer-events-none"></div>
    </div>
  );
};

export default LoadingScreen;