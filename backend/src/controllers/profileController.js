const bcrypt = require('bcryptjs');
const db = require('../data/mockData');
const { sendSuccess, sendError } = require('../utils/response');

const getProfile = (req, res) => {
  const { password: _, ...user } = req.user;
  let employee = null;
  if (user.employee_id) {
    employee = db.employees.find(e => e.id === user.employee_id) || null;
  }
  const balance = employee
    ? db.leaveBalances.find(b => b.employee_id === employee.id) || null
    : null;

  return sendSuccess(res, { user, employee, leave_balance: balance });
};

const updateProfile = (req, res) => {
  const { name, email, phone } = req.body;
  const userIdx = db.users.findIndex(u => u.id === req.user.id);
  if (userIdx === -1) return sendError(res, 404, 'User not found.');

  if (name) db.users[userIdx].name = name;
  if (email) db.users[userIdx].email = email;

  // Update employee record if linked
  if (req.user.employee_id) {
    const empIdx = db.employees.findIndex(e => e.id === req.user.employee_id);
    if (empIdx !== -1) {
      if (name) db.employees[empIdx].name = name;
      if (email) db.employees[empIdx].email = email;
      if (phone !== undefined) db.employees[empIdx].phone = phone;
    }
  }

  const { password: _, ...updatedUser } = db.users[userIdx];
  return sendSuccess(res, updatedUser, 'Profile updated successfully.');
};

const uploadAvatar = (req, res) => {
  const { avatar_color } = req.body;
  const colors = ['#3B82F6','#EC4899','#8B5CF6','#10B981','#F59E0B','#EF4444','#06B6D4','#F97316','#14B8A6'];

  if (avatar_color && colors.includes(avatar_color)) {
    const userIdx = db.users.findIndex(u => u.id === req.user.id);
    if (userIdx !== -1) db.users[userIdx].avatar_color = avatar_color;

    if (req.user.employee_id) {
      const empIdx = db.employees.findIndex(e => e.id === req.user.employee_id);
      if (empIdx !== -1) db.employees[empIdx].avatar_color = avatar_color;
    }
  }

  return sendSuccess(res, { avatar_color }, 'Avatar updated successfully.');
};

module.exports = { getProfile, updateProfile, uploadAvatar };
