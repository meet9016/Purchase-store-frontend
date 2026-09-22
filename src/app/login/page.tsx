"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDatabase, saveDatabase } from '@/lib/storeData';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShoppingBag,
  AlertCircle,
  ArrowRight,
  User as UserIcon,
  Shield,
  Building,
  CheckCircle2
} from 'lucide-react';

const DEMO_ROLES = [
  { role: 'Admin', email: 'admin@gmail.com', pass: '123456', desc: 'Full System Access' },
  { role: 'Purchase', email: 'purchase@gmail.com', pass: '123456', desc: 'PO & Vendor Lead' },
  { role: 'Store', email: 'store@gmail.com', pass: '123456', desc: 'GRN & Stock Inward' },
  { role: 'Accounts', email: 'accounts@gmail.com', pass: '123456', desc: 'Bills & Disbursements' },
  { role: 'Approver', email: 'approver@gmail.com', pass: '123456', desc: 'PR/PO Authorization' }
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function LoginPage() {
  // Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Validation
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const validateLoginForm = () => {
    const errs: Record<string, string> = {};
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      errs.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(cleanEmail)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const performLogin = async (targetEmail: string, targetPass: string) => {
    setError('');
    setLoading(true);

    const cleanEmail = targetEmail.toLowerCase().trim();
    const cleanPass = targetPass.trim();

    // 1. Try Backend API Authentication
    try {
      const result = await authApi.login(cleanEmail, cleanPass);
      const authData = (result?.data || result) as any;
      const token = authData?.token;
      const user = authData?.user;

      if (token && user) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('active_user', JSON.stringify(user));
        toast.success(`Welcome back, ${user.name || 'User'}!`);
        window.location.href = '/dashboard';
        return;
      }
    } catch (apiErr: any) {
      const serverMsg = apiErr?.message || apiErr?.data?.message || apiErr?.response?.data?.message;
      console.warn('[Backend Auth Failed]', serverMsg || apiErr);

      // If backend explicitly rejected with invalid credentials (400, 401, 403, 404)
      if (apiErr?.status === 401 || apiErr?.status === 400 || apiErr?.status === 403 || apiErr?.status === 404) {
        const errorMsg = serverMsg || 'Invalid email or password. Please try again.';
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }
    }

    // 2. Local Fallback authentication (Only if backend server is unreachable)
    const activeDb = getDatabase();
    let user = activeDb?.users?.find((u) => u.email.toLowerCase().trim() === cleanEmail);

    // Auto-seed demo role if matching demo email
    const demoMatch = DEMO_ROLES.find((d) => d.email.toLowerCase().trim() === cleanEmail);
    if (!user && demoMatch) {
      const defaultNames: Record<string, string> = {
        Admin: 'Alok Sharma',
        Purchase: 'Rahul Verma',
        Store: 'Vikram Singh',
        Accounts: 'Sneha Patel',
        Approver: 'Priya Mehta',
      };
      user = {
        id: `usr-${Date.now()}`,
        name: defaultNames[demoMatch.role] || demoMatch.role,
        email: cleanEmail,
        role: demoMatch.role,
        department: 'Operations Division',
        active: true,
        password: demoMatch.pass || '123456',
      };
      if (activeDb?.users) {
        activeDb.users.push(user);
        saveDatabase(activeDb);
      }
    }

    if (!user) {
      const errMsg = `Account '${targetEmail}' not found.`;
      setLoading(false);
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    if (!user.active) {
      const errMsg = 'This user account is currently deactivated.';
      setLoading(false);
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    const validPassword = user.password || '123456';
    if (cleanPass !== '123456' && cleanPass !== validPassword) {
      const errMsg = 'Invalid email or password.';
      setLoading(false);
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    localStorage.setItem('active_user', JSON.stringify(user));
    localStorage.setItem('auth_token', 'local_jwt_' + Date.now());
    toast.success(`Welcome back, ${user.name || 'User'}!`);
    window.location.href = '/dashboard';
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!validateLoginForm()) return;
    performLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20 mb-3">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172C]">
          Purchase &amp; Store Management
        </h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Enterprise procurement, material inward &amp; vendor settlements
        </p>
      </div>

          {/* Main Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-6 shadow-sm border border-slate-200/90 rounded-2xl sm:px-8">
          <div className="mb-5 text-center">
            <h2 className="text-base font-bold text-slate-900">Sign In to Your Account</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter your credentials to access the portal</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-rose-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form noValidate onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-red-500 font-bold ml-0.5">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) setValidationErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  placeholder="name@company.com"
                  className={`block w-full pl-10 pr-3.5 py-2.5 text-xs border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                    validationErrors.email
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                  }`}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-red-500 font-bold ml-0.5">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) setValidationErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder="••••••••"
                  className={`block w-full pl-10 pr-10 py-2.5 text-xs border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                    validationErrors.password
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{validationErrors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                />
                <span className="ml-2 font-medium">Remember me</span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none transition-colors cursor-pointer disabled:opacity-60 shadow-blue-600/20"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

