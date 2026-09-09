"use client";

import React, { useState } from 'react';
import { getDatabase, saveDatabase } from '@/lib/storeData';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  UserCheck
} from 'lucide-react';

const QUICK_ROLES = [
  { role: 'Admin', email: 'admin@gmail.com', name: 'Alok Sharma', desc: 'Full Access' },
  { role: 'Site Engineer', email: 'vikram@company.com', name: 'Vikram Patel', desc: 'Requisitions (PR)' },
  { role: 'Purchase Manager', email: 'priya@company.com', name: 'Priya Sharma', desc: 'POs & Quotations' },
  { role: 'Store Keeper', email: 'rajesh@company.com', name: 'Rajesh Kumar', desc: 'GRN & Stock Inward' },
  { role: 'Accountant', email: 'amit@company.com', name: 'Amit Verma', desc: 'Bills & Payments' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectRole = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('123456');
    setError('');
  };

  const performLogin = async (targetEmail: string, targetPass: string) => {
    setError('');
    setLoading(true);

    const cleanEmail = targetEmail.toLowerCase().trim();
    const cleanPass = targetPass.trim();

    // 1. Try Backend API first
    try {
      const result = await authApi.login(cleanEmail, cleanPass);
      const authData = (result.data || result) as any;
      const token = authData?.token;
      const user = authData?.user;

      if ((result.status === 200 || result.status === 'success') && token && user) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('active_user', JSON.stringify(user));
        toast.success(`Welcome back, ${user.name || 'User'}!`);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 300);
        return;
      }
    } catch (apiErr: any) {
      const errMsg = apiErr?.message || '';
      if (errMsg.includes('Invalid email or password') || errMsg.includes('inactive') || errMsg.includes('not found')) {
        setLoading(false);
        setError(errMsg);
        toast.error(errMsg);
        return;
      }
    }

    // 2. Local Fallback authentication
    const activeDb = getDatabase();
    let user = activeDb.users.find(u => u.email.toLowerCase().trim() === cleanEmail);

    if (!user && (cleanEmail === 'admin@gmail.com' || cleanEmail === 'admin')) {
      user = {
        id: 'usr-admin',
        name: 'Alok Sharma',
        email: 'admin@gmail.com',
        role: 'Admin',
        department: 'Executive Management',
        active: true,
        password: '123456'
      };
      activeDb.users.unshift(user);
      saveDatabase(activeDb);
    }

    if (!user) {
      setLoading(false);
      setError(`User with email '${targetEmail}' not found. Check demo accounts below.`);
      return;
    }

    if (!user.active) {
      setLoading(false);
      setError('This staff account is currently deactivated.');
      return;
    }

    const validPassword = user.password || '123456';
    if (cleanPass !== '123456' && cleanPass !== validPassword) {
      setLoading(false);
      setError('Incorrect password. Default password is: 123456');
      return;
    }

    localStorage.setItem('active_user', JSON.stringify(user));
    localStorage.setItem('auth_token', 'local_session_' + Date.now());
    toast.success(`Welcome back, ${user.name || 'User'}!`);
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Brand Info */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white shadow-sm mb-3">
          <Building2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Purchase &amp; Store Management
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Sign in to access your procurement portal
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 sm:rounded-xl sm:px-10">
          
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 accent-slate-900"
                />
                <span className="ml-2 font-medium">Remember me</span>
              </label>

              <span className="text-slate-500 font-medium text-[11px]">
                Default password: <span className="font-mono font-semibold text-slate-700">123456</span>
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Staff Logins */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Quick Select Demo Role:</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_ROLES.map((item) => {
                const isSelected = email === item.email;
                return (
                  <button
                    key={item.email}
                    type="button"
                    onClick={() => selectRole(item.email)}
                    className={`text-left p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 text-slate-900 font-medium ring-1 ring-slate-900'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-slate-900 flex items-center justify-between">
                      <span>{item.role}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{item.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Purchase Store ERP • Enterprise Edition</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
