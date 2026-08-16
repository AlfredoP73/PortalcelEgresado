import { useState, useEffect } from 'react';
import api, { authApi } from '../api';
import { Plus, Check, X, Building2, MapPin, Mail, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Sector { id: number; name: string }
interface City { id: number; name: string }

interface Company {
  user_id: number;
  name: string;
  description: string;
  contact_email: string;
  status: string;
  sector: Sector;
  city: City;
}

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  
  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;
  const isAdmin = user?.role_name === 'ADMIN';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, sectRes, cityRes] = await Promise.all([
        api.get('/companies'),
        api.get('/sectors').catch(() => ({ data: [] })),
        api.get('/cities').catch(() => ({ data: [] }))
      ]);
      setCompanies(compRes.data);
      setSectors(sectRes.data);
      setCities(cityRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/companies/${id}/status`, { status });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await api.post('/companies', {
        name: formData.get('name'),
        description: formData.get('description'),
        contact_email: formData.get('contact_email'),
        sector_id: Number(formData.get('sector_id')),
        city_id: Number(formData.get('city_id')),
      });
      setIsCreating(false);
      fetchData();
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Error al registrar empresa. Intente nuevamente.');
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      contact_email: formData.get('contact_email'),
      sector_id: Number(formData.get('sector_id')),
      city_id: Number(formData.get('city_id')),
    };

    try {
      if (editingCompany) {
        await api.put(`/companies/${editingCompany.user_id}`, data);
      } else {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        
        // 1. Create User
        const authRes = await authApi.post('/register', { email, password, role_id: 2 });
        const newUserId = authRes.data.user_id;
        
        // 2. Create Company
        await api.post('/companies', { ...data, user_id: newUserId });
      }
      setAdminModalOpen(false);
      setEditingCompany(null);
      fetchData();
    } catch (error: any) {
      console.error('Error in admin submit:', error);
      alert(error.response?.data?.detail || 'Error en la operación. Verifique los datos.');
    }
  };

  const handleDeleteCompany = async (userId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta empresa? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete(`/companies/${userId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Error al eliminar empresa.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  // Vista para la Empresa (Módulo 2 propio)
  if (!isAdmin) {
    const myCompany = companies[0];

    if (!myCompany) {
      if (isCreating) {
        return (
          <div className="max-w-2xl mx-auto mt-10">
            <h2 className="text-2xl font-bold font-heading text-ink mb-6">Completar Perfil de Empresa</h2>
            <form onSubmit={handleCreateCompany} className="card p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-ink-secondary mb-1">Nombre de la Empresa</label>
                <input name="name" type="text" className="input" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-secondary mb-1">Descripción</label>
                <textarea name="description" className="input min-h-[100px]" required></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-secondary mb-1">Correo de Contacto</label>
                <input name="contact_email" type="email" className="input" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-secondary mb-1">Sector</label>
                  <select name="sector_id" className="input bg-white" required>
                    <option value="">Seleccione...</option>
                    {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-secondary mb-1">Ciudad</label>
                  <select name="city_id" className="input bg-white" required>
                    <option value="">Seleccione...</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsCreating(false)} className="btn-ghost">Cancelar</button>
                <button type="submit" className="btn-primary">Registrar Empresa</button>
              </div>
            </form>
          </div>
        );
      }

      return (
        <div className="card p-10 text-center max-w-2xl mx-auto mt-10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-white -z-10" />
          <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <Building2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-3 font-heading text-ink">Aún no has completado tu perfil corporativo</h2>
          <p className="text-ink-secondary mb-8 leading-relaxed">
            Para publicar vacantes y gestionar candidatos, primero debes registrar los datos de tu empresa y esperar la aprobación de la universidad.
          </p>
          <button onClick={() => setIsCreating(true)} className="btn-primary text-lg px-8 py-3 shadow-xl shadow-brand-500/20">
            <Plus className="w-5 h-5" /> Completar Perfil de Empresa
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold font-heading text-ink tracking-tight">Mi Perfil Corporativo</h2>
          <span className={twMerge(
            "px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide border shadow-sm",
            myCompany.status.toUpperCase() === 'APPROVED' ? "bg-green-50 text-green-700 border-green-200" :
            myCompany.status.toUpperCase() === 'REJECTED' ? "bg-red-50 text-red-700 border-red-200" :
            "bg-amber-50 text-amber-700 border-amber-200"
          )}>
            {myCompany.status.toUpperCase() === 'APPROVED' ? 'APROBADA' : myCompany.status.toUpperCase() === 'REJECTED' ? 'RECHAZADA' : 'EN REVISIÓN'}
          </span>
        </div>

        <div className="card p-8 bg-gradient-to-br from-white to-slate-50/50">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-brand-500 to-brand-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-brand-500/30 shrink-0">
              {myCompany.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-ink mb-2">{myCompany.name}</h3>
              <p className="text-ink-secondary leading-relaxed mb-6">
                {myCompany.description || 'Sin descripción detallada.'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-ink-secondary bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                  <Mail className="w-5 h-5 text-brand-500" />
                  <span className="font-medium">{myCompany.contact_email}</span>
                </div>
                <div className="flex items-center gap-3 text-ink-secondary bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                  <MapPin className="w-5 h-5 text-brand-500" />
                  <span className="font-medium">{myCompany.city?.name || 'Ciudad no especificada'}</span>
                </div>
                <div className="flex items-center gap-3 text-ink-secondary bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                  <Building2 className="w-5 h-5 text-brand-500" />
                  <span className="font-medium">{myCompany.sector?.name || 'Sector no especificado'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista para el Administrador
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold font-heading text-ink tracking-tight">Directorio de Empresas</h2>
          <p className="text-ink-secondary mt-1">Gestiona las empresas aliadas y aprueba sus registros.</p>
        </div>
        <button 
          onClick={() => {
            setEditingCompany(null);
            setAdminModalOpen(true);
          }}
          className="btn-primary shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-5 h-5" /> Nueva Empresa
        </button>
      </div>

      {adminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="modal-content rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in" style={{ backgroundColor: 'var(--modal-bg)', border: '1px solid var(--card-border)' }}>
            <div className="flex justify-between items-center p-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="text-xl font-bold text-ink font-heading">
                {editingCompany ? 'Editar Empresa' : 'Registrar Nueva Empresa'}
              </h3>
              <button onClick={() => { setAdminModalOpen(false); setEditingCompany(null); }} className="text-ink-tertiary hover:text-ink transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAdminSubmit} className="p-6 space-y-4">
              {!editingCompany && (
                <>
                  <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-2">Credenciales de Acceso</p>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-ink-secondary mb-1">Email de Usuario</label>
                      <input name="email" type="email" className="input bg-white" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink-secondary mb-1">Contraseña temporal</label>
                      <input name="password" type="text" className="input bg-white" required />
                    </div>
                  </div>
                </>
              )}
              
              <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-2">Datos del Perfil</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-ink-secondary mb-1">Nombre de la Empresa</label>
                  <input name="name" type="text" className="input" defaultValue={editingCompany?.name || ''} required />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-ink-secondary mb-1">Correo de Contacto Público</label>
                  <input name="contact_email" type="email" className="input" defaultValue={editingCompany?.contact_email || ''} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-secondary mb-1">Descripción</label>
                <textarea name="description" className="input min-h-[80px]" defaultValue={editingCompany?.description || ''} required></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-secondary mb-1">Sector</label>
                  <select name="sector_id" className="input bg-white" defaultValue={editingCompany?.sector?.id || ''} required>
                    <option value="">Seleccione...</option>
                    {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-secondary mb-1">Ciudad</label>
                  <select name="city_id" className="input bg-white" defaultValue={editingCompany?.city?.id || ''} required>
                    <option value="">Seleccione...</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 mt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
                <button type="button" onClick={() => { setAdminModalOpen(false); setEditingCompany(null); }} className="btn-ghost">Cancelar</button>
                <button type="submit" className="btn-primary">
                  {editingCompany ? 'Guardar Cambios' : 'Crear Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-ink-secondary text-[12px] font-bold uppercase tracking-wider" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <tr>
                <th className="px-6 py-4">Empresa</th>
                <th className="px-6 py-4">Sector</th>
                <th className="px-6 py-4">Ubicación</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-ink-tertiary">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle className="w-8 h-8 opacity-50" />
                      <p className="text-base font-medium">No hay empresas registradas aún.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.user_id} className="hover:bg-brand-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                          {company.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-ink">{company.name}</div>
                          <div className="text-sm text-ink-tertiary">{company.contact_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-ink-secondary font-medium">
                      {company.sector?.name}
                    </td>
                    <td className="px-6 py-4 text-ink-secondary font-medium">
                      {company.city?.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={twMerge(
                        "px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border",
                        company.status.toUpperCase() === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                        company.status.toUpperCase() === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      )}>
                        {company.status.toUpperCase() === 'APPROVED' ? 'APROBADA' : company.status.toUpperCase() === 'REJECTED' ? 'RECHAZADA' : 'PENDIENTE'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingCompany(company);
                            setAdminModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        
                        {company.status.toUpperCase() === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateStatus(company.user_id, 'approved')}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Aprobar"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => updateStatus(company.user_id, 'rejected')}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Rechazar"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => handleDeleteCompany(company.user_id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors ml-2"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
