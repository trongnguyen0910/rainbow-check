import { useState, useEffect, useCallback } from 'react';
import { Plus, ClipboardList, Check, X as XIcon } from 'lucide-react';
import { getLeaves, createLeave, approveLeave, rejectLeave, getBalances } from '../api/leaves';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/UI/Badge';
import Avatar from '../components/UI/Avatar';
import Pagination from '../components/UI/Pagination';
import Modal from '../components/UI/Modal';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const LEAVE_TYPES = ['annual', 'sick', 'personal'];
const LEAVE_TYPE_LABELS = { annual: 'Phép năm', sick: 'Phép bệnh', personal: 'Phép cá nhân' };

const LeaveRequestForm = ({ onSubmit, loading }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: { type: 'annual', start_date: '', end_date: '', reason: '' }
  });
  const start = watch('start_date');

  const getDays = () => {
    const s = watch('start_date');
    const e = watch('end_date');
    if (!s || !e) return 0;
    const diff = (new Date(e) - new Date(s)) / (1000 * 60 * 60 * 24) + 1;
    return Math.max(0, diff);
  };

  return (
    <form id="leave-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Loại nghỉ phép *</label>
        <select {...register('type', { required: true })} className="select">
          {LEAVE_TYPES.map(t => <option key={t} value={t}>{LEAVE_TYPE_LABELS[t]}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Ngày bắt đầu *</label>
          <input type="date" {...register('start_date', { required: 'Bắt buộc' })}
            className={`input ${errors.start_date ? 'input-error' : ''}`}
            min={new Date().toISOString().split('T')[0]} />
          {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
        </div>
        <div>
          <label className="label">Ngày kết thúc *</label>
          <input type="date" {...register('end_date', { required: 'Bắt buộc' })}
            className={`input ${errors.end_date ? 'input-error' : ''}`}
            min={start || new Date().toISOString().split('T')[0]} />
          {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date.message}</p>}
        </div>
      </div>
      {getDays() > 0 && (
        <div className="badge-info py-2 text-sm">Yêu cầu {getDays()} ngày</div>
      )}
      <div>
        <label className="label">Lý do *</label>
        <textarea {...register('reason', { required: 'Vui lòng nhập lý do', minLength: { value: 10, message: 'Tối thiểu 10 ký tự' } })}
          rows={3} className={`input resize-none ${errors.reason ? 'input-error' : ''}`}
          placeholder="Mô tả lý do nghỉ phép..." />
        {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>}
      </div>
    </form>
  );
};

const BalanceCard = ({ balance }) => {
  if (!balance) return null;
  const items = [
    { label: 'Phép năm',    total: balance.annual_total,   used: balance.annual_used,   remaining: balance.annual_remaining,   color: 'bg-blue-500' },
    { label: 'Phép bệnh',   total: balance.sick_total,     used: balance.sick_used,     remaining: balance.sick_remaining,     color: 'bg-amber-500' },
    { label: 'Phép cá nhân',total: balance.personal_total, used: balance.personal_used, remaining: balance.personal_remaining, color: 'bg-purple-500' },
  ];
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-4 text-sm">Số ngày phép còn lại</h3>
      <div className="grid grid-cols-3 gap-4">
        {items.map(it => (
          <div key={it.label} className="text-center">
            <p className="text-2xl font-bold text-slate-800 dark:text-white tabular-nums">{it.remaining}</p>
            <p className="text-xs text-slate-400 mt-0.5">{it.label}</p>
            <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full ${it.color} rounded-full`} style={{ width: `${(it.used / it.total) * 100}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{it.used}/{it.total} đã dùng</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const TAB_LABELS = { '': 'Tất cả', pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' };

export default function Leaves() {
  const { user, isEmployee, canManage } = useAuth();
  const [leaves, setLeaves]           = useState([]);
  const [pagination, setPagination]   = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [filters, setFilters]         = useState({ status: '', type: '' });
  const [balance, setBalance]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [createOpen, setCreateOpen]   = useState(false);
  const [saving, setSaving]           = useState(false);
  const [actionTarget, setActionTarget] = useState(null);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await getLeaves({ ...filters, page, limit: 10 });
      setLeaves(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Không thể tải danh sách nghỉ phép'); }
    finally { setLoading(false); }
  }, [filters]);

  const loadBalance = useCallback(async () => {
    if (!user?.employee_id) return;
    try {
      const res = await getBalances({ employee_id: user.employee_id });
      setBalance(res.data.data);
    } catch {}
  }, [user]);

  useEffect(() => { load(1); }, [filters]);
  useEffect(() => { loadBalance(); }, [loadBalance]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await createLeave(data);
      toast.success('Đã gửi đơn nghỉ phép!');
      setCreateOpen(false);
      load(1); loadBalance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gửi đơn thất bại');
    } finally { setSaving(false); }
  };

  const handleApprove = async () => {
    try {
      await approveLeave(actionTarget.leave.id);
      toast.success('Đã duyệt đơn nghỉ phép');
      setActionTarget(null);
      load(1);
    } catch (err) { toast.error(err.response?.data?.message || 'Thất bại'); }
  };

  const handleReject = async () => {
    try {
      await rejectLeave(actionTarget.leave.id);
      toast.success('Đã từ chối đơn nghỉ phép');
      setActionTarget(null);
      load(1);
    } catch (err) { toast.error(err.response?.data?.message || 'Thất bại'); }
  };

  const tabLabel = (s) => filters.status === s
    ? 'font-semibold text-primary-600 border-b-2 border-primary-600'
    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200';

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Quản lý nghỉ phép</h1>
          <p className="page-subtitle">
            {isEmployee() ? 'Đơn nghỉ phép và số ngày phép của bạn' : 'Xem xét và quản lý đơn nghỉ phép'}
          </p>
        </div>
        {isEmployee() && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary">
            <Plus size={16} /> Tạo đơn nghỉ phép
          </button>
        )}
      </div>

      {/* Thẻ số ngày phép (chỉ nhân viên) */}
      {isEmployee() && <BalanceCard balance={balance} />}

      {/* Tab trạng thái */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 gap-6">
        {['', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilters(f => ({ ...f, status: s }))}
            className={`pb-3 text-sm transition-colors ${tabLabel(s)}`}>
            {TAB_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Bảng */}
      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Loại phép</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Số ngày</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
                {canManage() && <th className="text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-10">
                  <div className="spinner border-slate-200 border-t-primary-500 mx-auto" />
                </td></tr>
              ) : leaves.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-12">
                  <ClipboardList size={40} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-400 text-sm">Không có đơn nghỉ phép</p>
                </td></tr>
              ) : leaves.map(l => (
                <tr key={l.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={l.employee_name} size="sm" color="#3B82F6" />
                      <div>
                        <p className="font-medium text-sm text-slate-800 dark:text-white">{l.employee_name}</p>
                        <p className="text-xs text-slate-400">{l.department}</p>
                      </div>
                    </div>
                  </td>
                  <td><Badge status={l.type} /></td>
                  <td className="text-slate-500 tabular-nums">{l.start_date}</td>
                  <td className="text-slate-500 tabular-nums">{l.end_date}</td>
                  <td className="font-semibold text-slate-700 dark:text-slate-300">{l.days} ngày</td>
                  <td className="max-w-[200px] truncate text-slate-500 text-xs">{l.reason}</td>
                  <td><Badge status={l.status} withDot /></td>
                  {canManage() && (
                    <td>
                      {l.status === 'pending' && (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setActionTarget({ leave: l, action: 'approve' })}
                            className="btn-icon text-emerald-500 hover:bg-emerald-50"><Check size={16} /></button>
                          <button onClick={() => setActionTarget({ leave: l, action: 'reject' })}
                            className="btn-icon text-red-500 hover:bg-red-50"><XIcon size={16} /></button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination {...pagination} onPageChange={p => load(p)} />
      </div>

      {/* Modal tạo đơn */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Tạo đơn nghỉ phép" size="md"
        footer={
          <>
            <button onClick={() => setCreateOpen(false)} className="btn-secondary">Hủy</button>
            <button type="submit" form="leave-form" disabled={saving} className="btn-primary">
              {saving ? <span className="spinner border-white/30 border-t-white" /> : 'Gửi đơn'}
            </button>
          </>
        }
      >
        <LeaveRequestForm onSubmit={handleCreate} loading={saving} />
      </Modal>

      {/* Modal xác nhận duyệt/từ chối */}
      <Modal
        open={!!actionTarget}
        onClose={() => setActionTarget(null)}
        title={actionTarget?.action === 'approve' ? 'Duyệt đơn nghỉ phép' : 'Từ chối đơn nghỉ phép'}
        size="sm"
        footer={
          <>
            <button onClick={() => setActionTarget(null)} className="btn-secondary">Hủy</button>
            {actionTarget?.action === 'approve' ? (
              <button onClick={handleApprove} className="btn btn-success bg-emerald-500 text-white hover:bg-emerald-600">Duyệt</button>
            ) : (
              <button onClick={handleReject} className="btn btn-danger bg-red-500 text-white hover:bg-red-600">Từ chối</button>
            )}
          </>
        }
      >
        <p className="text-slate-600 dark:text-slate-300 text-sm">
          {actionTarget?.action === 'approve' ? 'Duyệt ' : 'Từ chối '}
          đơn nghỉ <strong>{LEAVE_TYPE_LABELS[actionTarget?.leave?.type] || actionTarget?.leave?.type}</strong>{' '}
          <strong>{actionTarget?.leave?.days} ngày</strong> của{' '}
          <strong>{actionTarget?.leave?.employee_name}</strong>?
        </p>
      </Modal>
    </div>
  );
}
