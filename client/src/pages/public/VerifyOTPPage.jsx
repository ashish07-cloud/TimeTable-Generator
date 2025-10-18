// client/src/pages/public/VerifyOTPPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { verifyOtp } from '../../api/authService';

export default function VerifyOTPPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailFromQuery = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!emailFromQuery) {
      // if no email in query, go back to register
      // keep it friendly
    }
  }, [emailFromQuery]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      const res = await verifyOtp({ email, otp });
      setMsg(res.data.message || 'Verified');
      // redirect to login
      setTimeout(() => navigate('/login'), 900);
    } catch (error) {
      setErr(error?.response?.data?.message || error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Verify your Email</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">We sent an OTP to your email — enter it below.</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          {msg && <div className="mb-4 text-sm text-green-700 dark:text-green-300">{msg}</div>}
          {err && <div className="mb-4 text-sm text-red-600 dark:text-red-400">{err}</div>}

          <form onSubmit={onSubmit} className="space-y-4">
            <Input label="Email address" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="OTP" name="otp" value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" required />
            <div className="pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Verifying…' : 'Verify OTP'}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
            Didn't receive OTP? <button className="text-green-600 font-medium" onClick={() => navigate('/register')}>Resend / Register again</button>
          </div>
        </div>
      </div>
    </div>
  );
}
