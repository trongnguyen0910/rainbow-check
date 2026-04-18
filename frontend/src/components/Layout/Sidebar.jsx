import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, CalendarCheck, FileText,
  ClipboardList, BarChart3, Settings, User, X, LogOut,
} from 'lucide-react';

const NAV = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard',   roles: ['admin','hr','manager','employee'] },
  { to: '/employees',    icon: Users,           label: 'Employees',   roles: ['admin','hr','manager'] },
  { to: '/attendance',   icon: CalendarCheck,   label: 'Attendance',  roles: ['admin','hr','manager','employee'] },
  { to: '/leaves',       icon: ClipboardList,   label: 'Leave',       roles: ['admin','hr','manager','employee'] },
  { to: '/reports',      icon: BarChart3,       label: 'Reports',     roles: ['admin','hr'] },
  { to: '/settings',     icon: Settings,        label: 'Settings',    roles: ['admin'] },
  { to: '/profile',      icon: User,            label: 'Profile',     roles: ['admin','hr','manager','employee'] },
];

const ROLE_COLORS = {
  admin: 'bg-primary-500',
  hr: 'bg-emerald-500',
  manager: 'bg-purple-500',
  employee: 'bg-amber-500',
};

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const filteredNav = NAV.filter(n => n.roles.includes(user?.role));

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-30 w-64 bg-sidebar dark:bg-sidebar-dark
        flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Rainbow AMS</p>
              <p className="text-slate-400 text-xs">Attendance System</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Main Menu
          </p>
          {filteredNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
            <div className={`w-8 h-8 rounded-lg ${user?.avatar_color ? '' : ROLE_COLORS[user?.role]} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}
              style={user?.avatar_color ? { backgroundColor: user.avatar_color } : {}}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-slate-400 text-xs capitalize">{user?.role}</p>
            </div>
            <button onClick={logout} className="text-slate-400 hover:text-red-400 transition-colors" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
