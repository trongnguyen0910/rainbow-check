const db = require('../data/mockData');
const { sendSuccess } = require('../utils/response');

const getStats = (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const activeEmployees = db.employees.filter(e => e.status === 'active');

  // Today's attendance
  const todayRecords = db.attendance.filter(r => r.date === today);
  const presentToday = todayRecords.filter(r => r.check_in).length;
  const lateToday = todayRecords.filter(r => r.status === 'late').length;
  const absentToday = todayRecords.filter(r => r.status === 'absent').length;

  // On leave today
  const onLeaveToday = db.leaveRequests.filter(l =>
    l.status === 'approved' &&
    l.start_date <= today &&
    l.end_date >= today
  ).length;

  // Pending leave requests
  const pendingLeaves = db.leaveRequests.filter(l => l.status === 'pending').length;

  // Weekly attendance trend (last 7 working days)
  const weeklyTrend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    const dateStr = d.toISOString().split('T')[0];
    const dayRecords = db.attendance.filter(r => r.date === dateStr);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    weeklyTrend.push({
      date: dateStr,
      day: dayNames[dow],
      present: dayRecords.filter(r => r.check_in).length,
      late: dayRecords.filter(r => r.status === 'late').length,
      absent: dayRecords.filter(r => r.status === 'absent').length,
    });
  }

  // Monthly attendance (last 6 months)
  const monthlyStats = [];
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthRecords = db.attendance.filter(r => r.date.startsWith(monthStr));
    const workingDays = [...new Set(monthRecords.map(r => r.date))].length;

    monthlyStats.push({
      month: `${monthNames[month]} ${year}`,
      present: monthRecords.filter(r => r.check_in).length,
      late: monthRecords.filter(r => r.status === 'late').length,
      absent: monthRecords.filter(r => r.status === 'absent').length,
      working_days: workingDays,
    });
  }

  // Department summary
  const departmentStats = db.departments.map(dept => {
    const deptEmployees = activeEmployees.filter(e => e.department_id === dept.id);
    const deptTodayRecords = todayRecords.filter(r => r.department_id === dept.id);
    return {
      department: dept.name,
      total: deptEmployees.length,
      present: deptTodayRecords.filter(r => r.check_in).length,
      late: deptTodayRecords.filter(r => r.status === 'late').length,
    };
  });

  // Recent attendance (last 5 check-ins)
  const recentAttendance = db.attendance
    .filter(r => r.check_in)
    .sort((a, b) => {
      const dateComp = b.date.localeCompare(a.date);
      if (dateComp !== 0) return dateComp;
      return (b.check_in || '').localeCompare(a.check_in || '');
    })
    .slice(0, 5);

  return sendSuccess(res, {
    overview: {
      total_employees: activeEmployees.length,
      present_today: presentToday,
      late_today: lateToday,
      absent_today: absentToday,
      on_leave: onLeaveToday,
      pending_leaves: pendingLeaves,
      attendance_rate: activeEmployees.length > 0
        ? Math.round((presentToday / activeEmployees.length) * 100)
        : 0,
    },
    weekly_trend: weeklyTrend,
    monthly_stats: monthlyStats,
    department_stats: departmentStats,
    recent_attendance: recentAttendance,
  });
};

module.exports = { getStats };
