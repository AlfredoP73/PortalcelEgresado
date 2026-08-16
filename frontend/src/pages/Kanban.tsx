import { useState, useEffect } from 'react';
import api from '../api';
import { Briefcase, ChevronDown, User, Calendar, AlertCircle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface JobOffer {
  id: number;
  title: string;
}

interface Application {
  id: number;
  job_offer_id: number;
  candidate_id: number;
  status: string;
  application_date: string;
}

const KANBAN_COLUMNS = [
  { id: 'POSTULADO', title: 'Postulados', colorClass: 'bg-blue-50/50 border-blue-200/60', headerColor: 'text-blue-700 bg-blue-100/50' },
  { id: 'EN_EVALUACION', title: 'En Evaluación', colorClass: 'bg-amber-50/50 border-amber-200/60', headerColor: 'text-amber-700 bg-amber-100/50' },
  { id: 'ENTREVISTADO', title: 'Entrevistados', colorClass: 'bg-purple-50/50 border-purple-200/60', headerColor: 'text-purple-700 bg-purple-100/50' },
  { id: 'CONTRATADO', title: 'Contratados', colorClass: 'bg-emerald-50/50 border-emerald-200/60', headerColor: 'text-emerald-700 bg-emerald-100/50' },
];

export default function Kanban() {
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;
  const isAdmin = user?.role_name === 'ADMIN';

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJob !== null) {
      fetchApplications(selectedJob);
    }
  }, [selectedJob]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data);
      if (response.data.length > 0) {
        setSelectedJob(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchApplications = async (jobId: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/applications/job/${jobId}`);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]); // Clear on error (e.g. 403 or 404)
    } finally {
      setLoading(false);
    }
  };

  const moveApplication = async (appId: number, newStatus: string) => {
    if (isAdmin) return; // Admin only views
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      if (selectedJob) fetchApplications(selectedJob);
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading text-ink tracking-tight">Gestión de Candidatos</h2>
          <p className="text-ink-secondary mt-1">Revisa y mueve a los postulantes a través del proceso de selección.</p>
        </div>
        
        <div className="relative min-w-[280px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Briefcase className="h-5 w-5 text-brand-500" />
          </div>
          <select
            className="input pl-10 appearance-none font-medium text-ink bg-white shadow-sm cursor-pointer"
            value={selectedJob || ''}
            onChange={(e) => setSelectedJob(Number(e.target.value))}
          >
            <option value="" disabled>Selecciona una vacante...</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-ink-tertiary" />
          </div>
        </div>
      </div>

      {!selectedJob ? (
        <div className="flex-1 card flex flex-col items-center justify-center p-12 text-center">
          <AlertCircle className="w-16 h-16 text-brand-200 mb-4" />
          <h3 className="text-xl font-bold text-ink mb-2">No has seleccionado ninguna vacante</h3>
          <p className="text-ink-secondary">Crea una vacante o selecciona una del menú para ver sus candidatos.</p>
        </div>
      ) : loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-6 h-full min-w-max">
            {KANBAN_COLUMNS.map((col) => {
              const columnApps = applications.filter(a => a.status.toUpperCase() === col.id);
              
              return (
                <div key={col.id} className={twMerge("w-80 rounded-2xl border flex flex-col overflow-hidden shadow-sm", col.colorClass)}>
                  <div className={twMerge("px-5 py-4 border-b border-black/5 flex items-center justify-between", col.headerColor)}>
                    <h3 className="font-bold tracking-wide">{col.title}</h3>
                    <span className="bg-white/60 px-2.5 py-0.5 rounded-full text-sm font-bold shadow-sm">
                      {columnApps.length}
                    </span>
                  </div>
                  
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                    {columnApps.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-center p-4">
                        <p className="text-sm font-medium opacity-50">Sin candidatos en esta etapa</p>
                      </div>
                    ) : (
                      columnApps.map((app) => (
                        <div key={app.id} className="card p-4 hover:shadow-md transition-shadow group relative bg-white border border-slate-100">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold shrink-0">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-ink">Candidato #{app.candidate_id}</h4>
                              <div className="flex items-center gap-1.5 text-xs text-ink-tertiary mt-0.5">
                                <Calendar className="w-3 h-3" />
                                <span>Postulado: {app.application_date ? new Date(app.application_date).toLocaleDateString() : 'N/A'}</span>
                              </div>
                            </div>
                          </div>

                          {!isAdmin && (
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs font-medium text-ink-secondary">Mover a:</span>
                              <select 
                                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-medium outline-none focus:border-brand-500 cursor-pointer"
                                value={app.status}
                                onChange={(e) => moveApplication(app.id, e.target.value)}
                              >
                                {KANBAN_COLUMNS.map(c => (
                                  <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
