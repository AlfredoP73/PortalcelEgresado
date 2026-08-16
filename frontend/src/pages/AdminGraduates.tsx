import { useState, useEffect } from 'react';
import { graduatesApi } from '../api';
import api from '../api';
import { Users, GraduationCap, Phone, ExternalLink, Plus, X, Save, Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

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
  cv_url?: string;
  experiences?: WorkExperience[];
  academic_histories?: AcademicHistory[];
}

interface Program {
  id: number;
  name: string;
}

export default function AdminGraduates() {
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedGraduate, setSelectedGraduate] = useState<Graduate | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGraduates();
    fetchPrograms();
  }, []);

  const fetchGraduates = async () => {
    try {
      setLoading(true);
      const res = await graduatesApi.get('/admin/graduates');
      setGraduates(res.data);
    } catch (error) {
      console.error('Error fetching graduates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await api.get('/programs');
      setPrograms(res.data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    data.program_id = Number(data.program_id);
    data.graduation_year = Number(data.graduation_year);

    try {
      await graduatesApi.post('/admin/graduates', data);
      setShowModal(false);
      fetchGraduates();
      alert('Egresado registrado exitosamente');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error al registrar egresado');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>Directorio Global de Egresados</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Consulta y registra nuevos egresados en la plataforma.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Registrar Egresado
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : graduates.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 text-ink-tertiary mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-ink">No hay egresados registrados</h3>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--bg-muted)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-6 py-4 font-bold text-ink-secondary uppercase text-[11px] tracking-wider">Egresado</th>
                  <th className="px-6 py-4 font-bold text-ink-secondary uppercase text-[11px] tracking-wider">Año</th>
                  <th className="px-6 py-4 font-bold text-ink-secondary uppercase text-[11px] tracking-wider">Contacto</th>
                  <th className="px-6 py-4 font-bold text-ink-secondary uppercase text-[11px] tracking-wider text-right">CV</th>
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
                          <p className="text-xs text-ink-secondary flex items-center gap-1 mt-0.5"><GraduationCap className="w-3 h-3" /> Programa ID: {grad.program_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-ink">{grad.graduation_year}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs text-ink-secondary">
                        <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {grad.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelectedGraduate(grad)} className="inline-flex items-center gap-1 bg-ink-50 text-ink hover:bg-ink-100 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors border border-transparent hover:border-ink-200">
                          Ver Detalles
                        </button>
                        {grad.cv_url && (
                          <a href={`${GRADUATES_URL}${grad.cv_url}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:bg-brand-50 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors border border-transparent hover:border-brand-200">
                            Ver PDF <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-xl rounded-2xl shadow-2xl animate-fade-in-up" style={{ backgroundColor: 'var(--bg-modal)' }}>
            <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="text-xl font-bold text-ink">Registrar Nuevo Egresado</h3>
              <button onClick={() => setShowModal(false)} className="text-ink-tertiary hover:text-ink p-1 rounded-full hover:bg-black/5"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleRegister} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-secondary mb-1">Nombres *</label>
                  <input name="first_name" className="input w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-secondary mb-1">Apellidos *</label>
                  <input name="last_name" className="input w-full" required />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-secondary mb-1">Correo Electrónico *</label>
                  <input name="email" type="email" className="input w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-secondary mb-1">Contraseña (Temporal) *</label>
                  <input name="password" type="text" className="input w-full" defaultValue="upc12345" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-secondary mb-1">Programa Académico *</label>
                  <select name="program_id" className="input w-full" required>
                    <option value="">Seleccione...</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-secondary mb-1">Año de Graduación *</label>
                  <input name="graduation_year" type="number" min="1980" max="2030" defaultValue={new Date().getFullYear()} className="input w-full" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-secondary mb-1">Teléfono</label>
                <input name="phone" type="text" className="input w-full" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost" disabled={saving}>Cancelar</button>
                <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedGraduate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-fade-in-up" style={{ backgroundColor: 'var(--bg-modal)' }}>
            <div className="sticky top-0 bg-[var(--bg-modal)] flex justify-between items-center p-6 border-b z-10" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <h3 className="text-xl font-bold text-ink">Perfil del Egresado</h3>
                <p className="text-sm text-brand-600 font-semibold">{selectedGraduate.first_name} {selectedGraduate.last_name}</p>
              </div>
              <button onClick={() => setSelectedGraduate(null)} className="text-ink-tertiary hover:text-ink p-1 rounded-full hover:bg-black/5"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-8">
              <div>
                <h4 className="text-lg font-bold text-ink mb-4">Experiencia Laboral</h4>
                {selectedGraduate.experiences && selectedGraduate.experiences.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedGraduate.experiences.map(exp => (
                      <div key={exp.id} className="card p-4 border border-[var(--border-color)]">
                        <h5 className="font-bold text-ink">{exp.position}</h5>
                        <p className="text-sm font-semibold text-brand-600">{exp.company_name}</p>
                        <p className="text-xs text-ink-secondary mt-1">{new Date(exp.start_date).toLocaleDateString()} - {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Presente'}</p>
                        {exp.certificate_url && (
                          <a href={`${GRADUATES_URL}${exp.certificate_url}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold w-fit transition-colors hover:bg-green-100">
                            Ver Certificado Adjunto
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink-secondary italic bg-[var(--bg-muted)] p-4 rounded-xl border border-[var(--border-color)]">El egresado no ha registrado experiencia laboral.</p>
                )}
              </div>

              <div>
                <h4 className="text-lg font-bold text-ink mb-4">Formación Académica</h4>
                {selectedGraduate.academic_histories && selectedGraduate.academic_histories.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedGraduate.academic_histories.map(edu => (
                      <div key={edu.id} className="card p-4 border border-[var(--border-color)]">
                        <h5 className="font-bold text-ink">{edu.degree}</h5>
                        <p className="text-sm font-semibold text-brand-600">{edu.institution}</p>
                        <p className="text-xs text-ink-secondary mt-1">{new Date(edu.start_date).toLocaleDateString()} - {edu.end_date ? new Date(edu.end_date).toLocaleDateString() : 'En curso'}</p>
                        {edu.diploma_url && (
                          <a href={`${GRADUATES_URL}${edu.diploma_url}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold w-fit transition-colors hover:bg-blue-100">
                            Ver Diploma Adjunto
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink-secondary italic bg-[var(--bg-muted)] p-4 rounded-xl border border-[var(--border-color)]">El egresado no ha registrado formación académica.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
