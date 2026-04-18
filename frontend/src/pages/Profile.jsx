import { useState, useEffect } from 'react';
import { Save, Lock, User, Mail, Phone, Briefcase, Calendar } from 'lucide-react';
import { getProfile, updateProfile, updateAvatar, changePassword } from '../api/profile';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/UI/Avatar';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const AVATAR_COLORS = ['#3B82F6','#EC4899','#8B5CF6','#10B981','#F59E0B','#EF4444','#06B6D4','#F97316','#14B8A6','#A855F7'];

export default function Profile() {
  const { loadUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [pwModal, setPwModal] = useState(false);

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm();
  const { register: pwReg, handleSubmit: pwSubmit, reset: pwReset, formState: { errors: pwErrors } } = useForm();

  const load = async () => {
    try {
      const res = await getProfile();
      const d = res.data.data;
      setProfile(d);
      reset({ name: d.user.name, email: d.user.email, phone: d.employee?.phone || '' });
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onSave = async (data) => {
    setSaving(true);
    try {
      await updateProfile(data);
      toast.success('Profile updated!');
      loadUser();
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const onChangeColor = async (color) => {
    try {
      await updateAvatar({ avatar_color: color });
      toast.success('Avatar color updated!');
      load(); loadUser();
    } catch {}
  };

  const onChangePw = async (data) => {
    if (data.new_password !== data.confirm_password) {
      toast.error('Passwords do not match'); return;
    }
    try {
      await changePassword({ current_password: data.current_password, new_password: data.new_password });
      toast.success('Password changed!');
      setPwModal(false);
      pwReset();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><div className="spinner border-slate-200 border-t-primary-500 w-7 h-7" /></div>
  );

  const { user, employee, leave_balance: bal } = profile || {};
  const avatarColor = employee?.avatar_color || user?.avatar_color || '#3B82F6';

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your personal information</p>
      </div>

      {/* Profile header */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative">
            <Avatar name={user?.name} color={avatarColor} size="2xl" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{user?.name}</h2>
            <p className="text-slate-500">{employee?.position || 'System User'}</p>
            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
              <Badge status={user?.role === 'admin' ? 'active' : user?.role === 'hr' ? 'active' : 'active'} custom={user?.role?.toUpperCase()} />
              {employee && <Badge status={employee.status} withDot />}
            </div>
          </div>
          <button onClick={() => setPwModal(true)} className="btn-secondary gap-2">
            <Lock size={15} /> Change Password
          </button>
        </div>

        {/* Avatar color picker */}
        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Choose Avatar Color</p>
          <div className="flex flex-wrap gap-2">
            {AVATAR_COLORS.map(c => (
              <button
                key={c}
                onClick={() => onChangeColor(c)}
                className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${avatarColor === c ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit(onSave)} className="card p-6 space-y-5">
        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <User size={16} className="text-primary-500" /> Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input {...register('name')} className="input" />
          </div>
          <div>
            <label className="label">Email</label>
            <input {...register('email')} type="email" className="input" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input {...register('phone')} className="input" placeholder="0901234567" />
          </div>
          <div>
            <label className="label">Username</label>
            <input value={user?.username} disabled className="input opacity-60 cursor-not-allowed" />
          </div>
        </div>
        {employee && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <div>
              <label className="label flex items-center gap-1"><Briefcase size={12} /> Department</label>
              <input value={employee.department} disabled className="input opacity-60 cursor-not-allowed" />
            </div>
            <div>
              <label className="label flex items-center gap-1"><Briefcase size={12} /> Position</label>
              <input value={employee.position} disabled className="input opacity-60 cursor-not-allowed" />
            </div>
            <div>
              <label className="label flex items-center gap-1"><Calendar size={12} /> Join Date</label>
              <input value={employee.join_date} disabled className="input opacity-60 cursor-not-allowed" />
            </div>
          </div>
        )}
        <div className="flex justify-end">
          <button type="submit" disabled={!isDirty || saving} className="btn-primary">
            {saving ? <span className="spinner border-white/30 border-t-white" /> : <><Save size={15} /> Save Changes</>}
          </button>
        </div>
      </form>

      {/* Leave balance */}
      {bal && (
        <div className="card p-6">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Leave Balance</h3>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Annual',   total: bal.annual_total,   remaining: bal.annual_remaining,   color: 'bg-blue-500' },
              { label: 'Sick',     total: bal.sick_total,     remaining: bal.sick_remaining,     color: 'bg-amber-500' },
              { label: 'Personal', total: bal.personal_total, remaining: bal.personal_remaining, color: 'bg-purple-500' },
            ].map(b => (
              <div key={b.label} className="text-center">
                <div className="text-3xl font-black text-slate-800 dark:text-white tabular-nums">{b.remaining}</div>
                <div className="text-xs text-slate-400 mt-1">{b.label} days left</div>
                <div className="mt-3 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full ${b.color} rounded-full transition-all duration-700`}
                    style={{ width: `${(b.remaining / b.total) * 100}%` }} />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{b.remaining} of {b.total}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Change pw modal */}
      <Modal open={pwModal} onClose={() => setPwModal(false)} title="Change Password" size="sm"
        footer={
          <>
            <button onClick={() => setPwModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" form="pw-form" className="btn-primary">Update Password</button>
          </>
        }
      >
        <form id="pw-form" onSubmit={pwSubmit(onChangePw)} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" {...pwReg('current_password', { required: 'Required' })} className="input" autoComplete="current-password" />
            {pwErrors.current_password && <p className="text-red-500 text-xs mt-1">{pwErrors.current_password.message}</p>}
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" {...pwReg('new_password', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })} className="input" autoComplete="new-password" />
            {pwErrors.new_password && <p className="text-red-500 text-xs mt-1">{pwErrors.new_password.message}</p>}
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" {...pwReg('confirm_password', { required: 'Required' })} className="input" autoComplete="new-password" />
          </div>
        </form>
      </Modal>
    </div>
  );
}
