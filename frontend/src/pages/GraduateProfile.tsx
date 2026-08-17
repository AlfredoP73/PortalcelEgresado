import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { graduatesApi } from '../api';
import api from '../api';
import { UserCircle, Edit2, GraduationCap, Mail, Award, Upload, FileText, Loader2 } from 'lucide-react';

const GRADUATES_URL = import.meta.env.VITE_GRADUATES_URL || 'http://localhost:8003';

interface WorkExperience {
  id: number;
  company_name: string;
  position: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

interface AcademicHistory {
  id: number;
  institution: string;
  degree: string;
  start_date: string;
  end_date?: string;
}

interface Graduate {
  user_id: number;
  first_name: string;
  last_name: string;
  program_id: number;
  graduation_year: number;
  phone?: string;
  cv_url?: string;
  profile_summary?: string;
  experiences: WorkExperience[];
  academic_histories: AcademicHistory[];
}

interface Program {
  id: number;
  name: string;
}

export default function GraduateProfile() {
  const [profile, setProfile] = useState<Graduate | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);

  // Removed modals states since they moved to other pages

  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profRes, progRes] = await Promise.all([
        graduatesApi.get('/profile').catch(() => ({ data: null })),
        api.get('/programs').catch(() => ({ data: [] }))
      ]);
      setProfile(profRes.data);
      setPrograms(progRes.data);
      if (!profRes.data) {
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await graduatesApi.post('/profile', {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        program_id: Number(formData.get('program_id')),
        graduation_year: Number(formData.get('graduation_year')),
        phone: formData.get('phone'),
        profile_summary: formData.get('profile_summary'),
      });
      setIsEditing(false);
      fetchData();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error al guardar el perfil.');
    }
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Solo se permiten archivos PDF');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingCV(true);
      const res = await graduatesApi.post('/cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(prev => prev ? { ...prev, cv_url: res.data.cv_url } : null);
      toast.success('Hoja de vida subida exitosamente');
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast.error('Error al subir la hoja de vida');
    } finally {
      setUploadingCV(false);
    }
  };

  // Removed handleAddExperience, handleDeleteExperience, handleAddEducation, handleDeleteEducation

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (isEditing || !profile) {
    return (
      <div className="max-w-5xl mx-auto mt-10 animate-fade-in-up">
        <h2 className="page-title mb-6">Completar Hoja de Vida</h2>
        <form onSubmit={handleSaveProfile} className="card p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-secondary mb-1">Nombres</label>
              <input name="first_name" type="text" className="input" defaultValue={profile?.first_name || ''} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-secondary mb-1">Apellidos</label>
              <input name="last_name" type="text" className="input" defaultValue={profile?.last_name || ''} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-secondary mb-1">Programa Egresado</label>
              <select name="program_id" className="input" defaultValue={profile?.program_id || ''} required>
                <option value="">Seleccione...</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-secondary mb-1">Año de Graduación</label>
              <input name="graduation_year" type="number" min="1980" max="2030" className="input" defaultValue={profile?.graduation_year || ''} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-secondary mb-1">Teléfono</label>
            <input name="phone" type="text" className="input" defaultValue={profile?.phone || ''} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-secondary mb-1">Perfil Profesional (Resumen)</label>
            <textarea name="profile_summary" className="input min-h-[100px]" defaultValue={profile?.profile_summary || ''}></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            {profile && <button type="button" onClick={() => setIsEditing(false)} className="btn-ghost">Cancelar</button>}
            <button type="submit" className="btn-primary">Guardar Perfil</button>
          </div>
        </form>
      </div>
    );
  }

  const programName = programs.find(p => p.id === profile.program_id)?.name || 'Programa Desconocido';

  return (
    <div className="space-y-6">
      <div className="page-header flex justify-between items-center">
        <h2 className="page-title">Mi Perfil</h2>
        <button onClick={() => setIsEditing(true)} className="btn-primary flex items-center gap-2">
          <Edit2 className="w-4 h-4" /> Editar Perfil
        </button>
      </div>

      {/* Hero card */}
      <div className="card overflow-hidden" style={{ padding: 0 }}>
        {/* Cover banner */}
        <div className="h-32 relative" style={{ background: 'linear-gradient(135deg, #0e4832 0%, #158a58 60%, #22a86e 100%)' }}>
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>
        {/* Profile row */}
        <div className="px-8 pb-8">
          <div className="flex items-end gap-5 -mt-12 mb-6 relative z-10">
            <div className="w-28 h-28 rounded-full flex items-center justify-center text-white text-4xl font-bold border-[4px] border-white shadow-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg, #116e48, #22a86e)' }}>
              {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
            </div>
            <div className="pb-1">
              <h3 className="text-3xl font-bold tracking-tight text-ink">
                {profile.first_name} {profile.last_name}
              </h3>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="inline-flex items-center gap-1.5 text-[15px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  <GraduationCap className="w-4 h-4 opacity-70" />
                  {programName}
                </span>
                {profile.cv_url && (
                  <a href={`${GRADUATES_URL}${profile.cv_url}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-full transition-colors">
                    <FileText className="w-4 h-4" /> Ver Hoja de Vida
                  </a>
                )}
                <div>
                  <input type="file" id="cv-upload" className="hidden" accept=".pdf" onChange={handleCVUpload} disabled={uploadingCV} />
                  <label htmlFor="cv-upload" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-secondary bg-ink-50 hover:bg-ink-100 px-3 py-1 rounded-full transition-colors cursor-pointer border border-ink-200">
                    {uploadingCV ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploadingCV ? 'Subiendo...' : 'Actualizar CV PDF'}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8 p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-color)' }}>
            <h4 className="label-upper mb-2">Perfil Profesional</h4>
            <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {profile.profile_summary || 'No has añadido un resumen profesional a tu perfil. Agrega uno para destacar ante las empresas.'}
            </p>
          </div>

          {/* Info chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1 p-4 rounded-xl transition-colors hover:bg-[var(--bg-muted)] border" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-blue-500" />
                <p className="label-upper">Correo Electrónico</p>
              </div>
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-main)' }}>{user?.email}</p>
            </div>
            <div className="flex flex-col gap-1 p-4 rounded-xl transition-colors hover:bg-[var(--bg-muted)] border" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2 mb-1">
                <UserCircle className="w-4 h-4 text-blue-500" />
                <p className="label-upper">Teléfono</p>
              </div>
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-main)' }}>{profile.phone || 'No especificado'}</p>
            </div>
            <div className="flex flex-col gap-1 p-4 rounded-xl transition-colors hover:bg-[var(--bg-muted)] border" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-blue-500" />
                <p className="label-upper">Año de Grado</p>
              </div>
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-main)' }}>{profile.graduation_year}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
