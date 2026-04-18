import { useState, useEffect } from 'react';
import { Download, BarChart3, RefreshCw, TrendingUp, Clock, Calendar } from 'lucide-react';
import { getMonthlyReport, exportReport } from '../api/reports';
import toast from 'react-hot-toast';

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Reports() {
  const now = new Date();
  const [year, setYear]     = useState(now.getFullYear());
  const [month, setMonth]   = useState(now.getMonth() + 1);
  const [report, setReport] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMonthlyReport({ year, month });
      setReport(res.data.data.report);
      setSummary(res.data.data.summary);
    } catch { toast.error('Failed to load report'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [year, month]);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const res = await exportReport({ year, month, format });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${year}-${String(month).padStart(2,'0')}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch { toast.error('Export failed'); }
    finally { setExporting(false); }
  };

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Monthly attendance summary and export</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="select w-36">
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="select w-24">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={load} className="btn-secondary"><RefreshCw size={15} /></button>
          <button onClick={() => handleExport('xlsx')} disabled={exporting} className="btn-primary gap-2">
            <Download size={15} /> Excel
          </button>
          <button onClick={() => handleExport('csv')} disabled={exporting} className="btn-secondary gap-2">
            <Download size={15} /> CSV
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Working Days',       value: summary.working_days,         icon: Calendar,   color: 'text-blue-600 bg-blue-50' },
            { label: 'Avg Attendance Rate',value: `${summary.avg_attendance_rate}%`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Total Late Records', value: summary.total_late_records,    icon: Clock,      color: 'text-amber-600 bg-amber-50' },
            { label: 'Total Absences',     value: summary.total_absent_records,  icon: BarChart3,  color: 'text-red-600 bg-red-50' },
          ].map(c => (
            <div key={c.label} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center flex-shrink-0`}>
                <c.icon size={18} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800 dark:text-white tabular-nums">{c.value}</p>
                <p className="text-xs text-slate-400">{c.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white">
            {months[month - 1]} {year} — Detailed Report
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{report?.length || 0} employees</p>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner border-slate-200 border-t-primary-500 w-7 h-7" />
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th className="text-center">Working Days</th>
                  <th className="text-center">Present</th>
                  <th className="text-center">Late</th>
                  <th className="text-center">Absent</th>
                  <th className="text-center">Total Hours</th>
                  <th className="text-center">Avg Hours/Day</th>
                  <th className="text-center">Rate</th>
                </tr>
              </thead>
              <tbody>
                {(report || []).map(r => (
                  <tr key={r.employee_id}>
                    <td>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white text-sm">{r.employee_name}</p>
                        <p className="text-xs text-slate-400">{r.employee_id}</p>
                      </div>
                    </td>
                    <td className="text-slate-500 text-sm">{r.department}</td>
                    <td className="text-center tabular-nums text-slate-600 dark:text-slate-300">{r.working_days}</td>
                    <td className="text-center tabular-nums font-semibold text-emerald-600">{r.present_days}</td>
                    <td className="text-center tabular-nums font-semibold text-amber-600">{r.late_days}</td>
                    <td className="text-center tabular-nums font-semibold text-red-600">{r.absent_days}</td>
                    <td className="text-center tabular-nums text-slate-600 dark:text-slate-300">{r.total_hours}h</td>
                    <td className="text-center tabular-nums text-slate-500">{r.avg_hours_per_day}h</td>
                    <td className="text-center">
                      <span className={`badge ${r.attendance_rate >= 90 ? 'badge-success' : r.attendance_rate >= 70 ? 'badge-warning' : 'badge-danger'}`}>
                        {r.attendance_rate}%
                      </span>
                    </td>
                  </tr>
                ))}
                {(!report || report.length === 0) && (
                  <tr><td colSpan="9" className="text-center py-10 text-slate-400 text-sm">No data for this period</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
