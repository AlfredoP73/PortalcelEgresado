
import { ServerCrash, RefreshCw } from 'lucide-react';

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden text-center relative border border-slate-100 p-10 animate-fade-in-up">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 to-brand-600"></div>
        
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ServerCrash className="w-12 h-12 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Servicios en Mantenimiento</h1>
        <p className="text-slate-500 mb-8 text-sm leading-relaxed">
          El Portal del Egresado está experimentando dificultades técnicas o se encuentra en mantenimiento programado. 
          Nuestros ingenieros están trabajando para restablecer el servicio pronto.
        </p>

        <button 
          onClick={() => window.location.href = '/'}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-500/30 hover:-translate-y-0.5"
        >
          <RefreshCw className="w-5 h-5" />
          Reintentar conexión
        </button>

        <div className="mt-8 pt-6 border-t border-slate-100">
           <img src="/logo.png" alt="UPC Logo" className="w-12 h-12 object-contain mx-auto opacity-50 grayscale hover:grayscale-0 transition-all" />
        </div>
      </div>
    </div>
  );
}
