import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { graduatesApi } from '../api';
import api from '../api';
import { UserCircle, Edit2, GraduationCap, Mail, Award, Upload, FileText, Loader2, Camera } from 'lucide-react';
import ProfileCompleteness from '../components/ProfileCompleteness';

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
  profile_picture_url?: string;
  profile_summary?: string;
  experiences: WorkExperience[];
  academic_histories: AcademicHistory[];
  skills: { skill_id: number, proficiency_level: string }[];
}

interface Program {
  id: number;
  name: string;
}

interface Skill {
  id: number;
  name: string;
}
export default function GraduateProfile() {
  const [profile, setProfile] = useState<Graduate | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [uploadingCV, setUploadingCV] = useState(false);
  const navigate = useNavigate();

  const handleCompletenessAction = (actionId: string) => {
    switch (actionId) {
      case 'basic':
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'photo':
        document.getElementById('avatar-upload')?.click();
        break;
      case 'cv':
        document.getElementById('cv-upload')?.click();
        break;
      case 'skills':
        setIsEditingSkills(true);
        // Scroll a la sección de habilidades
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
        break;
      case 'exp':
        navigate('/graduate/experience');
        break;
    }
  };

  // Removed modals states since they moved to other pages

  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, programsRes, skillsRes] = await Promise.all([
        graduatesApi.get('/profile').catch(() => ({ data: null })),
        api.get('/programs'),
        graduatesApi.get('/skills').catch(() => ({ data: [] }))
      ]);
      setProfile(profileRes.data);
      if (profileRes.data?.skills) {
        setSelectedSkills(profileRes.data.skills.map((s: any) => s.skill_id));
      }
      setPrograms(programsRes.data);
      setAvailableSkills(skillsRes.data);
      if (!profileRes.data) {
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
      fetchProfile();
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Solo se permiten imágenes (JPG, PNG, WEBP)');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await graduatesApi.post('/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(prev => prev ? { ...prev, profile_picture_url: res.data.profile_picture_url } : null);
      toast.success('Foto de perfil actualizada exitosamente');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error al subir la foto de perfil');
    }
  };

  const handleSaveSkills = async () => {
    try {
      await graduatesApi.put('/profile/skills', {
        skills: selectedSkills.map(id => ({ skill_id: id, proficiency_level: "Intermedio" }))
      });
      toast.success('Habilidades actualizadas exitosamente');
      setIsEditingSkills(false);
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al guardar habilidades');
    }
  };

  const handleAddCustomSkill = async () => {
    if (!newSkillName.trim()) return;
    try {
      const res = await graduatesApi.post('/skills', { name: newSkillName.trim() });
      setAvailableSkills([...availableSkills, res.data]);
      setSelectedSkills([...selectedSkills, res.data.id]);
      setNewSkillName('');
      toast.success('Habilidad añadida al catálogo');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al añadir habilidad');
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
  if (!profile && !isEditing) return null;

  return (
    <div className="space-y-6">
      {!isEditing && <ProfileCompleteness profile={profile} onAction={handleCompletenessAction} />}

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
            <div className="relative group">
            <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-2xl overflow-hidden shadow-inner">
              {profile?.profile_picture_url ? (
                <img src={`${GRADUATES_URL}${profile.profile_picture_url}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile?.first_name?.[0] || user?.email[0].toUpperCase()
              )}
            </div>
            {!isEditing && profile && (
              <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera className="w-6 h-6" />
                <input id="avatar-upload" type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleAvatarUpload} />
              </label>
            )}
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

          {/* Skills Section */}
          <div className="mt-8 p-6 rounded-2xl border" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-ink">Mis Habilidades</h4>
              {!isEditingSkills ? (
                <button onClick={() => setIsEditingSkills(true)} className="btn-ghost text-sm py-1.5 px-3">
                  <Edit2 className="w-3 h-3 mr-1" /> Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditingSkills(false)} className="btn-ghost text-sm py-1.5 px-3">Cancelar</button>
                  <button onClick={handleSaveSkills} className="btn-primary text-sm py-1.5 px-3">Guardar</button>
                </div>
              )}
            </div>
            
            {!isEditingSkills ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills?.length > 0 ? (
                  profile.skills.map(s => {
                    const skillName = availableSkills.find(as => as.id === s.skill_id)?.name || `Skill #${s.skill_id}`;
                    return (
                      <span key={s.skill_id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-50 text-brand-700 border border-brand-200">
                        {skillName}
                      </span>
                    );
                  })
                ) : (
                  <p className="text-sm text-ink-secondary">No has agregado habilidades. Añade algunas para mejorar tu porcentaje de afinidad con las vacantes.</p>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableSkills.map(skill => (
                  <label key={skill.id} className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-brand-50 transition-colors" style={{ borderColor: selectedSkills.includes(skill.id) ? 'var(--brand-500)' : 'var(--border-color)' }}>
                    <input 
                      type="checkbox" 
                      className="rounded border-[var(--border-color)] text-brand-600 focus:ring-brand-500 bg-[var(--bg-main)]"
                      checked={selectedSkills.includes(skill.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedSkills([...selectedSkills, skill.id]);
                        else setSelectedSkills(selectedSkills.filter(id => id !== skill.id));
                      }}
                    />
                    <span className="text-sm text-ink">{skill.name}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                <p className="text-sm font-semibold mb-2 text-ink">¿No encuentras tu habilidad?</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="input flex-1" 
                    placeholder="Ej: Python" 
                    value={newSkillName} 
                    onChange={e => setNewSkillName(e.target.value)} 
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSkill();
                      }
                    }}
                  />
                  <button onClick={handleAddCustomSkill} type="button" className="btn-secondary whitespace-nowrap">
                    Añadir al catálogo
                  </button>
                </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
