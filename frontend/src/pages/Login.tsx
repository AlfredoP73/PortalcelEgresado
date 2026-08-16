import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { authApi } from '../api';

interface ApiError {
    response?: { data?: { detail?: string } };
    message?: string;
}

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await authApi.post('/login', { email, password });
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/companies', { replace: true });
        } catch (err: unknown) {
            const apiErr = err as ApiError;
            setError(
                apiErr.response?.data?.detail ||
                'No se pudo conectar con el servidor. Intenta de nuevo.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 flex items-center justify-center p-4">

            {/* Card central */}
            <div className="w-full max-w-md">

                {/* Logo + título */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Portal Egresados</h1>
                    <p className="text-brand-200 mt-1 text-sm">Universidad Popular del Cesar</p>
                </div>

                {/* Formulario */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h2 className="text-xl font-semibold text-ink mb-6">Iniciar sesión</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-ink-secondary">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
                                <input
                                    type="email"
                                    className="input pl-10"
                                    placeholder="usuario@portal.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Contraseña */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-ink-secondary">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
                                <input
                                    type="password"
                                    className="input pl-10"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-700 rounded-lg px-4 py-3 text-sm">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary justify-center py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </form>

                    {/* Credenciales de prueba */}
                    <div className="mt-6 pt-5 border-t border-slate-100">
                        <p className="text-xs text-ink-tertiary font-medium uppercase tracking-wide mb-3">
                            Credenciales de prueba
                        </p>
                        <div className="space-y-2 text-xs text-ink-secondary font-mono bg-surface-muted rounded-lg p-3">
                            <p><span className="text-ink-tertiary">Admin:</span> admin@portal.com / password123</p>
                            <p><span className="text-ink-tertiary">Empresa:</span> empresa@ejemplo.com / password123</p>
                        </div>
                    </div>
                </div>

                <p className="text-center text-brand-300 text-xs mt-6">
                    © {new Date().getFullYear()} UPC — Módulo de Gestión de Egresados
                </p>
            </div>
        </div>
    );
}