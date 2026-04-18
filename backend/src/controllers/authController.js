const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../data/mockData');
const { sendSuccess, sendError } = require('../utils/response');

const login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return sendError(res, 400, 'Username and password are required.');
  }

  const user = db.users.find(u => u.username === username);
  if (!user) return sendError(res, 401, 'Invalid username or password.');

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) return sendError(res, 401, 'Invalid username or password.');

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  // Get linked employee data if exists
  let employeeData = null;
  if (user.employee_id) {
    employeeData = db.employees.find(e => e.id === user.employee_id) || null;
  }

  const { password: _, ...userWithoutPassword } = user;
  return sendSuccess(res, {
    token,
    user: userWithoutPassword,
    employee: employeeData,
  }, 'Login successful.');
};

const getMe = (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user;
  let employeeData = null;
  if (req.user.employee_id) {
    employeeData = db.employees.find(e => e.id === req.user.employee_id) || null;
  }
  return sendSuccess(res, { user: userWithoutPassword, employee: employeeData });
};

const changePassword = (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return sendError(res, 400, 'Both current and new password are required.');
  }
  if (new_password.length < 6) {
    return sendError(res, 400, 'New password must be at least 6 characters.');
  }
  const user = db.users.find(u => u.id === req.user.id);
  if (!bcrypt.compareSync(current_password, user.password)) {
    return sendError(res, 400, 'Current password is incorrect.');
  }
  user.password = bcrypt.hashSync(new_password, 10);
  return sendSuccess(res, null, 'Password changed successfully.');
};

module.exports = { login, getMe, changePassword };
