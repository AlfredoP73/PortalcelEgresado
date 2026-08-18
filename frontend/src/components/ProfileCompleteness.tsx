import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

interface Graduate {
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_summary?: string;
  cv_url?: string;
  profile_picture_url?: string;
  experiences?: any[];
  academic_histories?: any[];
  skills?: any[];
}

interface ProfileCompletenessProps {
  profile: Graduate | null;
  onAction?: (actionId: string) => void;
}

export default function ProfileCompleteness({ profile, onAction }: ProfileCompletenessProps) {
  if (!profile) return null;

  const checks = [
    { id: 'basic', label: 'Datos Básicos', points: 20, isComplete: !!(profile.first_name && profile.last_name && profile.phone && profile.profile_summary), action: 'Completa tu información personal y un resumen profesional.' },
    { id: 'photo', label: 'Foto de Perfil', points: 15, isComplete: !!profile.profile_picture_url, action: 'Sube una foto de perfil profesional para destacar.' },
    { id: 'cv', label: 'Hoja de Vida (CV)', points: 20, isComplete: !!profile.cv_url, action: 'Sube tu CV en formato PDF para que las empresas lo vean.' },
    { id: 'skills', label: 'Habilidades', points: 25, isComplete: !!(profile.skills && profile.skills.length > 0), action: 'Añade al menos una habilidad técnica o blanda.' },
    { id: 'exp', label: 'Experiencia y Academia', points: 20, isComplete: !!((profile.experiences && profile.experiences.length > 0) || (profile.academic_histories && profile.academic_histories.length > 0)), action: 'Agrega tu experiencia laboral o historial académico.' },
  ];

  const totalPoints = checks.reduce((acc, curr) => acc + (curr.isComplete ? curr.points : 0), 0);
  const nextStep = checks.find(c => !c.isComplete);

  return (
    <div className="bg-brand-500/10 backdrop-blur-md rounded-2xl shadow-sm border border-brand-500/20 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Fuerza del Perfil</h3>
        <span className="text-2xl font-black text-brand-600">{totalPoints}%</span>
      </div>

      {/* Progress Bar */}
      <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
        <div 
          className="h-full bg-brand-500 transition-all duration-1000 ease-out"
          style={{ width: `${totalPoints}%` }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Checks */}
        <div className="space-y-3">
          {checks.map(check => (
            <div key={check.id} className={`flex items-center gap-3 ${check.isComplete ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
              {check.isComplete ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              <span className={`text-sm font-medium ${check.isComplete ? '' : 'line-through opacity-70'}`}>
                {check.label} ({check.points}%)
              </span>
            </div>
          ))}
        </div>

        {/* Next Step Box */}
        {nextStep ? (
          <div 
            className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800/30 flex flex-col justify-center cursor-pointer hover:bg-emerald-100 transition-colors group"
            onClick={() => onAction && onAction(nextStep.id)}
          >
            <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-2">Siguiente Paso Sugerido</h4>
            <p className="text-emerald-900 dark:text-emerald-100 font-medium mb-4">{nextStep.action}</p>
            <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold text-sm group-hover:underline">
              Completar ahora <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        ) : (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-100 dark:border-green-800/30 flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
            <h4 className="text-green-800 dark:text-green-300 font-bold mb-1">¡Perfil Estelar!</h4>
            <p className="text-sm text-green-700 dark:text-green-400">Tu perfil está completo. Tienes altas probabilidades de ser seleccionado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
