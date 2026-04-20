import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const PAGE_TITLES = {
  '/dashboard':     'Tổng quan',
  '/employees':     'Quản lý nhân viên',
  '/attendance':    'Chấm công',
  '/leaves':        'Quản lý nghỉ phép',
  '/reports':       'Báo cáo & Thống kê',
  '/notifications': 'Thông báo',
  '/settings':      'Cài đặt',
  '/profile':       'Hồ sơ của tôi',
};

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Rainbow AMS';

  return (
    <div className="flex h-screen overflow-hidden bg-surface dark:bg-surface-dark">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
