import { Link, useNavigate, useLocation } from "react-router-dom";
import { Zap, ArrowRight, Menu, X, Sun, Moon, Plus, LogOut, User } from 'lucide-react';
import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 py-4 pointer-events-none">
      <header
        className={`
          pointer-events-auto
          transition-all duration-700 ease-out
          flex items-center justify-between
          ${scrolled 
            ? 'w-full max-w-6xl rounded-3xl py-3 px-6 shadow-2xl' 
            : 'w-full max-w-7xl rounded-3xl py-4 px-8'
          }
          ${isDark 
            ? 'bg-black/70 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]' 
            : 'bg-white/80 border-black/5 shadow-[0_15px_35px_rgba(0,0,0,0.1)]'
          }
          backdrop-blur-2xl border
          relative
        `}
        style={{
          transform: scrolled ? 'translateY(8px)' : 'translateY(0px)',
        }}
      >
        {/* Subtle top glow line */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-t-full" />
        
        {/* Soft radial glow behind the navbar (optional) */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-30 pointer-events-none" />

        {/* Logo Section */}
        <Link
          to="/"
          className="flex items-center space-x-3 group transition-transform active:scale-95"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="relative">
            {/* Enhanced glow on hover */}
            <div className="absolute inset-0 bg-orange-500 blur-xl opacity-30 group-hover:opacity-70 transition-all duration-500" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_8px_20px_rgba(249,115,22,0.5)] border border-white/30 transform group-hover:scale-105 transition-transform duration-300">
              <Zap size={22} className="text-white fill-white animate-pulse" />
            </div>
          </div>
          <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
            AcadiaPlan
          </span>
        </Link>

        {/* Desktop Navigation - Middle */}
        <nav className="hidden md:flex items-center bg-gray-500/5 dark:bg-white/5 px-2 py-1.5 rounded-full border border-black/5 dark:border-white/5 backdrop-blur-sm">
          {['Features', 'How It Works', 'Pricing', 'Contact'].map((item) => (
            <Link
              key={item}
              to={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
              className={`
                px-5 py-2 text-[13px] font-bold transition-all rounded-full
                ${isDark 
                  ? 'text-gray-300 hover:text-white hover:bg-white/10' 
                  : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                }
                hover:scale-105 active:scale-95
              `}
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`
              p-2.5 rounded-xl border transition-all active:scale-90 hover:scale-105
              ${isDark 
                ? 'bg-gray-800/80 border-white/10 text-yellow-400 shadow-inner hover:bg-gray-700' 
                : 'bg-orange-50/80 border-orange-100/50 text-orange-600 shadow-sm hover:bg-orange-100'
              }
            `}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div className="flex items-center gap-2 bg-gray-500/5 dark:bg-white/5 p-1 pr-3 rounded-2xl border border-black/5 dark:border-white/5 backdrop-blur-sm hover:shadow-md transition-shadow">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex flex-col -space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admin</span>
                <span className="text-sm font-bold dark:text-gray-200">{user.username}</span>
              </div>

              <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700 mx-2" />

              <button 
                onClick={handleLogout}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className={`px-4 py-2 text-sm font-bold transition-all rounded-xl hover:bg-gray-100/20 ${
                  isDark 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-700 hover:text-orange-600'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="group relative px-6 py-2.5 rounded-xl overflow-hidden shadow-[0_10px_20px_rgba(249,115,22,0.4)] transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-700 transition-transform group-hover:scale-110" />
                <span className="relative z-10 flex items-center gap-2 text-white text-sm font-bold">
                  Get Started <ArrowRight size={16} />
                </span>
              </Link>
            </div>
          )}
          
          {isAdminRoute && (
             <button
                onClick={() => navigate('/admin/generate')}
                className="bg-black dark:bg-white text-white dark:text-black p-2.5 rounded-xl shadow-xl hover:scale-110 transition-all active:scale-90"
             >
                <Plus size={20} />
             </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-gray-500/10 dark:bg-white/10 dark:text-white hover:bg-gray-500/20 transition-all"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-3 p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-3xl border border-black/5 dark:border-white/10 shadow-2xl animate-in slide-in-from-top-2 duration-300 md:hidden">
            <nav className="flex flex-col space-y-2">
              {['Features', 'How It Works', 'Pricing', 'Contact'].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="p-3 text-sm font-bold rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 dark:text-gray-200 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <hr className="my-2 border-gray-100 dark:border-gray-800" />
              {user ? (
                <button
                  onClick={handleLogout}
                  className="p-3 text-left text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/register"
                  className="p-3 bg-orange-500 text-white text-center rounded-xl font-bold hover:bg-orange-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}

export default Navbar;