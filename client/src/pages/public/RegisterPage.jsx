// client/src/pages/public/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { register } from "../../api/authService";
import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const { login: setAuthUser } = useAuth();
  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await register(form);

      const { user, token } = res.data;

      if (user && token) {
        setAuthUser({ user, token });
        navigate("/admin/dashboard");
      }
    } catch (error) {
      setErr(
        error?.response?.data?.message ||
          error.message ||
          "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Register — College Admin
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Enter details and verify your email with the OTP.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          {msg && (
            <div className="mb-4 text-sm text-green-700 dark:text-green-300">
              {msg}
            </div>
          )}
          {err && (
            <div className="mb-4 text-sm text-red-600 dark:text-red-400">
              {err}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Full name"
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder="Ashis Kumar"
              required
            />
            <Input
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="admin@college.edu"
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="Choose a strong password"
              required
            />

            <div className="pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Registering…" : "Register"}
              </Button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
            Already registered?{" "}
            <button
              className="text-green-600 font-medium"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
