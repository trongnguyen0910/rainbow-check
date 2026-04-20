import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, AlertCircle, CalendarCheck, ClipboardList } from 'lucide-react';
import { getNotifications, markRead, markAllRead } from '../api/notifications';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  late_checkin:   { Icon: AlertCircle,   cls: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
  leave_request:  { Icon: ClipboardList, cls: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
  leave_approved: { Icon: CalendarCheck, cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
  leave_rejected: { Icon: AlertCircle,   cls: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
};

export default function Notifications() {
  const [notifs, setNotifs]   = useState([]);
  const [unread, setUnread]   = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      setNotifs(res.data.data.notifications || []);
      setUnread(res.data.data.unread_count || 0);
    } catch { toast.error('Không thể tải thông báo'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    await markRead(id);
    load();
  };

  const handleMarkAll = async () => {
    await markAllRead();
    load();
    toast.success('Đã đánh dấu tất cả là đã đọc');
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Thông báo</h1>
          <p className="page-subtitle">{unread} chưa đọc</p>
        </div>
        {unread > 0 && (
          <button onClick={handleMarkAll} className="btn-secondary gap-2 text-sm">
            <CheckCheck size={15} /> Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner border-slate-200 border-t-primary-500 w-7 h-7" />
          </div>
        ) : notifs.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={44} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-400">Không có thông báo nào!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {notifs.map(n => {
              const cfg = TYPE_ICONS[n.type] || TYPE_ICONS.leave_request;
              const Icon = cfg.Icon;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 px-5 py-4 transition-colors ${!n.is_read ? 'bg-blue-50/30 dark:bg-blue-900/5' : 'hover:bg-slate-50 dark:hover:bg-slate-700/20'}`}
                >
                  <div className={`w-10 h-10 rounded-xl ${cfg.cls} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-5 ${!n.is_read ? 'font-semibold text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: vi })}
                    </p>
                  </div>
                  {!n.is_read && (
                    <button onClick={() => handleMarkRead(n.id)} className="btn-icon text-slate-400 hover:text-primary-600 flex-shrink-0" title="Đánh dấu đã đọc">
                      <Check size={15} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
