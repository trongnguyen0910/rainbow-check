import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, Filter, Users } from 'lucide-react';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../api/employees';
import { getDepartments } from '../api/settings';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/UI/Modal';
import Avatar from '../components/UI/Avatar';
import Badge from '../components/UI/Badge';
import Pagination from '../components/UI/Pagination';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const EmployeeForm = ({ defaultValues, departments, onSubmit, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });
  return (
    <form id="emp-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Họ và tên *</label>
          <input {...register('name', { required: 'Vui lòng nhập họ tên' })}
            className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Nguyễn Văn A" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Phòng ban *</label>
          <select {...register('department_id', { required: 'Vui lòng chọn phòng ban' })} className={`select ${errors.department_id ? 'input-error' : ''}`}>
            <option value="">Chọn...</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          {errors.department_id && <p className="text-red-500 text-xs mt-1">{errors.department_id.message}</p>}
        </div>
        <div>
          <label className="label">Chức vụ *</label>
          <input {...register('position', { required: 'Vui lòng nhập chức vụ' })}
            className={`input ${errors.position ? 'input-error' : ''}`} placeholder="Kỹ sư phần mềm" />
          {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position.message}</p>}
        </div>
        <div>
          <label className="label">Email *</label>
          <input {...register('email', { required: 'Vui lòng nhập email', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email không hợp lệ' } })}
            className={`input ${errors.email ? 'input-error' : ''}`} placeholder="email@rainbow.com" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label">Số điện thoại</label>
          <input {...register('phone')} className="input" placeholder="0901234567" />
        </div>
        <div>
          <label className="label">Ngày vào làm</label>
          <input type="date" {...register('join_date')} className="input" />
        </div>
        <div>
          <label className="label">Trạng thái</label>
          <select {...register('status')} className="select">
            <option value="active">Đang làm việc</option>
            <option value="inactive">Đã nghỉ việc</option>
          </select>
        </div>
      </div>
    </form>
  );
};

export default function Employees() {
  const { canAdmin } = useAuth();
  const [employees, setEmployees]     = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination]   = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [filters, setFilters]         = useState({ search: '', department: '', status: '' });
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState({ open: false, mode: 'create', data: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving]           = useState(false);

  const load = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await getEmployees({ ...filters, page, limit: pagination.limit });
      setEmployees(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Không thể tải danh sách nhân viên'); }
    finally { setLoading(false); }
  }, [filters, pagination.limit]);

  useEffect(() => { load(1); }, [filters]);
  useEffect(() => {
    getDepartments().then(r => setDepartments(r.data.data));
  }, []);

  const openCreate = () => setModal({ open: true, mode: 'create', data: null });
  const openEdit   = (emp) => setModal({ open: true, mode: 'edit', data: emp });
  const closeModal = () => setModal({ open: false, mode: 'create', data: null });

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        await createEmployee(data);
        toast.success('Thêm nhân viên thành công!');
      } else {
        await updateEmployee(modal.data.id, data);
        toast.success('Cập nhật nhân viên thành công!');
      }
      closeModal();
      load(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteEmployee(deleteTarget.id);
      toast.success('Đã xóa nhân viên');
      setDeleteTarget(null);
      load(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa thất bại');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Nhân viên</h1>
          <p className="page-subtitle">Quản lý nhân sự — tổng {pagination.total} người</p>
        </div>
        {canAdmin() && (
          <button onClick={openCreate} className="btn-primary gap-2">
            <Plus size={16} /> Thêm nhân viên
          </button>
        )}
      </div>

      {/* Bộ lọc */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Tìm theo tên, mã NV, email..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
          <select
            className="select w-full sm:w-44"
            value={filters.department}
            onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select
            className="select w-full sm:w-36"
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang làm việc</option>
            <option value="inactive">Đã nghỉ việc</option>
          </select>
        </div>
      </div>

      {/* Bảng */}
      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Mã NV</th>
                <th>Phòng ban</th>
                <th>Chức vụ</th>
                <th>Ngày vào làm</th>
                <th>Trạng thái</th>
                {canAdmin() && <th className="text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-12 text-slate-400">
                  <div className="spinner border-slate-200 border-t-primary-500 mx-auto" />
                </td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-12">
                  <Users size={40} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-400 text-sm">Không tìm thấy nhân viên</p>
                </td></tr>
              ) : employees.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={emp.name} color={emp.avatar_color} size="sm" />
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">{emp.name}</p>
                        <p className="text-xs text-slate-400">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge-neutral font-mono text-xs">{emp.id}</span></td>
                  <td>{emp.department}</td>
                  <td className="text-slate-600 dark:text-slate-300">{emp.position}</td>
                  <td className="text-slate-500">{emp.join_date}</td>
                  <td><Badge status={emp.status} withDot /></td>
                  {canAdmin() && (
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(emp)} className="btn-icon text-slate-400 hover:text-primary-600"><Pencil size={15} /></button>
                        <button onClick={() => setDeleteTarget(emp)} className="btn-icon text-slate-400 hover:text-red-500"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination {...pagination} onPageChange={p => load(p)} />
      </div>

      {/* Modal Tạo/Sửa */}
      <Modal
        open={modal.open}
        onClose={closeModal}
        title={modal.mode === 'create' ? 'Thêm nhân viên mới' : 'Chỉnh sửa nhân viên'}
        size="md"
        footer={
          <>
            <button onClick={closeModal} className="btn-secondary">Hủy</button>
            <button type="submit" form="emp-form" disabled={saving} className="btn-primary">
              {saving ? <span className="spinner border-white/30 border-t-white" /> : modal.mode === 'create' ? 'Tạo mới' : 'Cập nhật'}
            </button>
          </>
        }
      >
        <EmployeeForm
          defaultValues={modal.data || {}}
          departments={departments}
          onSubmit={handleSubmit}
          loading={saving}
        />
      </Modal>

      {/* Modal Xác nhận xóa */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Xóa nhân viên"
        size="sm"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Hủy</button>
            <button onClick={handleDelete} className="btn btn-danger bg-red-500 text-white hover:bg-red-600">Xóa</button>
          </>
        }
      >
        <p className="text-slate-600 dark:text-slate-300 text-sm">
          Bạn có chắc muốn xóa <strong>{deleteTarget?.name}</strong>? Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </div>
  );
}
