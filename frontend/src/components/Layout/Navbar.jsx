import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Bell, Search, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getNotifications, markRead, markAllRead } from '../../api/notifications';
import { formatDistanceToNow } from 'date-fns';

const TYPE_COLORS = {
  late_checkin:   'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  leave_request:  'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  leave_approved: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  leave_rejected: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

export default function Navbar({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const [notifs, setNotifs]         = useState([]);
  const [unread, setUnread]         = useState(0);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [userOpen, setUserOpen]     = useState(false);
  const notifRef = useRef(null);
  const userRef  = useRef(null);

  const loadNotifs = async () => {
    try {
      const res = await getNotifications();
      setNotifs(res.data.data.notifications || []);
      setUnread(res.data.data.unread_count || 0);
    } catch {}
  };

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (n) => {
    if (!n.is_read) {
      await markRead(n.id);
      loadNotifs();
    }
    if (n.link) { navigate(n.link); setNotifOpen(false); }
  };

  const handleMarkAll = async () => {
    await markAllRead();
    loadNotifs();
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="h-16 bg-white dark:bg-card-dark border-b border-slate-100 dark:border-slate-700/50 flex items-center px-4 gap-4 sticky top-0 z-10">
      {/* Menu button (mobile) */}
      <button onClick={onMenuClick} className="btn-icon lg:hidden text-slate-600 dark:text-slate-300">
        <Menu size={20} />
      </button>

      {/* Page title */}
      <h1 className="text-base font-semibold text-slate-800 dark:text-white hidden sm:block">{title}</h1>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button onClick={toggle} className="btn-icon text-slate-600 dark:text-slate-300" title="Toggle theme">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(o => !o); setUserOpen(false); }}
            className="btn-icon text-slate-600 dark:text-slate-300 relative"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 card shadow-modal animate-slide-up z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <span className="font-semibold text-sm text-slate-800 dark:text-white">Notifications</span>
                {unread > 0 && (
                  <button onClick={handleMarkAll} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifs.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-6">No notifications</p>
                ) : notifs.slice(0, 8).map(n => (
                  <button
                    key={n.id}
                    onClick={() => handleMarkRead(n)}
                    className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors text-left border-b border-slate-50 dark:border-slate-700/30 ${!n.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  >
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.is_read ? 'bg-primary-500' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-5">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                <Link to="/notifications" onClick={() => setNotifOpen(false)}
                  className="block text-center text-xs text-primary-600 hover:text-primary-700 font-medium py-1">
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setUserOpen(o => !o); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: user?.avatar_color || '#3B82F6' }}>
              {initials}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block max-w-[100px] truncate">
              {user?.name?.split(' ')[0]}
            </span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {userOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 card shadow-modal animate-slide-up z-50 py-1">
              <Link to="/profile" onClick={() => setUserOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <User size={15} /> Profile
              </Link>
              <hr className="my-1 border-slate-100 dark:border-slate-700" />
              <button onClick={logout}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
