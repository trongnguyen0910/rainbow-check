import { useState, useEffect } from 'react';
import { Save, Building2, Clock, Globe } from 'lucide-react';
import { getSettings, updateSettings } from '../api/settings';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const TIMEZONES = [
  'Asia/Ho_Chi_Minh', 'Asia/Bangkok', 'Asia/Singapore', 'Asia/Tokyo',
  'Asia/Seoul', 'Asia/Shanghai', 'America/New_York', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'UTC',
];

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function Settings() {
  const { register, handleSubmit, reset, watch, setValue, formState: { isDirty } } = useForm();
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const workDays = watch('work_days') || [];

  useEffect(() => {
    getSettings().then(res => {
      reset(res.data.data);
      setLoading(false);
    }).catch(() => { toast.error('Failed to load settings'); setLoading(false); });
  }, []);

  const toggleWorkDay = (day) => {
    const curr = watch('work_days') || [];
    if (curr.includes(day)) setValue('work_days', curr.filter(d => d !== day), { shouldDirty: true });
    else setValue('work_days', [...curr, day], { shouldDirty: true });
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await updateSettings({ ...data, late_threshold_minutes: parseInt(data.late_threshold_minutes) });
      toast.success('Settings saved!');
      reset(data);
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><div className="spinner border-slate-200 border-t-primary-500 w-7 h-7" /></div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Company-wide attendance configuration</p>
        </div>
        <button type="submit" disabled={!isDirty || saving} className="btn-primary">
          {saving ? <span className="spinner border-white/30 border-t-white" /> : <><Save size={15} /> Save Changes</>}
        </button>
      </div>

      {/* Company info */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Building2 size={16} className="text-primary-500" /> Company Info
        </h2>
        <div>
          <label className="label">Company Name</label>
          <input {...register('company_name')} className="input" />
        </div>
      </div>

      {/* Work schedule */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Clock size={16} className="text-primary-500" /> Work Schedule
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Work Start Time</label>
            <input type="time" {...register('work_start')} className="input" />
          </div>
          <div>
            <label className="label">Work End Time</label>
            <input type="time" {...register('work_end')} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Late Threshold (minutes)</label>
          <input type="number" {...register('late_threshold_minutes')} min="0" max="120" className="input w-32" />
          <p className="text-xs text-slate-400 mt-1">Employees arriving more than this many minutes after work start are marked late</p>
        </div>
        <div>
          <label className="label">Working Days</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {WEEKDAYS.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleWorkDay(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
                  workDays.includes(day)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary-300'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leave defaults */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Clock size={16} className="text-primary-500" /> Leave Defaults (days/year)
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Annual Leave</label>
            <input type="number" {...register('annual_leave_days')} min="0" max="60" className="input" />
          </div>
          <div>
            <label className="label">Sick Leave</label>
            <input type="number" {...register('sick_leave_days')} min="0" max="60" className="input" />
          </div>
          <div>
            <label className="label">Personal Leave</label>
            <input type="number" {...register('personal_leave_days')} min="0" max="30" className="input" />
          </div>
        </div>
      </div>

      {/* Timezone */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Globe size={16} className="text-primary-500" /> Timezone
        </h2>
        <select {...register('timezone')} className="select">
          {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
        </select>
      </div>
    </form>
  );
}
