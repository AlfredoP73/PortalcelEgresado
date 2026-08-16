import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Briefcase, Calendar, DollarSign, X, CheckCircle2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface JobOffer {
  id: number;
  title: string;
  description?: string;
  requirements?: string;
  functions?: string;
  company: { 
    name: string;
    sector?: { name: string };
    city?: { name: string };
  };
  salary_min: number;
  salary_max: number;
  status: string;
  closing_date: string;
}

export default function JobOffers() {
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [programs, setPrograms] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  
  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;
  const isAdmin = user?.role_name === 'ADMIN';

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const [jobsRes, progRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/programs').catch(() => ({ data: [] }))
      ]);
      setJobs(jobsRes.data);
      setPrograms(progRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await api.post('/jobs', {
        company_id: user?.id,
        title: formData.get('title'),
        description: formData.get('description'),
        requirements: formData.get('requirements'),
        functions: formData.get('functions'),
        salary_min: Number(formData.get('salary_min')) || null,
        salary_max: Number(formData.get('salary_max')) || null,
        program_id: Number(formData.get('program_id')),
        closing_date: formData.get('closing_date')
      });
      setIsModalOpen(false);
      fetchJobs();
    } catch (error: any) {
      console.error('Error creating job:', error);
      toast.error(error.response?.data?.detail || 'Error al publicar la vacante. Asegúrate de haber completado tu perfil de empresa primero.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold font-heading text-ink tracking-tight">
            {isAdmin ? 'Explorar Vacantes' : 'Mis Ofertas Laborales'}
          </h2>
          <p className="text-ink-secondary mt-1">
            {isAdmin ? 'Visualiza las ofertas de todas las empresas aliadas.' : 'Gestiona y publica nuevas oportunidades laborales.'}
          </p>
        </div>
        {!isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-5 h-5" /> Publicar Vacante
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-4">
        {jobs.length === 0 ? (
          <div className="col-span-full card p-12 flex flex-col items-center justify-center text-center">
            <Briefcase className="w-16 h-16 text-brand-200 mb-4" />
            <h3 className="text-xl font-bold text-ink mb-2">No hay vacantes</h3>
            <p className="text-ink-secondary">
              {isAdmin ? 'Las empresas aún no han publicado ofertas laborales.' : 'Aún no has publicado ninguna oportunidad.'}
            </p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="card p-6 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand-100 to-transparent opacity-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
              
              <div className="flex justify-between items-start mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-50 to-brand-100 rounded-xl flex items-center justify-center text-brand-600 shadow-sm border border-brand-100 shrink-0">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className={twMerge(
                  "px-3 py-1 rounded-full text-xs font-bold tracking-wide border",
                  job.status.toUpperCase() === 'ACTIVE' ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-600 border-slate-200"
                )}>
                  {job.status.toUpperCase() === 'ACTIVE' ? 'ACTIVA' : 'CERRADA'}
                </span>

              </div>
              
              <h3 className="text-xl font-bold text-ink mb-1 group-hover:text-brand-600 transition-colors line-clamp-1">
                {job.title}
              </h3>
              <p className="text-ink-secondary font-medium text-sm mb-6 flex-1 line-clamp-1">
                {job.company?.name || 'Empresa Confidencial'}
              </p>
              
              <div className="space-y-3 text-sm text-ink-secondary mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100/60">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-brand-500" />
                  <span className="font-medium text-ink">
                    ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-brand-500" />
                  <span>Cierre: <strong className="text-ink">{new Date(job.closing_date).toLocaleDateString()}</strong></span>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedJob(job)}
                className="w-full py-2.5 bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 text-ink-secondary rounded-xl font-semibold transition-all duration-200 shadow-sm"
              >
                Ver Detalles
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal Detalles */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in">
          <div className="rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col" style={{ backgroundColor: 'var(--bg-modal)', border: '1px solid var(--border-color)' }}>
            <div className="flex justify-between items-center p-6 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="text-2xl font-bold text-ink font-heading">{selectedJob.title}</h3>
              <button onClick={() => setSelectedJob(null)} className="text-ink-tertiary hover:text-ink transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-ink text-lg">{selectedJob.company?.name || 'Empresa Confidencial'}</h4>
                <p className="text-brand-600 font-medium text-sm">
                  {selectedJob.company?.sector?.name || 'Sector no especificado'} • {selectedJob.company?.city?.name || 'Ubicación no especificada'}
                </p>
              </div>
              {selectedJob.description && (
                <div>
                  <h4 className="font-bold text-ink mb-2 text-lg">Descripción</h4>
                  <p className="text-ink-secondary whitespace-pre-line">{selectedJob.description}</p>
                </div>
              )}
              {selectedJob.requirements && (
                <div>
                  <h4 className="font-bold text-ink mb-2 text-lg">Requisitos</h4>
                  <p className="text-ink-secondary whitespace-pre-line">{selectedJob.requirements}</p>
                </div>
              )}
              {selectedJob.functions && (
                <div>
                  <h4 className="font-bold text-ink mb-2 text-lg">Funciones</h4>
                  <p className="text-ink-secondary whitespace-pre-line">{selectedJob.functions}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-color)' }}>
                <div>
                  <h4 className="font-bold text-ink mb-1">Salario</h4>
                  <p className="text-ink-secondary">${selectedJob.salary_min?.toLocaleString()} - ${selectedJob.salary_max?.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-bold text-ink mb-1">Fecha de Cierre</h4>
                  <p className="text-ink-secondary">{new Date(selectedJob.closing_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="p-6 shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
              <button onClick={() => setSelectedJob(null)} className="w-full btn-primary">
                Cerrar Detalles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Creación (Demo) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in">
          <div className="rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in" style={{ backgroundColor: 'var(--bg-modal)', border: '1px solid var(--border-color)' }}>
            <div className="flex justify-between items-center p-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="text-xl font-bold text-ink font-heading">Publicar Nueva Vacante</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-ink-tertiary hover:text-ink transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateJob} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink-secondary mb-1">Título de la Vacante</label>
                <input name="title" type="text" className="input" placeholder="Ej: Desarrollador Frontend Senior" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-secondary mb-1">Descripción Breve</label>
                  <textarea name="description" className="input" required></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-secondary mb-1">Requisitos</label>
                  <textarea name="requirements" className="input" required></textarea>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-secondary mb-1">Funciones del Cargo</label>
                <textarea name="functions" className="input min-h-[80px]" required></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-secondary mb-1">Salario Min ($)</label>
                  <input name="salary_min" type="number" className="input" placeholder="3000000" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-secondary mb-1">Salario Max ($)</label>
                  <input name="salary_max" type="number" className="input" placeholder="5000000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-secondary mb-1">Programa Académico</label>
                  <select name="program_id" className="input" required>
                    <option value="">Seleccione un programa...</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-secondary mb-1">Fecha de Cierre</label>
                  <input name="closing_date" type="date" className="input" required />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost">Cancelar</button>
                <button type="submit" className="btn-primary">
                  <CheckCircle2 className="w-5 h-5" /> Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
