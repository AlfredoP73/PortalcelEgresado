import { useEffect, useState } from 'react';
import { getCompanyDashboard } from '../api/dashboardServices';
import type { CompanyDashboardData } from '../api/dashboardServices';
import { Building2, Users, Briefcase, Clock, Eye, Percent, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  PieChart,
  Pie,
  LabelList,
} from 'recharts';

const INDUSTRY_COLORS = [
  'var(--color-brand-500)',
  'var(--color-brand-400)',
  'var(--color-brand-300)',
  'var(--color-brand-600)',
  'var(--color-brand-700)',
];

export default function CompanyDashboard() {
  const [data, setData] = useState<CompanyDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const dashboardData = await getCompanyDashboard();
      setData(dashboardData);
    } catch (err: any) {
      console.error(err);
      toast.error('Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-ink-secondary">Cargando métricas de la empresa...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-sm text-ink-secondary">No hay datos disponibles todavía.</p>
        <button onClick={fetchData} className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl text-ink hover:bg-[var(--bg-hover)] transition-colors">
          Intentar nuevamente
        </button>
      </div>
    );
  }

  const { summary, hiring_funnel, applicants_by_program, applications_timeline, frequent_skills } = data;

  const KPI_ICONS = [Briefcase, Users, Building2, Clock, Percent, Eye];

  const kpis = [
    { title: 'Ofertas Activas', value: summary.active_offers, description: 'Vacantes publicadas' },
    { title: 'Total Postulantes', value: summary.total_applicants, description: 'Candidatos en proceso' },
    { title: 'Candidatos Contratados', value: summary.hired_candidates, description: 'Egresados integrados' },
    { title: 'Tiempo Promedio (Días)', value: summary.average_hiring_time_days, description: 'Días hasta cerrar oferta' },
    { title: 'Tasa de Conversión', value: `${summary.conversion_rate}%`, description: 'Contratados / Postulantes' },
    { title: 'Visitas a Vacantes', value: summary.visits_to_offers, description: 'Impacto visual de ofertas' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <h1 className="page-title">Dashboard Empresa</h1>
        <button onClick={fetchData} className="btn-outline p-2" title="Actualizar">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi, idx) => {
          const Icon = KPI_ICONS[idx];
          return (
            <div key={idx} className="card p-6">
              <div className="flex items-start justify-between">
                <p className="label-upper">{kpi.title}</p>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: '#dcfce7' }}>
                  <Icon className="w-5 h-5" style={{ color: '#15803d' }} />
                </span>
              </div>
              <p className="kpi-value mt-3">{kpi.value}</p>
              <p className="mt-2 text-xs text-ink-tertiary">{kpi.description}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Embudo de Contratación */}
        <section className="card p-5">
          <div>
            <h2 className="text-base font-semibold text-ink">Embudo de Contratación</h2>
            <p className="mt-1 text-xs text-ink-secondary">Conversión por cada etapa del proceso</p>
          </div>
          {hiring_funnel?.length ? (
            <div className="mt-4 h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hiring_funnel} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="status" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} width={100} />
                  <RechartsTooltip cursor={{ fill: 'var(--bg-hover)' }} contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)' }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={40}>
                    {hiring_funnel.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={INDUSTRY_COLORS[index % INDUSTRY_COLORS.length]} />
                    ))}
                    <LabelList dataKey="count" position="right" offset={8} fill="var(--text-secondary)" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center"><p className="text-sm text-ink-secondary">No hay datos disponibles.</p></div>
          )}
        </section>

        {/* Evolución Mensual */}
        <section className="card p-5">
          <div>
            <h2 className="text-base font-semibold text-ink">Volumen de Postulantes Mensual</h2>
            <p className="mt-1 text-xs text-ink-secondary">Candidatos aplicados por mes</p>
          </div>
          {applications_timeline?.length ? (
            <div className="mt-4 h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={applications_timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-brand-600)" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="var(--color-brand-600)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)' }} />
                  <Area type="monotone" dataKey="count" stroke="var(--color-brand-600)" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center"><p className="text-sm text-ink-secondary">No hay datos disponibles.</p></div>
          )}
        </section>

        {/* Distribución por Programa */}
        <section className="card p-5">
          <div>
            <h2 className="text-base font-semibold text-ink">Postulantes por Programa</h2>
            <p className="mt-1 text-xs text-ink-secondary">Carreras de origen de sus candidatos</p>
          </div>
          {applicants_by_program?.length ? (
            <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
               <div className="h-[260px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={applicants_by_program} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="count" nameKey="program">
                       {applicants_by_program.map((_entry, index) => (
                         <Cell key={`cell-${index}`} fill={INDUSTRY_COLORS[index % INDUSTRY_COLORS.length]} />
                       ))}
                     </Pie>
                     <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)' }} />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
               <div className="flex flex-col justify-center gap-3">
                 {applicants_by_program.map((item, index) => (
                   <div key={item.program} className="flex items-center justify-between gap-3">
                     <div className="flex items-center gap-2">
                       <span className="h-2.5 w-2.5 rounded-full min-w-[10px]" style={{ backgroundColor: INDUSTRY_COLORS[index % INDUSTRY_COLORS.length] }} />
                       <span className="text-sm text-ink-secondary truncate" title={item.program}>{item.program}</span>
                     </div>
                     <span className="text-sm font-semibold text-ink">{item.count}</span>
                   </div>
                 ))}
               </div>
             </div>
          ) : (
             <div className="flex h-[300px] items-center justify-center"><p className="text-sm text-ink-secondary">No hay datos disponibles.</p></div>
          )}
        </section>

        {/* Habilidades más frecuentes */}
        <section className="card p-5">
          <div>
            <h2 className="text-base font-semibold text-ink">Habilidades Frecuentes en Postulantes</h2>
            <p className="mt-1 text-xs text-ink-secondary">Competencias clave que más se repiten</p>
          </div>
          {frequent_skills?.length ? (
            <div className="mt-4 h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frequent_skills} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="skill" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} width={100} />
                  <RechartsTooltip cursor={{ fill: 'var(--bg-hover)' }} contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-main)' }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={40}>
                    {frequent_skills.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={INDUSTRY_COLORS[(index+2) % INDUSTRY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center"><p className="text-sm text-ink-secondary">No hay datos disponibles.</p></div>
          )}
        </section>
      </div>
    </div>
  );
}