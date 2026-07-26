import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { Button } from '../components/ui/button';
import ExponentiaBackground from '../components/ExponentiaBackground';
import { backgroundMusic } from '../utils/backgroundMusic';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, checkSession } = useAdminStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.title = 'Admin Dashboard - Exponentia';
    backgroundMusic.pause();
    return () => backgroundMusic.play();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !checkSession()) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, checkSession, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen flex overflow-hidden relative">
      <ExponentiaBackground overlayOpacity={0.4} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 shrink-0 w-64 h-full flex flex-col bg-background/80 backdrop-blur-md border-r border-border/50
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
          <img src="/icon-192.png" alt="Exponentia" className="w-8 h-8 rounded-lg" />
          <div>
            <h2 className="font-orbitron font-bold text-sm">Exponentia</h2>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>
        </div>
        <AdminSidebar onNavClick={() => setSidebarOpen(false)} />
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden fixed top-3 left-3 z-30 bg-background/80 backdrop-blur-sm border border-border/50"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        <div className="p-4 md:p-6">
          <h1 className="font-orbitron font-bold text-lg mb-4">
            {getPageTitle(location.pathname)}
          </h1>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function getPageTitle(pathname: string): string {
  if (pathname === '/admin') return 'Overview';
  if (pathname === '/admin/students') return 'Students';
  if (pathname.startsWith('/admin/students/')) return 'Student Detail';
  if (pathname === '/admin/questions') return 'Question Bank';
  if (pathname === '/admin/settings') return 'Settings';
  return 'Dashboard';
}
