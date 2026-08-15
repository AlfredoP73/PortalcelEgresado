import { useState, useEffect } from 'react';
import api from '../api';

// En un entorno real, usaríamos @hello-pangea/dnd o dnd-kit.
// Para este demo, usaremos un drag and drop simple o botones de estado.

interface Application {
  id: number;
  job_offer_id: number;
  candidate_id: number;
  status: string;
}

const KANBAN_COLUMNS = [
  { id: 'postulado', title: 'Postulados', color: 'bg-blue-50 border-blue-200' },
  { id: 'en_evaluacion', title: 'En Evaluación', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'entrevistado', title: 'Entrevistados', color: 'bg-purple-50 border-purple-200' },
  { id: 'contratado', title: 'Contratados', color: 'bg-green-50 border-green-200' },
];

export default function Kanban() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  // Simulating fetching applications for a specific job offer (e.g. ID 1)
  const fetchApplications = async () => {
    setLoading(true);
    try {
      // Hardcoded to job offer 1 for demo purposes
      const response = await api.get('/applications/job/1');
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const moveApplication = async (appId: number, newStatus: string) => {
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      fetchApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  if (loading) return <div className="p-8">Cargando tablero...</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Tablero de Candidatos</h2>
        <p className="text-gray-500">Vacante de prueba (ID: 1)</p>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 h-full min-w-max pb-4">
          {KANBAN_COLUMNS.map((col) => (
            <div key={col.id} className={`w-80 rounded-xl border flex flex-col ${col.color}`}>
              <div className="p-4 border-b border-black/5 font-semibold text-gray-700">
                {col.title}
                <span className="ml-2 text-sm text-gray-500 font-normal">
                  ({applications.filter(a => a.status === col.id).length})
                </span>
              </div>
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {applications
                  .filter((app) => app.status === col.id)
                  .map((app) => (
                    <div key={app.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <h4 className="font-medium text-gray-900 mb-1">Candidato #{app.candidate_id}</h4>
                      <p className="text-sm text-gray-500 mb-4">Postulación: {app.id}</p>
                      
                      <select 
                        className="w-full text-sm bg-gray-50 border border-gray-200 rounded p-1"
                        value={app.status}
                        onChange={(e) => moveApplication(app.id, e.target.value)}
                      >
                        {KANBAN_COLUMNS.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
