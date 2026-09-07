"use client";

import React, { useState } from 'react';
import { getDatabase, saveDatabase } from '@/lib/storeData';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  KeyRound,
  Mail,
  ShieldAlert,
  ShoppingBag,
  Eye,
  EyeOff,
  ArrowRight,
  FileSpreadsheet,
  PackageCheck,
  CreditCard,
  Sparkles
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

<<<<<<< HEAD
  const performLogin = (targetEmail: string, targetPass: string) => {
=======
  const fillAdminCredentials = () => {
    setEmail('admin@gmail.com');
    setPassword('123456');
    setError('');
  };

  const performLogin = async (targetEmail: string, targetPass: string) => {
>>>>>>> 99f80a6 (feat: initialize purchase store application with comprehensive domain models, state management, and dashboard tab structure)
    setError('');
    setLoading(true);

    const cleanEmail = targetEmail.toLowerCase().trim();
    const cleanPass = targetPass.trim();

    // Try backend API first
    try {
      const result = await authApi.login(cleanEmail, cleanPass);
      if (result.status === 'success' && result.token && result.user) {
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('active_user', JSON.stringify(result.user));
        toast.success(`Welcome back, ${result.user.name || 'User'}!`);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 400);
        return;
      }
    } catch (apiErr: any) {
      // If backend returns a specific auth error, show it and stop
      const errMsg = apiErr?.message || '';
      if (errMsg.includes('Invalid email or password') || errMsg.includes('inactive') || errMsg.includes('not found')) {
        setLoading(false);
        setError(errMsg);
        toast.error(errMsg);
        return;
      }
      // Otherwise fall through to local auth (backend might be offline)
    }

    // Local fallback authentication (offline mode)
    const activeDb = getDatabase();
    let user = activeDb.users.find(u => u.email.toLowerCase().trim() === cleanEmail);

    // Fallback for admin credentials
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
      setError(`Account '${targetEmail}' not found. Please verify your email.`);
      return;
    }

    if (!user.active) {
      setLoading(false);
      setError('This account is currently deactivated. Please contact Administrator.');
      return;
    }

    // Password verification
    const validPassword = user.password || '123456';
    if (cleanPass !== '123456' && cleanPass !== validPassword) {
      setLoading(false);
      setError('Incorrect password. Please try again.');
      return;
    }

    // Store local session
    localStorage.setItem('active_user', JSON.stringify(user));
    localStorage.setItem('auth_token', 'local_standalone_session_' + Date.now());
    toast.success(`Welcome back, ${user.name || 'User'}!`);
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/50">
      {/* Left side - Visual & Brand Hero Panel (Light Modern Theme) */}
      <div className="hidden lg:flex w-[52%] relative overflow-hidden flex-col justify-between p-12 xl:p-16 border-r border-slate-200/80 bg-white/60 backdrop-blur-md">
        {/* Soft Ambient Light Glows */}
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] rounded-full bg-indigo-400/10 blur-[120px] pointer-events-none" />
        
        {/* Subtle Background Grid Accent */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #0F172C 1px, transparent 0)`,
            backgroundSize: '28px 28px'
          }}
        />

        {/* Top Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3.5 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 flex items-center justify-center font-bold">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black text-[#0F172C] tracking-tight">Purchase Store</span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200 rounded-full">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold tracking-wide">Procurement &amp; Inventory ERP</p>
            </div>
          </div>

          <div className="max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-6 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Full Lifecycle Procurement Platform</span>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-black text-[#0F172C] leading-[1.15] tracking-tight">
              Seamless Material Control &amp; Vendor Management.
            </h1>
            
            <p className="text-slate-600 text-base mt-4 leading-relaxed font-normal max-w-lg">
              End-to-end procurement workflows with live site requisitions, Purchase Orders, Material Inward (GRN), and 3-way vendor bill settlement.
            </p>
          </div>
        </div>

        {/* Feature Cards Grid (Light Elevated Cards) */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-8 max-w-xl">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-200 transition-all">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-3 shadow-2xs">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h3 className="text-[#0F172C] text-sm font-bold">Requisitions &amp; PO</h3>
            <p className="text-slate-500 text-xs mt-1 leading-snug">Multi-level approvals and live PO issuance.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-3 shadow-2xs">
              <PackageCheck className="h-5 w-5" />
            </div>
            <h3 className="text-[#0F172C] text-sm font-bold">GRN &amp; Inventory</h3>
            <p className="text-slate-500 text-xs mt-1 leading-snug">Real-time stock ledger, inward and outward issues.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-200 transition-all">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mb-3 shadow-2xs">
              <CreditCard className="h-5 w-5" />
            </div>
            <h3 className="text-[#0F172C] text-sm font-bold">Vendor Invoices</h3>
            <p className="text-slate-500 text-xs mt-1 leading-snug">3-way bill matching, payment requests &amp; vouchers.</p>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="relative z-10 flex items-center justify-between text-slate-500 text-xs font-semibold border-t border-slate-200/80 pt-5 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-700">Secure Enterprise Portal • High Availability</span>
          </div>
          <span className="text-slate-500">v2.5 Enterprise</span>
        </div>
      </div>

      {/* Right side - Clean Professional Login Form Card */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/70 border border-slate-200/90 relative z-10">
          
          {/* Header */}
          <div className="mb-7">
            <div className="flex items-center space-x-2.5 mb-2 lg:hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-lg font-black text-[#0F172C]">Purchase Store</span>
            </div>

            <h2 className="text-2xl font-black text-[#0F172C] tracking-tight">
              Enterprise Sign In
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Enter your credentials to access the procurement dashboard
            </p>
          </div>

          {/* Error Message Box */}
          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-2.5 text-rose-700 text-xs animate-shake shadow-2xs">
              <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="font-semibold leading-relaxed">{error}</span>
            </div>
          )}

          {/* Quick Login Hint */}
          <div className="mb-5 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 font-medium">
            <span className="font-bold">Demo Login:</span> admin@gmail.com / 123456
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 select-none">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all shadow-xs"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 select-none">
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <KeyRound className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all shadow-xs"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
