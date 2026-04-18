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
          <label className="label">Full Name *</label>
          <input {...register('name', { required: 'Name is required' })}
            className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Nguyen Van A" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Department *</label>
          <select {...register('department_id', { required: 'Department is required' })} className={`select ${errors.department_id ? 'input-error' : ''}`}>
            <option value="">Select...</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          {errors.department_id && <p className="text-red-500 text-xs mt-1">{errors.department_id.message}</p>}
        </div>
        <div>
          <label className="label">Position *</label>
          <input {...register('position', { required: 'Position is required' })}
            className={`input ${errors.position ? 'input-error' : ''}`} placeholder="Software Engineer" />
          {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position.message}</p>}
        </div>
        <div>
          <label className="label">Email *</label>
          <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
            className={`input ${errors.email ? 'input-error' : ''}`} placeholder="email@rainbow.com" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label">Phone</label>
          <input {...register('phone')} className="input" placeholder="0901234567" />
        </div>
        <div>
          <label className="label">Join Date</label>
          <input type="date" {...register('join_date')} className="input" />
        </div>
        <div>
          <label className="label">Status</label>
          <select {...register('status')} className="select">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
    } catch { toast.error('Failed to load employees'); }
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
        toast.success('Employee created!');
      } else {
        await updateEmployee(modal.data.id, data);
        toast.success('Employee updated!');
      }
      closeModal();
      load(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteEmployee(deleteTarget.id);
      toast.success('Employee deleted');
      setDeleteTarget(null);
      load(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">Manage your workforce — {pagination.total} total</p>
        </div>
        {canAdmin() && (
          <button onClick={openCreate} className="btn-primary gap-2">
            <Plus size={16} /> Add Employee
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Search by name, ID, email..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
          <select
            className="select w-full sm:w-44"
            value={filters.department}
            onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select
            className="select w-full sm:w-36"
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>ID</th>
                <th>Department</th>
                <th>Position</th>
                <th>Join Date</th>
                <th>Status</th>
                {canAdmin() && <th className="text-right">Actions</th>}
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
                  <p className="text-slate-400 text-sm">No employees found</p>
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

      {/* Create/Edit Modal */}
      <Modal
        open={modal.open}
        onClose={closeModal}
        title={modal.mode === 'create' ? 'Add New Employee' : 'Edit Employee'}
        size="md"
        footer={
          <>
            <button onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" form="emp-form" disabled={saving} className="btn-primary">
              {saving ? <span className="spinner border-white/30 border-t-white" /> : modal.mode === 'create' ? 'Create' : 'Update'}
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

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Employee"
        size="sm"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="btn btn-danger bg-red-500 text-white hover:bg-red-600">Delete</button>
          </>
        }
      >
        <p className="text-slate-600 dark:text-slate-300 text-sm">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
