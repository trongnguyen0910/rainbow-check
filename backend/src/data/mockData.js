/**
 * MOCK DATA STORE
 * Simulates a MySQL database with in-memory data.
 * All CRUD operations manipulate these arrays directly.
 * Replace this module with real MySQL queries when integrating the real DB.
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// ─── DEPARTMENTS ───────────────────────────────────────────────────────────────
const departments = [
  { id: 1, name: 'Engineering', code: 'ENG', head: 'EMP003' },
  { id: 2, name: 'Human Resources', code: 'HR', head: 'EMP006' },
  { id: 3, name: 'Marketing', code: 'MKT', head: 'EMP009' },
  { id: 4, name: 'Finance', code: 'FIN', head: 'EMP012' },
  { id: 5, name: 'Operations', code: 'OPS', head: 'EMP014' },
];

// ─── EMPLOYEES ─────────────────────────────────────────────────────────────────
let employees = [
  { id: 'EMP001', name: 'Nguyen Van An', department_id: 1, department: 'Engineering', position: 'Junior Developer', email: 'an.nguyen@rainbow.com', phone: '0901234001', join_date: '2023-03-10', status: 'active', avatar_color: '#3B82F6' },
  { id: 'EMP002', name: 'Tran Thi Bich', department_id: 2, department: 'Human Resources', position: 'HR Specialist', email: 'bich.tran@rainbow.com', phone: '0901234002', join_date: '2021-06-15', status: 'active', avatar_color: '#EC4899' },
  { id: 'EMP003', name: 'Le Hoang Cuong', department_id: 1, department: 'Engineering', position: 'Engineering Manager', email: 'cuong.le@rainbow.com', phone: '0901234003', join_date: '2020-01-20', status: 'active', avatar_color: '#8B5CF6' },
  { id: 'EMP004', name: 'Pham Thi Dung', department_id: 1, department: 'Engineering', position: 'Senior Developer', email: 'dung.pham@rainbow.com', phone: '0901234004', join_date: '2021-04-05', status: 'active', avatar_color: '#10B981' },
  { id: 'EMP005', name: 'Hoang Van Em', department_id: 1, department: 'Engineering', position: 'DevOps Engineer', email: 'em.hoang@rainbow.com', phone: '0901234005', join_date: '2022-08-12', status: 'active', avatar_color: '#F59E0B' },
  { id: 'EMP006', name: 'Vo Thi Phuong', department_id: 2, department: 'Human Resources', position: 'HR Manager', email: 'phuong.vo@rainbow.com', phone: '0901234006', join_date: '2019-11-30', status: 'active', avatar_color: '#EF4444' },
  { id: 'EMP007', name: 'Nguyen Duc Giang', department_id: 2, department: 'Human Resources', position: 'Recruiter', email: 'giang.nguyen@rainbow.com', phone: '0901234007', join_date: '2023-01-17', status: 'active', avatar_color: '#06B6D4' },
  { id: 'EMP008', name: 'Bui Thi Hoa', department_id: 3, department: 'Marketing', position: 'Marketing Specialist', email: 'hoa.bui@rainbow.com', phone: '0901234008', join_date: '2022-05-22', status: 'active', avatar_color: '#F97316' },
  { id: 'EMP009', name: 'Do Van Hieu', department_id: 3, department: 'Marketing', position: 'Marketing Manager', email: 'hieu.do@rainbow.com', phone: '0901234009', join_date: '2020-07-08', status: 'active', avatar_color: '#14B8A6' },
  { id: 'EMP010', name: 'Dang Thi Kim', department_id: 3, department: 'Marketing', position: 'Content Creator', email: 'kim.dang@rainbow.com', phone: '0901234010', join_date: '2023-09-01', status: 'active', avatar_color: '#A855F7' },
  { id: 'EMP011', name: 'Ly Van Long', department_id: 4, department: 'Finance', position: 'Financial Analyst', email: 'long.ly@rainbow.com', phone: '0901234011', join_date: '2021-02-14', status: 'active', avatar_color: '#22C55E' },
  { id: 'EMP012', name: 'Mac Thi Mai', department_id: 4, department: 'Finance', position: 'Finance Manager', email: 'mai.mac@rainbow.com', phone: '0901234012', join_date: '2019-05-25', status: 'active', avatar_color: '#FB923C' },
  { id: 'EMP013', name: 'Ngo Van Nam', department_id: 5, department: 'Operations', position: 'Operations Coordinator', email: 'nam.ngo@rainbow.com', phone: '0901234013', join_date: '2022-10-03', status: 'active', avatar_color: '#60A5FA' },
  { id: 'EMP014', name: 'Ong Thi Oanh', department_id: 5, department: 'Operations', position: 'Operations Manager', email: 'oanh.ong@rainbow.com', phone: '0901234014', join_date: '2020-03-18', status: 'active', avatar_color: '#F43F5E' },
  { id: 'EMP015', name: 'Phan Van Phuc', department_id: 1, department: 'Engineering', position: 'QA Engineer', email: 'phuc.phan@rainbow.com', phone: '0901234015', join_date: '2023-06-28', status: 'inactive', avatar_color: '#7C3AED' },
];

// ─── USERS (AUTH) ──────────────────────────────────────────────────────────────
let users = [
  { id: 'USR001', username: 'admin', password: bcrypt.hashSync('Admin@123', 10), role: 'admin', employee_id: null, name: 'System Administrator', email: 'admin@rainbow.com', avatar_color: '#1E40AF' },
  { id: 'USR002', username: 'hr_manager', password: bcrypt.hashSync('Hr@123', 10), role: 'hr', employee_id: 'EMP006', name: 'Vo Thi Phuong', email: 'phuong.vo@rainbow.com', avatar_color: '#EF4444' },
  { id: 'USR003', username: 'manager_eng', password: bcrypt.hashSync('Manager@123', 10), role: 'manager', employee_id: 'EMP003', name: 'Le Hoang Cuong', email: 'cuong.le@rainbow.com', avatar_color: '#8B5CF6' },
  { id: 'USR004', username: 'emp001', password: bcrypt.hashSync('Emp@123', 10), role: 'employee', employee_id: 'EMP001', name: 'Nguyen Van An', email: 'an.nguyen@rainbow.com', avatar_color: '#3B82F6' },
  { id: 'USR005', username: 'emp004', password: bcrypt.hashSync('Emp@123', 10), role: 'employee', employee_id: 'EMP004', name: 'Pham Thi Dung', email: 'dung.pham@rainbow.com', avatar_color: '#10B981' },
];

// ─── ATTENDANCE (GENERATED) ────────────────────────────────────────────────────
function generateAttendance() {
  const records = [];
  const today = new Date();
  // Seed random for reproducibility
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let day = 59; day >= 0; day--) {
    const date = new Date(today);
    date.setDate(today.getDate() - day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends
    const dateStr = date.toISOString().split('T')[0];

    // Only generate up to today
    if (date > today) continue;

    employees.filter(e => e.status === 'active').forEach(emp => {
      const r = rand();
      if (r < 0.05) {
        // Absent
        records.push({
          id: uuidv4(),
          employee_id: emp.id,
          employee_name: emp.name,
          department: emp.department,
          department_id: emp.department_id,
          date: dateStr,
          check_in: null,
          check_out: null,
          status: 'absent',
          working_hours: 0,
        });
      } else {
        const isLate = r < 0.25;
        const checkInHour = 8;
        const checkInMinute = isLate
          ? 15 + Math.floor(rand() * 60)
          : Math.floor(rand() * 14);
        const checkInMin = Math.min(checkInMinute, 59);

        const checkOutHour = 17 + Math.floor(rand() * 2);
        const checkOutMinute = Math.floor(rand() * 60);

        const checkInTime = `${String(checkInHour).padStart(2, '0')}:${String(checkInMin).padStart(2, '0')}`;
        const checkOutTime = `${String(checkOutHour).padStart(2, '0')}:${String(checkOutMinute).padStart(2, '0')}`;

        const totalMinutes = (checkOutHour * 60 + checkOutMinute) - (checkInHour * 60 + checkInMin);
        const workingHours = (totalMinutes / 60).toFixed(1);

        records.push({
          id: uuidv4(),
          employee_id: emp.id,
          employee_name: emp.name,
          department: emp.department,
          department_id: emp.department_id,
          date: dateStr,
          check_in: checkInTime,
          check_out: checkOutTime,
          status: isLate ? 'late' : 'on-time',
          working_hours: parseFloat(workingHours),
        });
      }
    });
  }
  return records;
}

let attendance = generateAttendance();

// ─── LEAVE REQUESTS ────────────────────────────────────────────────────────────
let leaveRequests = [
  { id: 'LVR001', employee_id: 'EMP001', employee_name: 'Nguyen Van An', department: 'Engineering', type: 'annual', start_date: '2026-04-14', end_date: '2026-04-16', days: 3, reason: 'Family vacation', status: 'pending', reviewed_by: null, reviewed_at: null, created_at: '2026-04-11T07:00:00Z' },
  { id: 'LVR002', employee_id: 'EMP004', employee_name: 'Pham Thi Dung', department: 'Engineering', type: 'sick', start_date: '2026-04-08', end_date: '2026-04-09', days: 2, reason: 'Fever and flu', status: 'approved', reviewed_by: 'USR002', reviewed_at: '2026-04-07T14:00:00Z', created_at: '2026-04-07T09:00:00Z' },
  { id: 'LVR003', employee_id: 'EMP007', employee_name: 'Nguyen Duc Giang', department: 'Human Resources', type: 'personal', start_date: '2026-04-20', end_date: '2026-04-20', days: 1, reason: 'Personal matter', status: 'pending', reviewed_by: null, reviewed_at: null, created_at: '2026-04-10T10:00:00Z' },
  { id: 'LVR004', employee_id: 'EMP008', employee_name: 'Bui Thi Hoa', department: 'Marketing', type: 'annual', start_date: '2026-03-25', end_date: '2026-03-28', days: 4, reason: 'Wedding anniversary trip', status: 'approved', reviewed_by: 'USR002', reviewed_at: '2026-03-20T11:00:00Z', created_at: '2026-03-18T08:00:00Z' },
  { id: 'LVR005', employee_id: 'EMP011', employee_name: 'Ly Van Long', department: 'Finance', type: 'annual', start_date: '2026-04-01', end_date: '2026-04-03', days: 3, reason: 'Holiday', status: 'rejected', reviewed_by: 'USR002', reviewed_at: '2026-03-29T09:30:00Z', created_at: '2026-03-28T16:00:00Z' },
  { id: 'LVR006', employee_id: 'EMP013', employee_name: 'Ngo Van Nam', department: 'Operations', type: 'sick', start_date: '2026-04-11', end_date: '2026-04-11', days: 1, reason: 'Doctor appointment', status: 'pending', reviewed_by: null, reviewed_at: null, created_at: '2026-04-11T06:30:00Z' },
];

// ─── LEAVE BALANCES ────────────────────────────────────────────────────────────
let leaveBalances = employees.map(emp => ({
  employee_id: emp.id,
  annual_total: 15,
  annual_used: Math.floor(Math.random() * 8),
  sick_total: 10,
  sick_used: Math.floor(Math.random() * 4),
  personal_total: 5,
  personal_used: Math.floor(Math.random() * 3),
}));

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────────
let notifications = [
  { id: 'NTF001', user_ids: ['USR001', 'USR002'], message: 'Nguyen Van An submitted a leave request', type: 'leave_request', read_by: [], link: '/leaves', created_at: '2026-04-11T07:00:00Z' },
  { id: 'NTF002', user_ids: ['USR001', 'USR002'], message: 'Nguyen Duc Giang submitted a leave request', type: 'leave_request', read_by: [], link: '/leaves', created_at: '2026-04-10T10:00:00Z' },
  { id: 'NTF003', user_ids: ['USR001', 'USR002'], message: 'Ngo Van Nam submitted a leave request', type: 'leave_request', read_by: [], link: '/leaves', created_at: '2026-04-11T06:30:00Z' },
  { id: 'NTF004', user_ids: ['USR004'], message: 'Your leave request has been approved', type: 'leave_approved', read_by: [], link: '/leaves', created_at: '2026-04-07T14:00:00Z' },
  { id: 'NTF005', user_ids: ['USR001', 'USR002', 'USR003'], message: '3 employees checked in late today', type: 'late_checkin', read_by: ['USR003'], link: '/attendance', created_at: '2026-04-11T08:30:00Z' },
];

// ─── SETTINGS ──────────────────────────────────────────────────────────────────
let settings = {
  company_name: 'Rainbow Corporation',
  company_logo: null,
  work_start: '08:00',
  work_end: '17:00',
  late_threshold_minutes: 15,
  timezone: 'Asia/Ho_Chi_Minh',
  work_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  annual_leave_days: 15,
  sick_leave_days: 10,
  personal_leave_days: 5,
};

// ─── EXPORTS ───────────────────────────────────────────────────────────────────
module.exports = {
  departments,
  get employees() { return employees; },
  set employees(val) { employees = val; },
  get users() { return users; },
  set users(val) { users = val; },
  get attendance() { return attendance; },
  set attendance(val) { attendance = val; },
  get leaveRequests() { return leaveRequests; },
  set leaveRequests(val) { leaveRequests = val; },
  get leaveBalances() { return leaveBalances; },
  set leaveBalances(val) { leaveBalances = val; },
  get notifications() { return notifications; },
  set notifications(val) { notifications = val; },
  get settings() { return settings; },
  set settings(val) { settings = val; },
  uuidv4,
};
