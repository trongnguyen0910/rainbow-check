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

const WEEKDAYS = [
  { key: 'monday',    label: 'Thứ 2' },
  { key: 'tuesday',  label: 'Thứ 3' },
  { key: 'wednesday',label: 'Thứ 4' },
  { key: 'thursday', label: 'Thứ 5' },
  { key: 'friday',   label: 'Thứ 6' },
  { key: 'saturday', label: 'Thứ 7' },
  { key: 'sunday',   label: 'CN' },
];

export default function Settings() {
  const { register, handleSubmit, reset, watch, setValue, formState: { isDirty } } = useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const workDays = watch('work_days') || [];

  useEffect(() => {
    getSettings().then(res => {
      reset(res.data.data);
      setLoading(false);
    }).catch(() => { toast.error('Không thể tải cài đặt'); setLoading(false); });
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
      toast.success('Đã lưu cài đặt!');
      reset(data);
    } catch (err) { toast.error(err.response?.data?.message || 'Cập nhật thất bại'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><div className="spinner border-slate-200 border-t-primary-500 w-7 h-7" /></div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Cài đặt</h1>
          <p className="page-subtitle">Cấu hình chấm công toàn công ty</p>
        </div>
        <button type="submit" disabled={!isDirty || saving} className="btn-primary">
          {saving ? <span className="spinner border-white/30 border-t-white" /> : <><Save size={15} /> Lưu thay đổi</>}
        </button>
      </div>

      {/* Thông tin công ty */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Building2 size={16} className="text-primary-500" /> Thông tin công ty
        </h2>
        <div>
          <label className="label">Tên công ty</label>
          <input {...register('company_name')} className="input" />
        </div>
      </div>

      {/* Lịch làm việc */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Clock size={16} className="text-primary-500" /> Lịch làm việc
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Giờ bắt đầu</label>
            <input type="time" {...register('work_start')} className="input" />
          </div>
          <div>
            <label className="label">Giờ kết thúc</label>
            <input type="time" {...register('work_end')} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Ngưỡng đi trễ (phút)</label>
          <input type="number" {...register('late_threshold_minutes')} min="0" max="120" className="input w-32" />
          <p className="text-xs text-slate-400 mt-1">Nhân viên đến sau số phút này so với giờ bắt đầu sẽ bị tính là đi trễ</p>
        </div>
        <div>
          <label className="label">Ngày làm việc</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {WEEKDAYS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleWorkDay(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  workDays.includes(key)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Số ngày phép mặc định */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Clock size={16} className="text-primary-500" /> Số ngày phép mặc định (ngày/năm)
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Phép năm</label>
            <input type="number" {...register('annual_leave_days')} min="0" max="60" className="input" />
          </div>
          <div>
            <label className="label">Phép bệnh</label>
            <input type="number" {...register('sick_leave_days')} min="0" max="60" className="input" />
          </div>
          <div>
            <label className="label">Phép cá nhân</label>
            <input type="number" {...register('personal_leave_days')} min="0" max="30" className="input" />
          </div>
        </div>
      </div>

      {/* Múi giờ */}
      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Globe size={16} className="text-primary-500" /> Múi giờ
        </h2>
        <select {...register('timezone')} className="select">
          {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
        </select>
      </div>
    </form>
  );
}
