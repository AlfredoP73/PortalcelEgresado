import { useState, useEffect } from 'react';
import api from '../api';
import { Users, GraduationCap, Phone, ExternalLink, X, FileText, Mail, Briefcase } from 'lucide-react';

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
  email?: string;
  phone?: string;
  cv_url?: string;
  profile_summary?: string;
  experiences?: WorkExperience[];
  academic_histories?: AcademicHistory[];
}

export default function CompanyTalentPool() {
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGraduate, setSelectedGraduate] = useState<Graduate | null>(null);

  useEffect(() => {
    fetchGraduates();
  }, []);

  const fetchGraduates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/talent-pool');
      setGraduates(res.data);
    } catch (error) {
      console.error('Error fetching talent pool:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-ink font-heading">Directorio de Egresados</h2>
          <p className="text-sm mt-1 text-ink-secondary">Explora el talento disponible y contacta directamente a los perfiles que se ajusten a tu empresa.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : graduates.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 text-ink-tertiary mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-ink">No hay talento registrado aún</h3>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--bg-muted)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-6 py-4 font-bold text-ink-secondary uppercase text-[11px] tracking-wider">Profesional</th>
                  <th className="px-6 py-4 font-bold text-ink-secondary uppercase text-[11px] tracking-wider">Formación</th>
                  <th className="px-6 py-4 font-bold text-ink-secondary uppercase text-[11px] tracking-wider">Contacto Directo</th>
                  <th className="px-6 py-4 font-bold text-ink-secondary uppercase text-[11px] tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {graduates.map(grad => (
                  <tr key={grad.user_id} className="hover:bg-[var(--bg-muted)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-brand-600 shrink-0">
                          {grad.first_name.charAt(0)}{grad.last_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-ink">{grad.first_name} {grad.last_name}</p>
                          {grad.profile_summary ? (
                            <p className="text-xs text-ink-secondary truncate max-w-[200px] mt-0.5">{grad.profile_summary}</p>
                          ) : (
                            <p className="text-xs text-ink-secondary mt-0.5 italic">Sin resumen</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs text-ink-secondary">
                        <span className="flex items-center gap-1.5 font-semibold text-brand-700"><GraduationCap className="w-3.5 h-3.5" /> Año: {grad.graduation_year}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 text-xs text-ink-secondary">
                        {grad.email ? (
                           <a href={`mailto:${grad.email}`} className="flex items-center gap-1.5 text-brand-600 hover:text-brand-800 transition-colors">
                             <Mail className="w-3.5 h-3.5" /> {grad.email}
                           </a>
                        ) : (
                          <span className="text-ink-tertiary">Correo N/A</span>
                        )}
                        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {grad.phone || 'Teléfono N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelectedGraduate(grad)} className="inline-flex items-center gap-1 bg-ink-50 text-ink hover:bg-ink-100 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors border border-transparent hover:border-ink-200 shadow-sm">
                          Ver Perfil Completo
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedGraduate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-fade-in-up" style={{ backgroundColor: 'var(--bg-modal)' }}>
            <div className="sticky top-0 bg-[var(--bg-modal)] flex justify-between items-center p-6 border-b z-10" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <h3 className="text-xl font-bold text-ink">Perfil de Talento</h3>
                <p className="text-sm text-brand-600 font-semibold">{selectedGraduate.first_name} {selectedGraduate.last_name}</p>
              </div>
              <button onClick={() => setSelectedGraduate(null)} className="text-ink-tertiary hover:text-ink p-1 rounded-full hover:bg-black/5"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Contact & CV Row */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1 bg-brand-50 p-5 rounded-2xl border border-brand-100 w-full">
                  <h4 className="text-lg font-bold text-brand-900 mb-3">Información de Contacto</h4>
                  <div className="space-y-2">
                    {selectedGraduate.email && (
                      <p className="text-sm text-brand-800"><span className="font-semibold">Correo:</span> {selectedGraduate.email}</p>
                    )}
                    {selectedGraduate.phone && (
                      <p className="text-sm text-brand-800"><span className="font-semibold">Teléfono:</span> {selectedGraduate.phone}</p>
                    )}
                  </div>
                  {selectedGraduate.email && (
                    <a href={`mailto:${selectedGraduate.email}`} className="mt-4 inline-flex items-center justify-center w-full gap-2 bg-brand-600 text-white px-4 py-2 rounded-xl font-bold transition-colors hover:bg-brand-700 shadow-sm">
                      Contactar Directamente
                    </a>
                  )}
                </div>
                
                <div className="flex-1 bg-[var(--bg-muted)] p-5 rounded-2xl border border-[var(--border-color)] w-full">
                  <h4 className="text-lg font-bold text-ink mb-3">Hoja de Vida (CV)</h4>
                  {selectedGraduate.cv_url ? (
                    <a href={`${GRADUATES_URL}${selectedGraduate.cv_url}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-white text-brand-700 px-4 py-2 rounded-xl font-bold transition-colors hover:bg-brand-50 border border-brand-200 shadow-sm w-full justify-center">
                      <ExternalLink className="w-4 h-4" /> Ver Hoja de Vida
                    </a>
                  ) : (
                    <p className="text-sm text-ink-secondary italic text-center py-2">
                      El talento no ha subido su hoja de vida.
                    </p>
                  )}
                </div>
              </div>

              {selectedGraduate.profile_summary && (
                <div>
                  <h4 className="text-lg font-bold text-ink mb-4">Perfil Profesional</h4>
                  <p className="text-sm text-ink-secondary bg-[var(--bg-muted)] p-4 rounded-xl border border-[var(--border-color)]">
                    {selectedGraduate.profile_summary}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-lg font-bold text-ink mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5" /> Experiencia Laboral</h4>
                {selectedGraduate.experiences && selectedGraduate.experiences.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedGraduate.experiences.map(exp => (
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
                  <p className="text-sm text-ink-secondary italic bg-[var(--bg-muted)] p-4 rounded-xl border border-[var(--border-color)]">El talento no ha registrado experiencia laboral.</p>
                )}
              </div>

              <div>
                <h4 className="text-lg font-bold text-ink mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Formación Académica</h4>
                {selectedGraduate.academic_histories && selectedGraduate.academic_histories.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedGraduate.academic_histories.map(edu => (
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
                  <p className="text-sm text-ink-secondary italic bg-[var(--bg-muted)] p-4 rounded-xl border border-[var(--border-color)]">El talento no ha registrado formación académica.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
