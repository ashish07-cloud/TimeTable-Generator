// client/src/components/common/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { Zap, ArrowRight, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`border-b transition-colors duration-300 ${isDark ? 'bg-black border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 'bg-gradient-to-br from-orange-500 to-orange-700'}`}>
              <Zap size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              AcadiaPlan
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/features" className={`hover:text-orange-400 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Features</Link>
            <Link to="/how-it-works" className={`hover:text-orange-400 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>How It Works</Link>
            <Link to="/pricing" className={`hover:text-orange-400 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Pricing</Link>
            <Link to="/contact" className={`hover:text-orange-400 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Contact</Link>
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-orange-500'}`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <>
                <span className="text-sm text-gray-700 dark:text-gray-200">Hi, {user.username}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md text-sm text-white bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={`px-4 py-2 transition-colors ${isDark ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700'}`}>Login</Link>
                <Link
                  to="/register"
                  className={`font-semibold py-2 px-6 rounded-lg transition-all duration-300 flex items-center gap-2 ${isDark ? 'bg-gradient-to-r from-orange-500 to-orange-700 text-black hover:from-orange-400 hover:to-orange-600' : 'bg-gradient-to-r from-orange-500 to-orange-700 text-white hover:from-orange-600 hover:to-orange-800'}`}
                >
                  Get Started <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-orange-500'}`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={isDark ? 'text-white' : 'text-gray-900'} aria-label="Toggle menu">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={`md:hidden mt-4 pb-4 border-t pt-4 transition-colors ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex flex-col space-y-4">
              <Link to="/features" className={`hover:text-orange-400 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`} onClick={() => setIsMenuOpen(false)}>Features</Link>
              <Link to="/how-it-works" className={`hover:text-orange-400 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`} onClick={() => setIsMenuOpen(false)}>How It Works</Link>
              <Link to="/pricing" className={`hover:text-orange-400 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`} onClick={() => setIsMenuOpen(false)}>Pricing</Link>
              <Link to="/contact" className={`hover:text-orange-400 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'}`} onClick={() => setIsMenuOpen(false)}>Contact</Link>

              <div className="flex flex-col space-y-2 pt-4">
                {user ? (
                  <>
                    <div className="text-sm text-gray-700 dark:text-gray-200">Hi, {user.username}</div>
                    <button onClick={() => { setIsMenuOpen(false); handleLogout(); }} className="py-2 text-left text-orange-600 dark:text-orange-400">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className={`py-2 text-left ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Login</Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className={`font-semibold py-2 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${isDark ? 'bg-gradient-to-r from-orange-500 to-orange-700 text-black hover:from-orange-400 hover:to-orange-600' : 'bg-gradient-to-r from-orange-500 to-orange-700 text-white hover:from-orange-600 hover:to-orange-800'}`}
                    >
                      Get Started <ArrowRight size={16} />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;