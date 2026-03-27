// client/src/pages/public/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { login as apiLogin } from '../../api/authService';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  const { login: setAuthUser } = useAuth(); 
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await apiLogin(form);
      const { user, token } = res.data;
      if (user && token) {
        setAuthUser({ user, token });
        navigate('/admin/dashboard');
      } else {
        setErr(res.data.message || 'Login success but no user returned');
      }
    } catch (error) {
      setErr(error?.response?.data?.message || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative glowing blobs */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-orange-300/20 dark:bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-orange-400/20 dark:bg-orange-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo and brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg blur-md bg-orange-500/30 group-hover:bg-orange-500/50 transition-all duration-300" />
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center relative">
                <Zap size={28} className="text-white" />
              </div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              AcadiaPlan
            </span>
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mt-4">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Sign in to your account</p>
        </div>

        {/* Card with glassmorphism and gradient border */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-orange-700 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl">
            {err && (
              <div className="mb-4 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                {err}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <Input
                label="Email address"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                required
                className="bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:ring-orange-500"
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                required
                className="bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:ring-orange-500"
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-semibold py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in…
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              New to AcadiaPlan?{' '}
              <button
                onClick={() => navigate('/register')}
                className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
              >
                Create an account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}