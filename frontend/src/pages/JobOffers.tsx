import { useState, useEffect } from 'react';
import api from '../api';
import { Plus } from 'lucide-react';

interface JobOffer {
  id: number;
  title: string;
  company: { name: string };
  salary_min: number;
  salary_max: number;
  status: string;
  closing_date: string;
}

export default function JobOffers() {
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Cargando vacantes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Vacantes</h2>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" />
          Publicar Vacante
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
            No hay vacantes publicadas.
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                  {job.status.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600 mb-4 flex-1">{job.company.name}</p>
              <div className="space-y-2 text-sm text-gray-500 mb-6">
                {job.salary_min && job.salary_max && (
                  <p>💰 ${job.salary_min} - ${job.salary_max}</p>
                )}
                <p>📅 Cierre: {new Date(job.closing_date).toLocaleDateString()}</p>
              </div>
              <button className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors">
                Ver Detalles
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
