import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import api from '../api';
import { X, ExternalLink, GraduationCap, Briefcase, FileText } from 'lucide-react';

const GRADUATES_URL = import.meta.env.VITE_GRADUATES_URL || 'http://localhost:8003';

interface WorkExperience {
  id: number;
  company_name: string;
  position: string;
  start_date: string;
  end_date?: string;
  certificate_url?: string;
}

interface AcademicHistory {
  id: number;
  institution: string;
  degree: string;
  start_date: string;
  end_date?: string;
  diploma_url?: string;
}

interface Graduate {
  user_id: number;
  first_name: string;
  last_name: string;
  program_id: number;
  graduation_year: number;
  phone?: string;
  email?: string;
  cv_url?: string;
  profile_summary?: string;
  experiences?: WorkExperience[];
  academic_histories?: AcademicHistory[];
}

interface CandidateDetailsModalProps {
  applicationId: number;
  onClose: () => void;
}

export default function CandidateDetailsModal({ applicationId, onClose }: CandidateDetailsModalProps) {
  const [candidate, setCandidate] = useState<Graduate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidate();
  }, [applicationId]);

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/applications/${applicationId}/candidate`);
      setCandidate(res.data);
    } catch (error) {
      console.error('Error fetching candidate details:', error);
      toast.error('Error al cargar la información del candidato');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-fade-in-up" style={{ backgroundColor: 'var(--bg-modal)' }}>
        <div className="sticky top-0 bg-[var(--bg-modal)] flex justify-between items-center p-6 border-b z-10" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h3 className="text-xl font-bold text-ink">Perfil del Candidato</h3>
            <p className="text-sm text-brand-600 font-semibold">{candidate.first_name} {candidate.last_name}</p>
          </div>
          <button onClick={onClose} className="text-ink-tertiary hover:text-ink p-1 rounded-full hover:bg-black/5"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Contact & CV Row */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1 bg-brand-50 p-5 rounded-2xl border border-brand-100 w-full">
              <h4 className="text-lg font-bold text-brand-900 mb-3">Información de Contacto</h4>
              <div className="space-y-2">
                {candidate.email && (
                  <p className="text-sm text-brand-800"><span className="font-semibold">Correo:</span> {candidate.email}</p>
                )}
                {candidate.phone && (
                  <p className="text-sm text-brand-800"><span className="font-semibold">Teléfono:</span> {candidate.phone}</p>
                )}
              </div>
              {candidate.email && (
                <a href={`mailto:${candidate.email}`} className="mt-4 inline-flex items-center justify-center w-full gap-2 bg-brand-600 text-white px-4 py-2 rounded-xl font-bold transition-colors hover:bg-brand-700 shadow-sm">
                  Contactar al Egresado
                </a>
              )}
            </div>
            
            <div className="flex-1 bg-[var(--bg-muted)] p-5 rounded-2xl border border-[var(--border-color)] w-full">
              <h4 className="text-lg font-bold text-ink mb-3">Hoja de Vida (CV)</h4>
              {candidate.cv_url ? (
                <a href={`${GRADUATES_URL}${candidate.cv_url}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-white text-brand-700 px-4 py-2 rounded-xl font-bold transition-colors hover:bg-brand-50 border border-brand-200 shadow-sm w-full justify-center">
                  <ExternalLink className="w-4 h-4" /> Ver Hoja de Vida
                </a>
              ) : (
                <p className="text-sm text-ink-secondary italic text-center py-2">
                  El candidato no ha subido su hoja de vida.
                </p>
              )}
            </div>
          </div>

          {candidate.profile_summary && (
            <div>
              <h4 className="text-lg font-bold text-ink mb-4">Perfil Profesional</h4>
              <p className="text-sm text-ink-secondary bg-[var(--bg-muted)] p-4 rounded-xl border border-[var(--border-color)]">
                {candidate.profile_summary}
              </p>
            </div>
          )}

          <div>
            <h4 className="text-lg font-bold text-ink mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5" /> Experiencia Laboral</h4>
            {candidate.experiences && candidate.experiences.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {candidate.experiences.map(exp => (
                  <div key={exp.id} className="card p-4 border border-[var(--border-color)]">
                    <h5 className="font-bold text-ink">{exp.position}</h5>
                    <p className="text-sm font-semibold text-brand-600">{exp.company_name}</p>
                    <p className="text-xs text-ink-secondary mt-1">{new Date(exp.start_date).toLocaleDateString()} - {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Presente'}</p>
                    {exp.certificate_url && (
                      <a href={`${GRADUATES_URL}${exp.certificate_url}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold w-fit transition-colors hover:bg-green-100">
                        <FileText className="w-3 h-3" /> Certificado Adjunto
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-secondary italic bg-[var(--bg-muted)] p-4 rounded-xl border border-[var(--border-color)]">El candidato no ha registrado experiencia laboral.</p>
            )}
          </div>

          <div>
            <h4 className="text-lg font-bold text-ink mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Formación Académica</h4>
            {candidate.academic_histories && candidate.academic_histories.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {candidate.academic_histories.map(edu => (
                  <div key={edu.id} className="card p-4 border border-[var(--border-color)]">
                    <h5 className="font-bold text-ink">{edu.degree}</h5>
                    <p className="text-sm font-semibold text-brand-600">{edu.institution}</p>
                    <p className="text-xs text-ink-secondary mt-1">{new Date(edu.start_date).toLocaleDateString()} - {edu.end_date ? new Date(edu.end_date).toLocaleDateString() : 'En curso'}</p>
                    {edu.diploma_url && (
                      <a href={`${GRADUATES_URL}${edu.diploma_url}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold w-fit transition-colors hover:bg-blue-100">
                        <FileText className="w-3 h-3" /> Diploma Adjunto
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-secondary italic bg-[var(--bg-muted)] p-4 rounded-xl border border-[var(--border-color)]">El candidato no ha registrado formación académica.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
