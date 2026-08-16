import { type ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2, Briefcase, LayoutDashboard,
  LogOut, ChevronRight, Sun, Moon, UserCircle
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface LayoutProps { children: ReactNode }

const getNavItems = (role: string) => {
  const allItems = [
    { name: role === 'COMPANY' ? 'Mi Empresa' : 'Directorio Empresas', path: '/companies', icon: Building2, roles: ['ADMIN', 'COMPANY'] },
    { name: 'Vacantes', path: '/job-offers', icon: Briefcase, roles: ['ADMIN', 'COMPANY'] },
    { name: 'Candidatos', path: '/kanban', icon: LayoutDashboard, roles: ['ADMIN', 'COMPANY'] },
  ];
  return allItems.filter(item => item.roles.includes(role));
};

const pageTitles: Record<string, string> = {
  '/companies': 'Directorio de Empresas',
  '/job-offers': 'Ofertas Laborales',
  '/kanban': 'Gestión de Candidatos',
};

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;
  const roleName = user?.role_name || '';

  const navItems = getNavItems(roleName);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const currentTitle = pageTitles[location.pathname] ?? (roleName === 'COMPANY' ? 'Portal Empresa' : 'Portal Administrativo');

  return (
    <div className="min-h-screen bg-surface-soft flex font-sans">
      {/* ── Sidebar ── */}
      <aside
        className="w-[260px] flex flex-col flex-shrink-0 z-20 relative overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: 'var(--color-sidebar)' }}
      >
        {/* Decorative glows */}
        <div className="absolute top-0 left-0 w-full h-32 bg-brand-500/10 blur-[60px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-brand-400/5 blur-[80px] pointer-events-none" />

        {/* Logo */}
        <div className="h-[72px] flex items-center gap-3 px-5 border-b border-white/8 relative z-10">
          <img src="/logo.png" alt="UPC" className="w-10 h-10 flex-shrink-0" />
          <div className="leading-tight min-w-0">
            <p className="text-white font-bold text-[13px] tracking-wide truncate">Portal Empleo</p>
            <p className="text-brand-300/70 text-[11px] font-medium truncate">Universidad UPC</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 relative z-10">
          <p className="text-brand-400/60 text-[10px] font-bold uppercase tracking-[0.2em] px-3 mb-4">
            {roleName === 'COMPANY' ? 'Módulo Empresa' : 'Módulo Admin'}
          </p>
          {navItems.map(({ name, path, icon: Icon }) => {
            const active = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={twMerge(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 group relative",
                  active
                    ? 'bg-white/12 text-white shadow-sm'
                    : 'text-brand-200/70 hover:bg-white/6 hover:text-white'
                )}
              >
                <Icon className={twMerge(
                  "w-[18px] h-[18px] flex-shrink-0 transition-all duration-200",
                  active ? "text-brand-300" : "text-brand-400/50 group-hover:text-brand-300"
                )} />
                <span className="flex-1 truncate">{name}</span>
                {active && (
                  <ChevronRight className="w-3.5 h-3.5 text-brand-300/60" />
                )}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-400 rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="p-3 border-t border-white/6 relative z-10">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2 bg-black/15 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white text-sm font-bold shadow-inner flex-shrink-0">
              {user?.email?.[0]?.toUpperCase() ?? <UserCircle className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[13px] font-semibold truncate">{user?.email ?? 'Usuario'}</p>
              <p className="text-brand-300/60 text-[11px] font-semibold uppercase tracking-wider">{roleName}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-red-300/70 hover:bg-red-500/10 hover:text-red-200 text-[13px] font-semibold transition-all group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden relative transition-colors duration-300">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none transition-opacity duration-300"
          style={{ backgroundImage: 'radial-gradient(var(--color-pattern) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {/* Header */}
        <header
          className="h-[64px] backdrop-blur-xl flex items-center px-8 gap-4 flex-shrink-0 z-10 sticky top-0 transition-colors duration-300"
          style={{ backgroundColor: 'var(--color-header-bg)', borderBottom: '1px solid var(--color-header-border)' }}
        >
          <div className="flex-1">
            <h1 className="text-xl font-bold text-ink tracking-tight">{currentTitle}</h1>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="relative p-2 rounded-lg text-ink-tertiary hover:text-brand-600 transition-all duration-200"
            style={{ backgroundColor: 'var(--color-btn-bg)', border: '1px solid var(--color-border)' }}
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-8 relative z-0">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}