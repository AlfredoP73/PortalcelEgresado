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

  const currentTitle = pageTitles[location.pathname]
    ?? (roleName === 'COMPANY' ? 'Portal Empresa' : 'Portal Administrativo');

  return (
    <div className="min-h-screen flex font-sans" style={{ backgroundColor: 'var(--bg-main)' }}>
      {/* ── Sidebar ── */}
      <aside
        className="w-[252px] flex flex-col flex-shrink-0 z-20 relative overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: 'var(--bg-sidebar)' }}
      >
        {/* Subtle glow */}
        <div className="absolute top-0 left-0 w-full h-28 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top left, rgba(34,168,110,0.15), transparent)' }} />

        {/* Logo */}
        <div className="h-[68px] flex items-center gap-3 px-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center">
            <img src="/logo.png" alt="UPC" className="w-8 h-8 object-contain" />
          </div>
          <div className="leading-tight min-w-0">
            <p className="text-white font-bold text-[13px] truncate">Portal Empleo</p>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>Universidad UPC</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-5 pb-2 space-y-0.5 relative z-10 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase px-3 mb-3" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>
            {roleName === 'COMPANY' ? 'Módulo Empresa' : 'Módulo Admin'}
          </p>
          {navItems.map(({ name, path, icon: Icon }) => {
            const active = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={twMerge(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 group relative',
                  active
                    ? 'text-white'
                    : 'hover:text-white'
                )}
                style={{
                  backgroundColor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                }}
              >
                <Icon className="w-[17px] h-[17px] flex-shrink-0" style={{ color: active ? '#7cdaac' : 'rgba(255,255,255,0.35)' }} />
                <span className="flex-1 truncate">{name}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ backgroundColor: '#7cdaac' }} />}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl mb-2" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #158a58, #22a86e)' }}>
              {user?.email?.[0]?.toUpperCase() ?? <UserCircle className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[12px] font-semibold truncate">{user?.email ?? 'Usuario'}</p>
              <p className="text-[10px] font-semibold uppercase" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>{roleName}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all group"
            style={{ color: 'rgba(252,165,165,0.7)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden relative transition-colors duration-300" style={{ backgroundColor: 'var(--bg-main)' }}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-100 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--pattern-dot) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Header */}
        <header
          className="h-[64px] backdrop-blur-xl flex items-center px-8 gap-4 flex-shrink-0 z-10 sticky top-0 transition-colors duration-300"
          style={{ backgroundColor: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)' }}
        >
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>{currentTitle}</h1>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
            }}
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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