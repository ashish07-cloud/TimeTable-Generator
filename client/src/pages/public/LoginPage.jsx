// client/src/pages/public/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
// 1. IMPORT the API service function and give it a unique name to avoid conflict
import { login as apiLogin } from '../../api/authService';

export default function LoginPage() {
  // 2. RENAME the context function for clarity
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
      // 3. CALL the API function you imported
      const res = await apiLogin(form);

      // Backend returns user object in res.data.user
      const user = res.data.user || null;

      if (user) {
        // 4. CALL the context function to set the user in global state
        setAuthUser(user);
        navigate('/admin/dashboard'); // change to your admin route
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
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Admin Login</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Login using your registered email & password.</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          {err && <div className="mb-4 text-sm text-red-600 dark:text-red-400">{err}</div>}

          <form onSubmit={onSubmit} className="space-y-4">
            <Input label="Email address" name="email" type="email" value={form.email} onChange={onChange} required />
            <Input label="Password" name="password" type="password" value={form.password} onChange={onChange} required />

            <div className="pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Logging in…' : 'Login'}
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
            New here? <button className="text-green-600 font-medium" onClick={() => navigate('/register')}>Register</button>
          </div>
        </div>
      </div>
    </div>
  );
}