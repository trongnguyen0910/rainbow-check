const db = require('../data/mockData');
const { sendSuccess } = require('../utils/response');

const getAll = (req, res) => {
  const userNotifications = db.notifications.filter(n => n.user_ids.includes(req.user.id));
  const unreadCount = userNotifications.filter(n => !n.read_by.includes(req.user.id)).length;

  const enriched = userNotifications.map(n => ({
    ...n,
    is_read: n.read_by.includes(req.user.id),
  })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return sendSuccess(res, { notifications: enriched, unread_count: unreadCount });
};

const markRead = (req, res) => {
  const { id } = req.params;
  db.notifications = db.notifications.map(n => {
    if (n.id === id && !n.read_by.includes(req.user.id)) {
      return { ...n, read_by: [...n.read_by, req.user.id] };
    }
    return n;
  });
  return sendSuccess(res, null, 'Marked as read.');
};

const markAllRead = (req, res) => {
  db.notifications = db.notifications.map(n => {
    if (n.user_ids.includes(req.user.id) && !n.read_by.includes(req.user.id)) {
      return { ...n, read_by: [...n.read_by, req.user.id] };
    }
    return n;
  });
  return sendSuccess(res, null, 'All notifications marked as read.');
};

module.exports = { getAll, markRead, markAllRead };
