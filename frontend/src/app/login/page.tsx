'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../../lib/api';
import { useAuth } from '../../lib/auth/AuthContext';
import { UserRole } from '../../lib/types';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@water.gov');
  const [password, setPassword] = useState('AdminPassword123!');
  const [role, setRole] = useState<UserRole>('Admin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const res = await authApi.login(email, password);
    setLoading(false);

    if (res.success && res.data) {
      login(res.data.token, res.data.admin.name, res.data.admin.mail, role);
      if (role === 'Driver') {
        router.push('/driver-dashboard');
      } else if (role === 'DistrictManager') {
        router.push('/district-manager-dashboard');
      } else {
        router.push('/dashboard');
      }
    } else {
      setErrorMsg(res.error?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#2C5745] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#EBE3A7_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#e2dab0] p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#EB7D00] text-3xl text-white font-bold shadow-lg mb-3">
            💧
          </div>
          <h1 className="text-2xl font-extrabold text-[#2E2910] tracking-tight">
            MUNICIPAL WATER CONTROL
          </h1>
          <p className="text-xs text-[#58512b] font-medium mt-1">
            District Water-Tanker Supply Management Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#2E2910] uppercase tracking-wider mb-1.5">
              Select Operating Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#e2dab0] bg-[#f7f4d9] text-[#2E2910] font-semibold text-sm focus:ring-2 focus:ring-[#2C5745] outline-none"
            >
              <option value="Admin">Admin / Municipality Operator</option>
              <option value="Driver">Tanker Driver</option>
              <option value="DistrictManager">District Manager / Representative</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2E2910] uppercase tracking-wider mb-1.5">
              Official Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#e2dab0] text-sm font-medium focus:ring-2 focus:ring-[#2C5745] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2E2910] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#e2dab0] text-sm font-medium focus:ring-2 focus:ring-[#2C5745] outline-none"
              required
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2C5745] hover:bg-[#3d725c] text-white font-bold text-sm rounded-lg shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Operations Portal'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#e2dab0] text-center text-xs text-[#857c4c]">
          <p className="font-semibold text-[#2E2910]">Default System Credentials:</p>
          <p className="font-mono text-[11px] mt-1">
            admin@water.gov • AdminPassword123!
          </p>
        </div>
      </div>
    </div>
  );
}
