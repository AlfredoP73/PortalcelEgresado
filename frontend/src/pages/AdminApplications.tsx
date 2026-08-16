import { useState, useEffect } from 'react';
import { graduatesApi } from '../api';
import { FileText, Building2, UserCircle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface Application {
  id: number;
  job_offer_id: number;
  graduate_id: number;
  application_date: string;
  status: string;
  job_offer?: {
    title: string;
    company: { name: string };
  };
}

export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await graduatesApi.get('/admin/applications');
      setApplications(res.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>Reporte Global de Postulaciones</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Todas las postulaciones de todos los egresados a nivel del sistema.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 text-ink-tertiary mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-ink">No hay postulaciones registradas</h3>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--bg-muted)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-6 py-4 font-bold text-ink-secondary uppercase text-[11px] tracking-wider">Vacante / Empresa</th>
                  <th className="px-6 py-4 font-bold text-ink-secondary uppercase text-[11px] tracking-wider">ID Egresado</th>
                  <th className="px-6 py-4 font-bold text-ink-secondary uppercase text-[11px] tracking-wider">Fecha</th>
                  <th className="px-6 py-4 font-bold text-ink-secondary uppercase text-[11px] tracking-wider text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-[var(--bg-muted)] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-ink">{app.job_offer?.title}</p>
                      <p className="text-xs text-ink-secondary flex items-center gap-1 mt-0.5"><Building2 className="w-3 h-3" /> {app.job_offer?.company.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 font-semibold text-ink"><UserCircle className="w-4 h-4 text-ink-secondary" /> {app.graduate_id}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-ink">{new Date(app.application_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={twMerge("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-block", 
                        app.status.toUpperCase() === 'POSTULADO' ? "bg-blue-50 text-blue-600 border border-blue-200" :
                        app.status.toUpperCase() === 'EN_EVALUACION' ? "bg-yellow-50 text-yellow-600 border border-yellow-200" :
                        app.status.toUpperCase() === 'CONTRATADO' ? "bg-green-50 text-green-600 border border-green-200" :
                        "bg-red-50 text-red-600 border border-red-200"
                      )}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
