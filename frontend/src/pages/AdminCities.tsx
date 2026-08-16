import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import api from '../api';
import { LayoutDashboard, Plus, Trash2, Loader2, Save } from 'lucide-react';

interface CatalogItem {
  id: number;
  name: string;
}

export default function AdminCities() {
  const activeTab = 'cities';
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/${activeTab}`);
      setItems(res.data);
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    try {
      setSaving(true);
      await api.post(`/${activeTab}`, { name: newItemName });
      setNewItemName('');
      fetchItems();
    } catch (error) {
      toast.error(`Error al crear elemento en ${activeTab}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este elemento? Podría afectar registros existentes.')) return;
    try {
      await api.delete(`/${activeTab}/${id}`);
      fetchItems();
    } catch (error) {
      toast.error(`Error al eliminar elemento. Es posible que esté en uso.`);
    }
  };

  const tabNames = {
    sectors: 'Sectores Empresariales',
    cities: 'Ciudades',
    programs: 'Programas Académicos'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ink font-heading">Ciudades</h2>
          <p className="text-sm mt-0.5 text-ink-secondary">Administra las ciudades donde operan las empresas.</p>
        </div>
      </div>

      {/* TABS ELIMINADOS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-ink mb-4">Añadir Nuevo</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink-secondary mb-1">Nombre</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="input w-full"
                  placeholder="Ej: Ingeniería en Software"
                  required
                />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full flex justify-center items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="card overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center text-ink-secondary italic">
                No hay elementos registrados en este catálogo.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--bg-muted)] border-b border-[var(--border-color)]">
                  <tr>
                    <th className="px-6 py-4 font-bold text-ink-secondary uppercase text-[11px] tracking-wider">ID</th>
                    <th className="px-6 py-4 font-bold text-ink-secondary uppercase text-[11px] tracking-wider w-full">Nombre</th>
                    <th className="px-6 py-4 font-bold text-ink-secondary uppercase text-[11px] tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--bg-muted)] transition-colors">
                      <td className="px-6 py-4 text-ink-secondary font-mono">{item.id}</td>
                      <td className="px-6 py-4 font-bold text-ink">{item.name}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
