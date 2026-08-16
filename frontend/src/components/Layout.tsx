import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2, Briefcase, LayoutDashboard,
  GraduationCap, LogOut, ChevronRight, Bell,
} from 'lucide-react';

interface LayoutProps { children: ReactNode }

const navItems = [
  { name: 'Empresas', path: '/companies', icon: Building2 },
  { name: 'Vacantes', path: '/job-offers', icon: Briefcase },
  { name: 'Kanban', path: '/kanban', icon: LayoutDashboard },
];

// Título de cada sección para el header
const pageTitles: Record<string, string> = {
  '/companies': 'Directorio de Empresas',
  '/job-offers': 'Ofertas Laborales',
  '/kanban': 'Tablero Kanban',
};

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const currentTitle = pageTitles[location.pathname] ?? 'Portal Egresados';

  return (
    <div className="min-h-screen bg-surface-soft flex">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-60 bg-brand-900 flex flex-col flex-shrink-0">

        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-brand-800">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-white font-semibold text-sm">Portal Egresados</p>
            <p className="text-brand-400 text-xs">UPC</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 mt-2">
          <p className="text-brand-500 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
            Módulo 2
          </p>
          {navItems.map(({ name, path, icon: Icon }) => {
            const active = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${active
                    ? 'bg-brand-600 text-white'
                    : 'text-brand-300 hover:bg-brand-800 hover:text-white'
                  }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{name}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="p-3 border-t border-brand-800">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.email ?? 'Usuario'}</p>
              <p className="text-brand-400 text-[10px]">{user?.role_name ?? ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-brand-400 hover:bg-brand-800 hover:text-white text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Contenido principal ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center px-8 gap-4 flex-shrink-0 shadow-card">
          <div className="flex-1">
            <h1 className="text-base font-semibold text-ink">{currentTitle}</h1>
          </div>
          <button className="relative p-2 rounded-lg text-ink-tertiary hover:bg-surface-muted transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}