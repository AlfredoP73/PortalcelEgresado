import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { graduatesApi } from '../api';
import { Search, MapPin, Building2, Briefcase, CalendarDays, CheckCircle2, DollarSign } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface JobOffer {
  id: number;
  title: string;
  description: string;
  requirements: string;
  functions: string;
  salary_min: number;
  salary_max: number;
  closing_date: string;
  company: {
    name: string;
    sector?: { name: string };
    city?: { name: string };
  };
}

export default function JobBoard() {
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [applying, setApplying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [minSalaryFilter, setMinSalaryFilter] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await graduatesApi.get('/jobs');
      setJobs(res.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    try {
      setApplying(true);
      await graduatesApi.post('/applications', { job_offer_id: selectedJob.id });
      setSuccessMessage('¡Te has postulado exitosamente a esta vacante!');
      setTimeout(() => {
        setSuccessMessage('');
        setSelectedJob(null);
      }, 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al postularse');
    } finally {
      setApplying(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSalary = minSalaryFilter ? (job.salary_min && job.salary_min >= Number(minSalaryFilter)) : true;
    return matchSearch && matchSalary;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>Bolsa de Empleo</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Explora y postúlate a las mejores ofertas para tu perfil.</p>
        </div>
      </div>

      {/* Filters/Search */}
      <div className="card p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
          <input
            type="text"
            placeholder="Buscar por cargo o empresa..."
            className="input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-1 max-w-xs">
            <select 
              className="input w-full" 
              value={minSalaryFilter}
              onChange={(e) => setMinSalaryFilter(e.target.value)}
            >
              <option value="">Cualquier salario</option>
              <option value="1500000">Desde $1.5M</option>
              <option value="2500000">Desde $2.5M</option>
              <option value="4000000">Desde $4.0M</option>
            </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : (
        filteredJobs.length === 0 ? (
          <div className="card p-12 text-center">
            <Briefcase className="w-12 h-12 text-ink-tertiary mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-ink">No hay vacantes disponibles</h3>
            <p className="text-ink-secondary mt-2 max-w-md mx-auto">Actualmente no hay ofertas laborales que coincidan con tu búsqueda. Intenta con otros términos o vuelve más tarde.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map(job => (
              <div key={job.id} className="card p-6 flex flex-col hover:-translate-y-1 transition-all duration-300 group cursor-pointer" onClick={() => setSelectedJob(job)}>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-ink group-hover:text-brand-600 transition-colors line-clamp-1">{job.title}</h3>
                  <p className="text-ink-secondary font-medium mt-1 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" /> {job.company.name}
                  </p>
                </div>
                
                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-sm text-ink-tertiary">
                    <MapPin className="w-4 h-4 text-brand-500" />
                    <span>{job.company.city?.name || 'Ubicación no especificada'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-ink-tertiary">
                    <DollarSign className="w-4 h-4 text-brand-500" />
                    <span>
                      {job.salary_min && job.salary_max 
                        ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                        : 'Salario a convenir'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-ink-tertiary">
                    <CalendarDays className="w-4 h-4 text-brand-500" />
                    <span>Cierra: {new Date(job.closing_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <button className="w-full btn-ghost border border-brand-200 text-brand-700 bg-brand-50 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  Ver Detalles
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="w-full max-w-3xl max-h-full flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up" style={{ backgroundColor: 'var(--bg-modal)' }}>
            <div className="p-6 border-b border-brand-100 dark:border-gray-800 flex justify-between items-center bg-brand-50 dark:bg-gray-900/30">
              <h3 className="text-2xl font-bold font-heading text-ink">{selectedJob.title}</h3>
              <button onClick={() => setSelectedJob(null)} className="text-ink-tertiary hover:text-ink transition-colors p-2 hover:bg-black/5 rounded-full">
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-ink text-lg">{selectedJob.company.name}</h4>
                <p className="text-brand-600 font-medium text-sm">
                  {selectedJob.company.sector?.name || 'Sector no especificado'} • {selectedJob.company.city?.name || 'Ubicación no especificada'}
                </p>
              </div>

              {selectedJob.description && (
                <div>
                  <h4 className="font-bold text-ink mb-2">Descripción de la vacante</h4>
                  <p className="text-ink-secondary text-sm leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
                </div>
              )}
              {selectedJob.requirements && (
                <div>
                  <h4 className="font-bold text-ink mb-2">Requisitos</h4>
                  <p className="text-ink-secondary text-sm leading-relaxed whitespace-pre-wrap">{selectedJob.requirements}</p>
                </div>
              )}
              {selectedJob.functions && (
                <div>
                  <h4 className="font-bold text-ink mb-2">Funciones</h4>
                  <p className="text-ink-secondary text-sm leading-relaxed whitespace-pre-wrap">{selectedJob.functions}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-brand-100 dark:border-gray-800 bg-brand-50/50 dark:bg-gray-900/50">
              <div className="flex gap-4">
                <button onClick={() => setSelectedJob(null)} className="btn-ghost flex-1">Cerrar</button>
                <button onClick={handleApply} disabled={applying || !!successMessage} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {applying ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : successMessage ? (
                    'Postulado'
                  ) : (
                    'Postularme Ahora'
                  )}
                </button>
              </div>

              {successMessage && (
                <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-center gap-3 animate-fade-in">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-bold">{successMessage}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
