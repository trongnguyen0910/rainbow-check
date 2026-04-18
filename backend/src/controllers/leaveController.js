const db = require('../data/mockData');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

const getAll = (req, res) => {
  const { status, type, employee_id, page = 1, limit = 10 } = req.query;

  let result = [...db.leaveRequests];

  // Role-based filtering
  if (req.user.role === 'employee' && req.user.employee_id) {
    result = result.filter(r => r.employee_id === req.user.employee_id);
  } else if (req.user.role === 'manager' && req.user.employee_id) {
    const managerEmp = db.employees.find(e => e.id === req.user.employee_id);
    if (managerEmp) {
      result = result.filter(r => {
        const emp = db.employees.find(e => e.id === r.employee_id);
        return emp?.department_id === managerEmp.department_id;
      });
    }
  }

  if (status) result = result.filter(r => r.status === status);
  if (type) result = result.filter(r => r.type === type);
  if (employee_id) result = result.filter(r => r.employee_id === employee_id);

  result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const total = result.length;
  const start = (page - 1) * limit;
  const paginated = result.slice(start, start + parseInt(limit));

  return sendPaginated(res, paginated, page, limit, total);
};

const create = (req, res) => {
  if (!req.user.employee_id) {
    return sendError(res, 403, 'Only employees can submit leave requests.');
  }

  const { type, start_date, end_date, reason } = req.body;
  if (!type || !start_date || !end_date || !reason) {
    return sendError(res, 400, 'Type, start date, end date, and reason are required.');
  }

  const validTypes = ['annual', 'sick', 'personal'];
  if (!validTypes.includes(type)) {
    return sendError(res, 400, 'Invalid leave type. Must be annual, sick, or personal.');
  }

  const start = new Date(start_date);
  const end = new Date(end_date);
  if (end < start) return sendError(res, 400, 'End date cannot be before start date.');

  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // Check balance
  const balance = db.leaveBalances.find(b => b.employee_id === req.user.employee_id);
  if (balance) {
    const remaining = balance[`${type}_total`] - balance[`${type}_used`];
    if (days > remaining) {
      return sendError(res, 400, `Insufficient ${type} leave balance. Available: ${remaining} days.`);
    }
  }

  const employee = db.employees.find(e => e.id === req.user.employee_id);
  const maxId = db.leaveRequests.length > 0
    ? Math.max(...db.leaveRequests.map(l => parseInt(l.id.replace('LVR', '')))) + 1 : 1;
  const newId = `LVR${String(maxId).padStart(3, '0')}`;

  const newRequest = {
    id: newId,
    employee_id: req.user.employee_id,
    employee_name: employee?.name || req.user.name,
    department: employee?.department || '',
    type,
    start_date,
    end_date,
    days,
    reason,
    status: 'pending',
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date().toISOString(),
  };

  db.leaveRequests = [newRequest, ...db.leaveRequests];

  // Notify HR and admin
  db.notifications = [{
    id: db.uuidv4(),
    user_ids: ['USR001', 'USR002'],
    message: `${employee?.name} submitted a ${type} leave request`,
    type: 'leave_request',
    read_by: [],
    link: '/leaves/approvals',
    created_at: new Date().toISOString(),
  }, ...db.notifications];

  return sendSuccess(res, newRequest, 'Leave request submitted successfully.', 201);
};

const approve = (req, res) => {
  const idx = db.leaveRequests.findIndex(l => l.id === req.params.id);
  if (idx === -1) return sendError(res, 404, 'Leave request not found.');

  const leave = db.leaveRequests[idx];
  if (leave.status !== 'pending') {
    return sendError(res, 400, `Leave request is already ${leave.status}.`);
  }

  const updated = {
    ...leave,
    status: 'approved',
    reviewed_by: req.user.id,
    reviewed_at: new Date().toISOString(),
  };

  // Deduct leave balance
  const balIdx = db.leaveBalances.findIndex(b => b.employee_id === leave.employee_id);
  if (balIdx !== -1) {
    const newBalances = [...db.leaveBalances];
    newBalances[balIdx] = {
      ...newBalances[balIdx],
      [`${leave.type}_used`]: newBalances[balIdx][`${leave.type}_used`] + leave.days,
    };
    db.leaveBalances = newBalances;
  }

  // Find the user to notify
  const empUser = db.users.find(u => u.employee_id === leave.employee_id);
  if (empUser) {
    db.notifications = [{
      id: db.uuidv4(),
      user_ids: [empUser.id],
      message: `Your ${leave.type} leave request has been approved`,
      type: 'leave_approved',
      read_by: [],
      link: '/leaves',
      created_at: new Date().toISOString(),
    }, ...db.notifications];
  }

  const newRequests = [...db.leaveRequests];
  newRequests[idx] = updated;
  db.leaveRequests = newRequests;

  return sendSuccess(res, updated, 'Leave request approved.');
};

const reject = (req, res) => {
  const idx = db.leaveRequests.findIndex(l => l.id === req.params.id);
  if (idx === -1) return sendError(res, 404, 'Leave request not found.');

  const leave = db.leaveRequests[idx];
  if (leave.status !== 'pending') {
    return sendError(res, 400, `Leave request is already ${leave.status}.`);
  }

  const { reason: rejectionReason } = req.body;
  const updated = {
    ...leave,
    status: 'rejected',
    rejection_reason: rejectionReason || null,
    reviewed_by: req.user.id,
    reviewed_at: new Date().toISOString(),
  };

  const newRequests = [...db.leaveRequests];
  newRequests[idx] = updated;
  db.leaveRequests = newRequests;

  // Notify employee
  const empUser = db.users.find(u => u.employee_id === leave.employee_id);
  if (empUser) {
    db.notifications = [{
      id: db.uuidv4(),
      user_ids: [empUser.id],
      message: `Your ${leave.type} leave request has been rejected`,
      type: 'leave_rejected',
      read_by: [],
      link: '/leaves',
      created_at: new Date().toISOString(),
    }, ...db.notifications];
  }

  return sendSuccess(res, updated, 'Leave request rejected.');
};

const getBalances = (req, res) => {
  let employeeId = req.query.employee_id;
  if (req.user.role === 'employee') employeeId = req.user.employee_id;
  if (!employeeId) return sendError(res, 400, 'Employee ID is required.');

  const balance = db.leaveBalances.find(b => b.employee_id === employeeId);
  if (!balance) return sendError(res, 404, 'Leave balance not found.');

  const enriched = {
    ...balance,
    annual_remaining: balance.annual_total - balance.annual_used,
    sick_remaining: balance.sick_total - balance.sick_used,
    personal_remaining: balance.personal_total - balance.personal_used,
  };

  return sendSuccess(res, enriched);
};

module.exports = { getAll, create, approve, reject, getBalances };
