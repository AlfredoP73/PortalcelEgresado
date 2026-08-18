import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../../../api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const token = searchParams.get('token');
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      try {
        await authApi.get(`/verify?token=${token}`);
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-[var(--bg-default)] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full card p-8 text-center"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-16 h-16 text-[var(--color-primary)] animate-spin" />
            <h2 className="text-2xl font-bold text-ink">Verificando tu correo...</h2>
            <p className="text-ink-secondary">Por favor espera un momento.</p>
          </div>
        )}

        {status === 'success' && (
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
              <CheckCircle className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink mb-2">¡Felicidades!</h2>
              <p className="text-ink-secondary text-lg">
                Tu correo electrónico ha sido verificado exitosamente. Ahora tienes acceso completo al Portal de Egresados.
              </p>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="btn-primary w-full mt-4 text-lg py-3"
            >
              Ir a Iniciar Sesión
            </button>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
              <XCircle className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink mb-2">Error de Verificación</h2>
              <p className="text-ink-secondary text-lg">
                El enlace de verificación es inválido o ha expirado. Por favor, intenta registrarte nuevamente o solicita un nuevo enlace.
              </p>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="btn-ghost w-full mt-4"
            >
              Volver al Inicio
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
