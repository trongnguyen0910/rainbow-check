import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  { role: 'Admin',    username: 'admin',       password: 'Admin@123',   color: '#1E40AF' },
  { role: 'HR',       username: 'hr_manager',  password: 'Hr@123',      color: '#059669' },
  { role: 'Manager',  username: 'manager_eng', password: 'Manager@123', color: '#7C3AED' },
  { role: 'Employee', username: 'emp001',      password: 'Emp@123',     color: '#D97706' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.username, data.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc) => {
    setValue('username', acc.username);
    setValue('password', acc.password);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-indigo-600/20" />
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg">R</span>
            </div>
            <span className="text-white font-bold text-xl">Rainbow AMS</span>
          </div>
        </div>

        <div className="relative space-y-6">
          <h2 className="text-4xl font-black text-white leading-tight">
            Smart Attendance<br />
            <span className="text-gradient bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">
              Management
            </span>
          </h2>
          <p className="text-slate-300 text-base leading-relaxed max-w-sm">
            Track attendance, manage leave requests, generate reports — all in one beautiful enterprise dashboard.
          </p>
          <div className="flex gap-6">
            {[['15+', 'Employees'], ['99.9%', 'Uptime'], ['Real-time', 'Updates']].map(([v, l]) => (
              <div key={l}>
                <p className="text-white font-bold text-xl">{v}</p>
                <p className="text-slate-400 text-xs">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-slate-500 text-xs">© 2026 Rainbow Corporation. All rights reserved.</p>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold">R</span>
            </div>
            <span className="text-white font-bold text-lg">Rainbow AMS</span>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-white">Sign in</h1>
              <p className="text-slate-400 text-sm mt-1">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label text-slate-400">Username</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register('username', { required: 'Username is required' })}
                    className="input pl-10 bg-white/5 border-white/10 text-white placeholder-slate-500 focus:ring-primary-500 focus:border-transparent"
                    placeholder="your_username"
                    autoComplete="username"
                  />
                </div>
                {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
              </div>

              <div>
                <label className="label text-slate-400">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register('password', { required: 'Password is required' })}
                    type={showPw ? 'text' : 'password'}
                    className="input pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder-slate-500 focus:ring-primary-500"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn bg-primary-600 hover:bg-primary-700 text-white py-3 mt-2 disabled:opacity-60 focus:ring-primary-500"
              >
                {loading ? <span className="spinner border-white/30 border-t-white" /> : (
                  <> Sign in <ArrowRight size={16} /> </>
                )}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-7">
              <p className="text-slate-500 text-xs text-center mb-3">Demo accounts — click to fill</p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map(acc => (
                  <button
                    key={acc.role}
                    onClick={() => fillDemo(acc)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left"
                  >
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: acc.color }}>
                      {acc.role[0]}
                    </div>
                    <div>
                      <p className="text-white text-xs font-medium">{acc.role}</p>
                      <p className="text-slate-400 text-[10px]">{acc.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
