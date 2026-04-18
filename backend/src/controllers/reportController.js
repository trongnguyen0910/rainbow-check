const db = require('../data/mockData');
const { sendSuccess, sendError } = require('../utils/response');

const getMonthlyReport = (req, res) => {
  const { year, month } = req.query;
  const now = new Date();
  const targetYear = parseInt(year) || now.getFullYear();
  const targetMonth = parseInt(month) || now.getMonth() + 1;
  const monthStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;

  const monthRecords = db.attendance.filter(r => r.date.startsWith(monthStr));
  const workingDays = [...new Set(monthRecords.map(r => r.date))].length;

  let employees = db.employees.filter(e => e.status === 'active');
  if (req.user.role === 'employee' && req.user.employee_id) {
    employees = employees.filter(e => e.id === req.user.employee_id);
  }

  const report = employees.map(emp => {
    const empRecords = monthRecords.filter(r => r.employee_id === emp.id);
    const presentDays = empRecords.filter(r => r.check_in).length;
    const lateDays = empRecords.filter(r => r.status === 'late').length;
    const absentDays = empRecords.filter(r => r.status === 'absent').length;
    const totalHours = empRecords.reduce((sum, r) => sum + (r.working_hours || 0), 0);

    return {
      employee_id: emp.id,
      employee_name: emp.name,
      department: emp.department,
      position: emp.position,
      working_days: workingDays,
      present_days: presentDays,
      late_days: lateDays,
      absent_days: absentDays,
      total_hours: parseFloat(totalHours.toFixed(1)),
      avg_hours_per_day: presentDays > 0 ? parseFloat((totalHours / presentDays).toFixed(1)) : 0,
      attendance_rate: workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0,
    };
  });

  const summary = {
    month: monthStr,
    working_days: workingDays,
    total_employees: employees.length,
    avg_attendance_rate: report.length > 0
      ? Math.round(report.reduce((s, r) => s + r.attendance_rate, 0) / report.length)
      : 0,
    total_present_records: report.reduce((s, r) => s + r.present_days, 0),
    total_late_records: report.reduce((s, r) => s + r.late_days, 0),
    total_absent_records: report.reduce((s, r) => s + r.absent_days, 0),
  };

  return sendSuccess(res, { summary, report });
};

const exportReport = (req, res) => {
  const xlsx = require('xlsx');
  const { year, month, format = 'xlsx' } = req.query;
  const now = new Date();
  const targetYear = parseInt(year) || now.getFullYear();
  const targetMonth = parseInt(month) || now.getMonth() + 1;
  const monthStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;

  const monthRecords = db.attendance.filter(r => r.date.startsWith(monthStr));
  const workingDays = [...new Set(monthRecords.map(r => r.date))].length;
  const employees = db.employees.filter(e => e.status === 'active');

  const data = employees.map(emp => {
    const empRecords = monthRecords.filter(r => r.employee_id === emp.id);
    const presentDays = empRecords.filter(r => r.check_in).length;
    const lateDays = empRecords.filter(r => r.status === 'late').length;
    const absentDays = empRecords.filter(r => r.status === 'absent').length;
    const totalHours = empRecords.reduce((sum, r) => sum + (r.working_hours || 0), 0);

    return {
      'Employee ID': emp.id,
      'Name': emp.name,
      'Department': emp.department,
      'Position': emp.position,
      'Working Days': workingDays,
      'Present Days': presentDays,
      'Late Days': lateDays,
      'Absent Days': absentDays,
      'Total Hours': parseFloat(totalHours.toFixed(1)),
      'Avg Hours/Day': presentDays > 0 ? parseFloat((totalHours / presentDays).toFixed(1)) : 0,
      'Attendance Rate (%)': workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0,
    };
  });

  const ws = xlsx.utils.json_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Attendance Report');

  const filename = `attendance_report_${monthStr}`;

  if (format === 'csv') {
    const csv = xlsx.utils.sheet_to_csv(ws);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    return res.send(csv);
  }

  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
  return res.send(buffer);
};

module.exports = { getMonthlyReport, exportReport };
