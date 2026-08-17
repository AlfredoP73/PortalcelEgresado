import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Briefcase, CheckCheck, Building2 } from 'lucide-react';
import { getNotifications, markNotificationRead, type MatchNotification } from '../api';

const REFRESH_MS = 60000;

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora mismo';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} d`;
};

export default function NotificationsBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<MatchNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;
  const graduateId = user?.id;
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = async () => {
    if (!graduateId) return;
    try {
      const { data } = await getNotifications(graduateId);
      setNotifications(data);
    } catch {
      // silencioso: si falla, se conserva lo que ya había
    }
  };

  useEffect(() => {
    if (!graduateId) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, REFRESH_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graduateId]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const handleOpen = async () => {
    setOpen((prev) => !prev);
    if (!open) {
      setLoading(true);
      await fetchNotifications();
      setLoading(false);
    }
  };

  const handleClickNotification = async (n: MatchNotification) => {
    setOpen(false);
    if (!n.is_read) {
      markNotificationRead(n.id).catch(() => undefined);
      setNotifications((prev) => prev.map((p) => (p.id === n.id ? { ...p, is_read: true } : p)));
    }
    navigate('/jobs');
  };

  const handleMarkAll = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    await Promise.all(unread.map((n) => markNotificationRead(n.id).catch(() => undefined)));
    setNotifications((prev) => prev.map((p) => ({ ...p, is_read: true })));
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="p-2 rounded-lg transition-all duration-200 relative"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-secondary)',
        }}
        title="Notificaciones"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
            style={{ backgroundColor: '#e11d48' }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-[360px] max-h-[420px] overflow-hidden rounded-xl shadow-xl z-50 flex flex-col"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border-color)' }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
              Notificaciones de afinidad
            </p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="flex items-center gap-1 text-xs font-semibold hover:opacity-80 transition-opacity"
                style={{ color: 'var(--color-brand-500)' }}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar todas leídas
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {loading && notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                Cargando...
              </p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                No tienes notificaciones todavía.
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClickNotification(n)}
                  className="w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-[var(--bg-hover)]"
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: n.is_read ? 'transparent' : 'var(--bg-surface-soft)',
                  }}
                >
                  <span
                    className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#dcfce7' }}
                  >
                    <Briefcase className="w-4 h-4" style={{ color: '#15803d' }} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold truncate" style={{ color: 'var(--text-main)' }}>
                      {n.job_title ?? 'Vacante'}
                    </span>
                    <span className="block text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                      <Building2 className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{n.company_name ?? 'Empresa'}</span>
                    </span>
                    <span className="block text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      {timeAgo(n.sent_at)}
                    </span>
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0"
                    style={{ backgroundColor: '#dcfce7', color: '#15803d' }}
                  >
                    {Number(n.score).toFixed(0)}%
                  </span>
                  {!n.is_read && (
                    <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#22a86e' }} />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}