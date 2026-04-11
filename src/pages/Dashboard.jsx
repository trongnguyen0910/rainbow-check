import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, UserCheck, Clock, Umbrella, TrendingUp,
  CalendarCheck, ChevronRight, RefreshCw,
} from 'lucide-react';
import { getDashboardStats } from '../api/dashboard';
import StatCard from '../components/UI/StatCard';
import Badge from '../components/UI/Badge';
import Avatar from '../components/UI/Avatar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card shadow-modal p-3 text-xs">
      <p className="font-semibold text-slate-700 dark:text-white mb-2">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow]         = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDashboardStats();
      setStats(res.data.data);
    } catch {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const formatTime = (d) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (d) =>
    d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner border-primary-200 border-t-primary-600 w-8 h-8" />
      </div>
    );
  }

  const ov = stats?.overview || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">
            Good {now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="page-subtitle mt-1">{formatDate(now)}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="card px-4 py-2 text-center">
            <p className="text-xl font-bold text-primary-600 dark:text-primary-400 tabular-nums">{formatTime(now)}</p>
            <p className="text-xs text-slate-400">Local Time</p>
          </div>
          <button onClick={loadStats} className="btn-icon text-slate-500 hover:text-primary-600" title="Refresh">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}       label="Total Employees" value={ov.total_employees || 0}   color="blue"   sub="Active headcount" />
        <StatCard icon={UserCheck}   label="Present Today"   value={ov.present_today || 0}     color="green"  sub={`${ov.attendance_rate || 0}% attendance rate`} />
        <StatCard icon={Clock}       label="Late Arrivals"   value={ov.late_today || 0}         color="amber"  sub="Checked in after threshold" />
        <StatCard icon={Umbrella}    label="On Leave"        value={ov.on_leave || 0}           color="purple" sub={`${ov.pending_leaves || 0} pending requests`} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Weekly Trend */}
        <div className="xl:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white">Attendance Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Last 5 working days</p>
            </div>
            <TrendingUp size={18} className="text-primary-500" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats?.weekly_trend || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gLate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeOpacity={0.5} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="present" name="Present" stroke="#3B82F6" fill="url(#gPresent)" strokeWidth={2} dot={{ r: 3 }} />
              <Area type="monotone" dataKey="late" name="Late" stroke="#F59E0B" fill="url(#gLate)" strokeWidth={2} dot={{ r: 3 }} />
              <Area type="monotone" dataKey="absent" name="Absent" stroke="#EF4444" fill="none" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department stats */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-1">By Department</h3>
          <p className="text-xs text-slate-400 mb-5">Today's presence</p>
          <div className="space-y-4">
            {(stats?.department_stats || []).map(d => (
              <div key={d.department}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{d.department}</span>
                  <span className="text-slate-500">{d.present}/{d.total}</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-700"
                    style={{ width: d.total > 0 ? `${(d.present / d.total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly BarChart + Recent Attendance */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white">Monthly Overview</h3>
              <p className="text-xs text-slate-400 mt-0.5">Last 6 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.monthly_stats || []} margin={{ top: 0, right: 5, left: -20, bottom: 0 }} barSize={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="present" name="Present" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="late"    name="Late"    fill="#F59E0B" radius={[3, 3, 0, 0]} />
              <Bar dataKey="absent"  name="Absent"  fill="#EF4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent attendance */}
        <div className="card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white">Recent Check-ins</h3>
              <p className="text-xs text-slate-400 mt-0.5">Latest activity</p>
            </div>
            <Link to="/attendance" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {(stats?.recent_attendance || []).map(r => (
              <div key={r.id} className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                <Avatar name={r.employee_name} size="sm" color="#3B82F6" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{r.employee_name}</p>
                  <p className="text-xs text-slate-400">{r.department}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge status={r.status} withDot />
                  <p className="text-xs text-slate-400 mt-1">{r.check_in}</p>
                </div>
              </div>
            ))}
            {(!stats?.recent_attendance?.length) && (
              <p className="text-center text-slate-400 text-sm py-8">No check-ins yet today</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
