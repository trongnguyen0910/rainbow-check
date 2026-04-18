const db = require('../data/mockData');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

const getAll = (req, res) => {
  const { search = '', department = '', status = '', page = 1, limit = 10 } = req.query;

  let result = [...db.employees];

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q)
    );
  }
  if (department) result = result.filter(e => e.department_id === parseInt(department));
  if (status) result = result.filter(e => e.status === status);

  const total = result.length;
  const start = (page - 1) * limit;
  const paginated = result.slice(start, start + parseInt(limit));

  return sendPaginated(res, paginated, page, limit, total);
};

const getById = (req, res) => {
  const emp = db.employees.find(e => e.id === req.params.id);
  if (!emp) return sendError(res, 404, 'Employee not found.');
  return sendSuccess(res, emp);
};

const create = (req, res) => {
  const { name, department_id, position, email, phone, join_date, status = 'active' } = req.body;
  if (!name || !department_id || !position || !email) {
    return sendError(res, 400, 'Name, department, position, and email are required.');
  }

  const dept = db.departments.find(d => d.id === parseInt(department_id));
  if (!dept) return sendError(res, 400, 'Invalid department.');

  // Check email uniqueness
  if (db.employees.find(e => e.email === email)) {
    return sendError(res, 400, 'Email already exists.');
  }

  // Auto-generate employee ID
  const maxId = db.employees
    .map(e => parseInt(e.id.replace('EMP', '')))
    .sort((a, b) => b - a)[0] || 0;
  const newId = `EMP${String(maxId + 1).padStart(3, '0')}`;

  const colors = ['#3B82F6','#EC4899','#8B5CF6','#10B981','#F59E0B','#EF4444','#06B6D4','#F97316','#14B8A6','#A855F7'];
  const avatar_color = colors[Math.floor(Math.random() * colors.length)];

  const newEmployee = {
    id: newId,
    name,
    department_id: parseInt(department_id),
    department: dept.name,
    position,
    email,
    phone: phone || '',
    join_date: join_date || new Date().toISOString().split('T')[0],
    status,
    avatar_color,
  };

  db.employees = [...db.employees, newEmployee];

  // Create leave balance for new employee
  db.leaveBalances = [...db.leaveBalances, {
    employee_id: newId,
    annual_total: db.settings.annual_leave_days,
    annual_used: 0,
    sick_total: db.settings.sick_leave_days,
    sick_used: 0,
    personal_total: db.settings.personal_leave_days,
    personal_used: 0,
  }];

  return sendSuccess(res, newEmployee, 'Employee created successfully.', 201);
};

const update = (req, res) => {
  const idx = db.employees.findIndex(e => e.id === req.params.id);
  if (idx === -1) return sendError(res, 404, 'Employee not found.');

  const { name, department_id, position, email, phone, join_date, status } = req.body;

  // Check email uniqueness
  if (email && db.employees.find(e => e.email === email && e.id !== req.params.id)) {
    return sendError(res, 400, 'Email already in use by another employee.');
  }

  let dept = null;
  if (department_id) {
    dept = db.departments.find(d => d.id === parseInt(department_id));
    if (!dept) return sendError(res, 400, 'Invalid department.');
  }

  const updated = {
    ...db.employees[idx],
    ...(name && { name }),
    ...(department_id && { department_id: parseInt(department_id), department: dept.name }),
    ...(position && { position }),
    ...(email && { email }),
    ...(phone !== undefined && { phone }),
    ...(join_date && { join_date }),
    ...(status && { status }),
  };

  const newList = [...db.employees];
  newList[idx] = updated;
  db.employees = newList;

  return sendSuccess(res, updated, 'Employee updated successfully.');
};

const remove = (req, res) => {
  const idx = db.employees.findIndex(e => e.id === req.params.id);
  if (idx === -1) return sendError(res, 404, 'Employee not found.');
  db.employees = db.employees.filter(e => e.id !== req.params.id);
  return sendSuccess(res, null, 'Employee deleted successfully.');
};

module.exports = { getAll, getById, create, update, remove };
