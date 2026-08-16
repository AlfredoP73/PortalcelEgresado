import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
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
    const [showPassword, setShowPassword] = useState(false);

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
        <div className="min-h-screen flex">
            {/* ── Left panel: UPC Branding ── */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600">
                {/* Decorative shapes */}
                <div className="absolute inset-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-brand-500/20 blur-[100px]" />
                    <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-400/15 blur-[120px]" />
                    <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-white/5 blur-[80px]" />
                    {/* Grid pattern */}
                    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Top: Logo */}
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="Logo UPC" className="w-16 h-16 drop-shadow-lg" />
                        <div>
                            <p className="text-white/90 text-sm font-semibold tracking-wide">Universidad Popular del Cesar</p>
                            <p className="text-brand-200 text-xs font-medium">Oficina de Egresados</p>
                        </div>
                    </div>

                    {/* Center: Hero text */}
                    <div className="max-w-lg animate-fade-in-up">
                        <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                            Portal de Seguimiento a 
                            <span className="text-brand-200"> Egresados</span>
                        </h1>
                        <p className="text-brand-100/80 text-lg leading-relaxed">
                            Conectamos egresados con oportunidades laborales reales. 
                            Gestiona tu hoja de vida, postúlate a vacantes y sé parte 
                            de la red profesional de la UPC.
                        </p>

                        {/* Stats */}
                        <div className="flex gap-8 mt-10">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-white">2,500+</p>
                                <p className="text-brand-200/70 text-sm font-medium mt-1">Egresados Activos</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-white">180+</p>
                                <p className="text-brand-200/70 text-sm font-medium mt-1">Empresas Aliadas</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-white">95%</p>
                                <p className="text-brand-200/70 text-sm font-medium mt-1">Empleabilidad</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom: Copyright */}
                    <p className="text-brand-300/50 text-xs">
                        © {new Date().getFullYear()} Universidad Popular del Cesar · Acreditación de Alta Calidad
                    </p>
                </div>
            </div>

            {/* ── Right panel: Login form ── */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-surface-soft relative">
                {/* Subtle pattern */}
                <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-pattern) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                <div className="w-full max-w-[420px] relative z-10">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8 animate-fade-in">
                        <img src="/logo.png" alt="Logo UPC" className="w-20 h-20 mx-auto mb-4 drop-shadow-md" />
                        <h1 className="text-2xl font-bold text-ink tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                            Portal de Egresados
                        </h1>
                        <p className="text-ink-secondary text-sm mt-1">Universidad Popular del Cesar</p>
                    </div>

                    {/* Form card */}
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="mb-8 hidden lg:block">
                            <h2 className="text-2xl font-bold text-ink tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                Bienvenido de vuelta
                            </h2>
                            <p className="text-ink-secondary mt-2 text-[15px]">
                                Ingresa tus credenciales para acceder al portal
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-ink-secondary">
                                    Correo electrónico
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-tertiary group-focus-within:text-brand-500 transition-colors" />
                                    <input
                                        type="email"
                                        className="input pl-11 py-3 text-[15px]"
                                        placeholder="correo@universidad.edu.co"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-ink-secondary">
                                    Contraseña
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-tertiary group-focus-within:text-brand-500 transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="input pl-11 pr-12 py-3 text-[15px]"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink-secondary transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3.5 text-sm animate-scale-in">
                                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary justify-center py-3.5 text-[15px] rounded-xl"
                            >
                                {loading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Verificando...</>
                                ) : (
                                    'Iniciar Sesión'
                                )}
                            </button>
                        </form>

                        {/* Test credentials */}
                        <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
                            <p className="text-[11px] text-ink-tertiary font-bold uppercase tracking-[0.1em] mb-3">
                                Credenciales de prueba
                            </p>
                            <div className="space-y-2">
                                <button 
                                    type="button"
                                    onClick={() => { setEmail('admin@portal.com'); setPassword('password123'); }}
                                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-surface-muted cursor-pointer group"
                                    style={{ border: '1px solid var(--color-border)' }}
                                >
                                    <span className="flex items-center gap-2.5">
                                        <span className="w-7 h-7 rounded-md bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">A</span>
                                        <span className="text-ink-secondary group-hover:text-ink transition-colors">admin@portal.com</span>
                                    </span>
                                    <span className="text-ink-tertiary text-xs">Admin</span>
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => { setEmail('empresa@ejemplo.com'); setPassword('password123'); }}
                                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-surface-muted cursor-pointer group"
                                    style={{ border: '1px solid var(--color-border)' }}
                                >
                                    <span className="flex items-center gap-2.5">
                                        <span className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">E</span>
                                        <span className="text-ink-secondary group-hover:text-ink transition-colors">empresa@ejemplo.com</span>
                                    </span>
                                    <span className="text-ink-tertiary text-xs">Empresa</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}