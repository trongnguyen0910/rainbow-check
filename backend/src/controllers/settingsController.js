const db = require('../data/mockData');
const { sendSuccess, sendError } = require('../utils/response');

const getSettings = (req, res) => {
  return sendSuccess(res, db.settings);
};

const updateSettings = (req, res) => {
  const allowed = [
    'company_name', 'work_start', 'work_end',
    'late_threshold_minutes', 'timezone', 'work_days',
    'annual_leave_days', 'sick_leave_days', 'personal_leave_days',
  ];

  const updates = {};
  allowed.forEach(key => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  if (Object.keys(updates).length === 0) {
    return sendError(res, 400, 'No valid settings provided.');
  }

  db.settings = { ...db.settings, ...updates };
  return sendSuccess(res, db.settings, 'Settings updated successfully.');
};

const getDepartments = (req, res) => {
  return sendSuccess(res, db.departments);
};

module.exports = { getSettings, updateSettings, getDepartments };
