import { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Check, X } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  description: string;
  contact_email: string;
  status: string;
  sector: { name: string };
  city: { name: string };
}

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/companies/${id}/status`, { status });
      fetchCompanies();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) return <div className="p-8">Cargando empresas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Directorio de Empresas</h2>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" />
          Nueva Empresa
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Nombre</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Sector</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Ciudad</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500">Estado</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-500 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {companies.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No hay empresas registradas.
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{company.name}</div>
                    <div className="text-sm text-gray-500">{company.contact_email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{company.sector.name}</td>
                  <td className="px-6 py-4 text-gray-600">{company.city.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      company.status === 'approved' ? 'bg-green-100 text-green-700' :
                      company.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {company.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    {company.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(company.id, 'approved')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Aprobar"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => updateStatus(company.id, 'rejected')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Rechazar"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
