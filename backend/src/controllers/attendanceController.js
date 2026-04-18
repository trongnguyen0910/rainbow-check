const db = require('../data/mockData');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

const getAll = (req, res) => {
  const { date, employee_id, department, status, page = 1, limit = 15 } = req.query;

  let result = [...db.attendance];

  // Role-based filtering: employees can only see their own records
  if (req.user.role === 'employee' && req.user.employee_id) {
    result = result.filter(r => r.employee_id === req.user.employee_id);
  }

  if (date) result = result.filter(r => r.date === date);
  if (employee_id) result = result.filter(r => r.employee_id === employee_id);
  if (department) result = result.filter(r => r.department_id === parseInt(department));
  if (status) result = result.filter(r => r.status === status);

  // Sort by date descending, then employee_id
  result.sort((a, b) => b.date.localeCompare(a.date) || a.employee_id.localeCompare(b.employee_id));

  const total = result.length;
  const start = (page - 1) * limit;
  const paginated = result.slice(start, start + parseInt(limit));

  return sendPaginated(res, paginated, page, limit, total);
};

const checkIn = (req, res) => {
  if (!req.user.employee_id) {
    return sendError(res, 403, 'Only employees can check in.');
  }

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const checkInTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  const existingRecord = db.attendance.find(
    r => r.employee_id === req.user.employee_id && r.date === today
  );

  if (existingRecord && existingRecord.check_in) {
    return sendError(res, 400, 'Already checked in today.');
  }

  const settings = db.settings;
  const [startHour, startMin] = settings.work_start.split(':').map(Number);
  const lateThreshold = settings.late_threshold_minutes;
  const lateMinutes = now.getHours() * 60 + now.getMinutes() - (startHour * 60 + startMin);
  const isLate = lateMinutes > lateThreshold;

  const employee = db.employees.find(e => e.id === req.user.employee_id);
  const newRecord = {
    id: db.uuidv4(),
    employee_id: req.user.employee_id,
    employee_name: employee?.name || req.user.name,
    department: employee?.department || '',
    department_id: employee?.department_id || null,
    date: today,
    check_in: checkInTime,
    check_out: null,
    status: isLate ? 'late' : 'on-time',
    working_hours: 0,
  };

  if (existingRecord) {
    db.attendance = db.attendance.map(r =>
      r.id === existingRecord.id ? { ...r, check_in: checkInTime, status: newRecord.status } : r
    );
  } else {
    db.attendance = [...db.attendance, newRecord];
  }

  // Create notification if late
  if (isLate) {
    db.notifications = [{
      id: db.uuidv4(),
      user_ids: ['USR001', 'USR002'],
      message: `${employee?.name} checked in late (${checkInTime})`,
      type: 'late_checkin',
      read_by: [],
      link: '/attendance',
      created_at: new Date().toISOString(),
    }, ...db.notifications];
  }

  return sendSuccess(res, { ...newRecord, is_late: isLate }, 'Checked in successfully.');
};

const checkOut = (req, res) => {
  if (!req.user.employee_id) {
    return sendError(res, 403, 'Only employees can check out.');
  }

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const checkOutTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  const record = db.attendance.find(
    r => r.employee_id === req.user.employee_id && r.date === today
  );

  if (!record || !record.check_in) {
    return sendError(res, 400, 'No check-in record found for today.');
  }
  if (record.check_out) {
    return sendError(res, 400, 'Already checked out today.');
  }

  const [inH, inM] = record.check_in.split(':').map(Number);
  const totalMinutes = (now.getHours() * 60 + now.getMinutes()) - (inH * 60 + inM);
  const workingHours = Math.max(0, totalMinutes / 60).toFixed(1);

  db.attendance = db.attendance.map(r =>
    r.id === record.id
      ? { ...r, check_out: checkOutTime, working_hours: parseFloat(workingHours) }
      : r
  );

  const updated = db.attendance.find(r => r.id === record.id);
  return sendSuccess(res, updated, 'Checked out successfully.');
};

const getTodayStatus = (req, res) => {
  if (!req.user.employee_id) {
    return sendSuccess(res, { checked_in: false, checked_out: false, record: null });
  }
  const today = new Date().toISOString().split('T')[0];
  const record = db.attendance.find(
    r => r.employee_id === req.user.employee_id && r.date === today
  ) || null;

  return sendSuccess(res, {
    checked_in: !!record?.check_in,
    checked_out: !!record?.check_out,
    record,
  });
};

module.exports = { getAll, checkIn, checkOut, getTodayStatus };
