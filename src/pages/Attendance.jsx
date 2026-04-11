import { useState, useEffect, useCallback } from 'react';
import { LogIn, LogOut, Filter, CalendarDays, Clock } from 'lucide-react';
import { getAttendance, getTodayStatus, checkIn, checkOut } from '../api/attendance';
import { getDepartments } from '../api/settings';
import { getEmployees } from '../api/employees';
import Badge from '../components/UI/Badge';
import Avatar from '../components/UI/Avatar';
import Pagination from '../components/UI/Pagination';
import Modal from '../components/UI/Modal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Attendance() {
  const { user, isEmployee } = useAuth();
  const [records, setRecords]       = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [filters, setFilters]       = useState({ date: '', employee_id: '', department: '', status: '' });
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [todayStatus, setTodayStatus] = useState(null);
  const [cicoModal, setCicoModal]   = useState(false);
  const [cicoLoading, setCicoLoading] = useState(false);
  const [now, setNow]               = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAttendance({ ...filters, page, limit: 15 });
      setRecords(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load records'); }
    finally { setLoading(false); }
  }, [filters]);

  const loadToday = useCallback(async () => {
    try {
      const res = await getTodayStatus();
      setTodayStatus(res.data.data);
    } catch {}
  }, []);

  useEffect(() => { load(1); }, [filters]);
  useEffect(() => { loadToday(); }, []);
  useEffect(() => {
    getDepartments().then(r => setDepartments(r.data.data));
    if (!isEmployee()) {
      getEmployees({ limit: 100 }).then(r => setEmployees(r.data.data));
    }
  }, []);

  const formatTime = d =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const handleCheckIn = async () => {
    setCicoLoading(true);
    try {
      const res = await checkIn();
      toast.success(res.data.message);
      loadToday(); load(1);
      setCicoModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally { setCicoLoading(false); }
  };

  const handleCheckOut = async () => {
    setCicoLoading(true);
    try {
      const res = await checkOut();
      toast.success(res.data.message);
      loadToday(); load(1);
      setCicoModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    } finally { setCicoLoading(false); }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Track daily check-ins and check-outs</p>
        </div>
        {isEmployee() && (
          <button onClick={() => setCicoModal(true)} className="btn-primary">
            <CalendarDays size={16} />
            {todayStatus?.checked_in ? (todayStatus?.checked_out ? 'View Today' : 'Check Out') : 'Check In'}
          </button>
        )}
      </div>

      {/* Employee status card */}
      {isEmployee() && todayStatus !== null && (
        <div className="card p-5 border border-primary-100 dark:border-primary-900/30">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold text-slate-800 dark:text-white">Today's Status</p>
              <p className="text-xs text-slate-400 mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-1">Check In</p>
                <p className="font-bold text-slate-700 dark:text-white text-lg tabular-nums">
                  {todayStatus.record?.check_in || '--:--'}
                </p>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-600" />
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-1">Check Out</p>
                <p className="font-bold text-slate-700 dark:text-white text-lg tabular-nums">
                  {todayStatus.record?.check_out || '--:--'}
                </p>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-600" />
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-1">Status</p>
                {todayStatus.record ? <Badge status={todayStatus.record.status} withDot /> : <span className="text-slate-400 text-sm">–</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-shrink-0 text-slate-500 dark:text-slate-400">
            <Filter size={15} /> <span className="text-sm font-medium">Filters</span>
          </div>
          <input
            type="date"
            className="input w-auto"
            value={filters.date}
            onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
          />
          <select className="select w-auto" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Status</option>
            <option value="on-time">On Time</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
          </select>
          {!isEmployee() && (
            <>
              <select className="select w-auto" value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}>
                <option value="">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select className="select w-auto" value={filters.employee_id} onChange={e => setFilters(f => ({ ...f, employee_id: e.target.value }))}>
                <option value="">All Employees</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </>
          )}
          <button onClick={() => setFilters({ date: '', employee_id: '', department: '', status: '' })}
            className="btn-ghost text-xs">Clear</button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-10">
                  <div className="spinner border-slate-200 border-t-primary-500 mx-auto" />
                </td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12">
                  <CalendarDays size={40} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-400 text-sm">No records found</p>
                </td></tr>
              ) : records.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={r.employee_name} size="sm" color="#3B82F6" />
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white text-sm">{r.employee_name}</p>
                        <p className="text-xs text-slate-400">{r.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-slate-500 tabular-nums">{r.date}</td>
                  <td className="tabular-nums font-medium text-slate-700 dark:text-slate-300">{r.check_in || '–'}</td>
                  <td className="tabular-nums font-medium text-slate-700 dark:text-slate-300">{r.check_out || '–'}</td>
                  <td className="tabular-nums text-slate-500">
                    {r.working_hours > 0 ? `${r.working_hours}h` : '–'}
                  </td>
                  <td><Badge status={r.status} withDot /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination {...pagination} onPageChange={p => load(p)} />
      </div>

      {/* Check-in/out modal */}
      <Modal
        open={cicoModal}
        onClose={() => setCicoModal(false)}
        title="Check In / Check Out"
        size="sm"
      >
        <div className="text-center space-y-6 py-2">
          <div>
            <p className="text-4xl font-black text-slate-800 dark:text-white tabular-nums">{formatTime(now)}</p>
            <p className="text-sm text-slate-400 mt-1">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>

          {todayStatus && (
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Check In:</span>
                <span className="font-semibold text-slate-700 dark:text-white">{todayStatus.record?.check_in || 'Not yet'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Check Out:</span>
                <span className="font-semibold text-slate-700 dark:text-white">{todayStatus.record?.check_out || 'Not yet'}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {!todayStatus?.checked_in && (
              <button onClick={handleCheckIn} disabled={cicoLoading} className="btn-primary py-3 text-base justify-center">
                {cicoLoading ? <span className="spinner border-white/30 border-t-white" /> : <><LogIn size={18} /> Check In Now</>}
              </button>
            )}
            {todayStatus?.checked_in && !todayStatus?.checked_out && (
              <button onClick={handleCheckOut} disabled={cicoLoading} className="btn btn-danger bg-red-500 text-white py-3 text-base justify-center">
                {cicoLoading ? <span className="spinner border-white/30 border-t-white" /> : <><LogOut size={18} /> Check Out Now</>}
              </button>
            )}
            {todayStatus?.checked_in && todayStatus?.checked_out && (
              <div className="badge-success py-2.5 text-sm justify-center">✓ Attendance complete for today</div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
