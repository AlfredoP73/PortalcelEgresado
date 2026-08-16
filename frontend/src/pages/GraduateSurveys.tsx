import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { graduatesApi } from '../api';
import { ClipboardList, CheckCircle2 } from 'lucide-react';

interface Survey {
  id: number;
  title: string;
  description: string;
  questions_json: any[];
}

export default function GraduateSurveys() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completedSurveys, setCompletedSurveys] = useState<number[]>([]);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const res = await graduatesApi.get('/surveys');
      setSurveys(res.data);
      
      // Check which are completed
      const completedIds: number[] = [];
      for (const survey of res.data) {
        try {
          const resp = await graduatesApi.get(`/surveys/${survey.id}/response`);
          if (resp.data) completedIds.push(survey.id);
        } catch (e) {
            // Ignore error
        }
      }
      setCompletedSurveys(completedIds);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (questionId: string, val: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSurvey) return;
    try {
      setSubmitting(true);
      await graduatesApi.post(`/surveys/${selectedSurvey.id}/response`, answers);
      toast.success('Encuesta enviada exitosamente. ¡Gracias por tus respuestas!');
      setCompletedSurveys(prev => [...prev, selectedSurvey.id]);
      setSelectedSurvey(null);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error al enviar encuesta');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (selectedSurvey) {
    return (
      <div className="max-w-2xl mx-auto mt-6 animate-fade-in-up">
        <button onClick={() => setSelectedSurvey(null)} className="text-brand-600 hover:underline mb-4 font-medium text-sm">
          &larr; Volver a Encuestas
        </button>
        <div className="card p-8">
          <div className="mb-6 border-b border-ink-100 pb-4">
            <h2 className="text-2xl font-bold font-heading text-ink">{selectedSurvey.title}</h2>
            <p className="text-ink-secondary mt-2 text-sm">{selectedSurvey.description}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {selectedSurvey.questions_json.map((q: any) => (
              <div key={q.id} className="space-y-2">
                <label className="block text-sm font-semibold text-ink">{q.question}</label>
                {q.type === 'radio' && (
                  <div className="space-y-2 mt-2">
                    {q.options.map((opt: string) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name={q.id} 
                          value={opt} 
                          className="text-brand-600 focus:ring-brand-500"
                          onChange={(e) => handleOptionChange(q.id, e.target.value)}
                          required
                        />
                        <span className="text-sm font-medium text-ink-secondary">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
                {q.type === 'text' && (
                  <input 
                    type="text" 
                    className="input w-full" 
                    required 
                    onChange={(e) => handleOptionChange(q.id, e.target.value)}
                  />
                )}
              </div>
            ))}
            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Enviando...' : 'Finalizar y Enviar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>Seguimiento Institucional</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Diligencia las encuestas para mantener actualizado tu estado laboral.</p>
      </div>

      {surveys.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardList className="w-12 h-12 text-ink-tertiary mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-ink">No hay encuestas pendientes</h3>
          <p className="text-ink-secondary mt-2 max-w-md mx-auto">Vuelve más tarde para verificar si tienes nuevas encuestas asignadas por la institución.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveys.map(survey => {
            const isCompleted = completedSurveys.includes(survey.id);
            return (
              <div key={survey.id} className={`card p-6 flex flex-col transition-all duration-300 ${isCompleted ? 'bg-brand-50/50' : 'hover:-translate-y-1 group cursor-pointer'}`} onClick={() => !isCompleted && setSelectedSurvey(survey)}>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-lg font-bold line-clamp-2 ${isCompleted ? 'text-ink-secondary' : 'text-ink group-hover:text-brand-600'} transition-colors`}>{survey.title}</h3>
                    {isCompleted && <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-ink-tertiary line-clamp-3">{survey.description}</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-ink-100 flex justify-end">
                  {isCompleted ? (
                    <span className="text-sm font-semibold text-brand-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Completada</span>
                  ) : (
                    <button className="text-sm font-semibold text-brand-600 bg-brand-50 group-hover:bg-brand-600 group-hover:text-white px-4 py-2 rounded-lg transition-colors">
                      Comenzar Encuesta
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
