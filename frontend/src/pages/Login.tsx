import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, BookOpen, Users, Award, Briefcase } from 'lucide-react';
import { authApi } from '../api';

interface ApiError {
    response?: { data?: { detail?: string } };
    message?: string;
}

const features = [
    {
        icon: Briefcase,
        title: 'Bolsa de Empleo',
        desc: 'Conectamos egresados con empresas aliadas de la región Caribe.',
    },
    {
        icon: Users,
        title: 'Red de Egresados',
        desc: 'Forma parte de una comunidad de más de 15,000 profesionales activos.',
    },
    {
        icon: BookOpen,
        title: 'Seguimiento Académico',
        desc: 'Registro y validación del historial laboral y académico post-grado.',
    },
    {
        icon: Award,
        title: 'Acreditación de Calidad',
        desc: 'Sistema alineado con los estándares del CNA para instituciones de alta calidad.',
    },
];

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [roleId, setRoleId] = useState(3); // 3 = Egresado, 2 = Empresa

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegistering) {
                await authApi.post('/register', { email, password, role_id: roleId });
            }
            const { data } = await authApi.post('/login', { email, password });
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            if (data.user.role_name === 'GRADUATE') {
                navigate('/profile', { replace: true });
            } else {
                navigate('/companies', { replace: true });
            }
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
            {/* ── Left panel ── */}
            <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0e4832 0%, #158a58 60%, #22a86e 100%)' }}>
                {/* Noise/pattern overlay */}
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                {/* Glow blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #6ee7b7, transparent)', filter: 'blur(80px)' }} />
                <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #34d399, transparent)', filter: 'blur(100px)' }} />

                <div className="relative z-10 flex flex-col justify-between p-14 w-full">
                    {/* Logo header */}
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 shadow-lg">
                            <img src="/logo.png" alt="UPC" className="w-10 h-10 object-contain" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-[15px] leading-tight">Universidad Popular del Cesar</p>
                            <p className="text-white/50 text-xs font-medium mt-0.5">Oficina de Seguimiento a Egresados</p>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="space-y-10">
                        <div>
                            <span className="inline-block text-xs font-bold uppercase tracking-widest text-white/50 mb-4">Sistema de Egresados y Empleabilidad</span>
                            <h1 className="text-[2.6rem] font-extrabold text-white leading-[1.15] tracking-tight">
                                Conectando talento<br />
                                <span className="text-brand-200">con el futuro</span>
                            </h1>
                            <p className="text-white/60 text-[15px] leading-relaxed mt-4 max-w-sm">
                                Plataforma institucional para el seguimiento laboral y académico de los egresados de la UPC.
                            </p>
                        </div>

                        {/* Feature grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {features.map(({ icon: Icon, title, desc }) => (
                                <div key={title} className="rounded-2xl p-4 border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/8 transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-3">
                                        <Icon className="w-4 h-4 text-brand-200" />
                                    </div>
                                    <p className="text-white font-semibold text-sm leading-tight mb-1">{title}</p>
                                    <p className="text-white/45 text-xs leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-white/25 text-[11px]">
                        © {new Date().getFullYear()} Universidad Popular del Cesar · Sistema de Acreditación Institucional
                    </p>
                </div>
            </div>

            {/* ── Right panel: form ── */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative" style={{ backgroundColor: 'var(--color-surface-soft)' }}>
                <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(var(--color-pattern) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

                <div className="w-full max-w-[400px] relative z-10">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-10">
                        <img src="/logo.png" alt="Logo UPC" className="w-20 h-20 mx-auto mb-4 drop-shadow-md" />
                        <h1 className="text-xl font-bold text-ink tracking-tight">Portal de Egresados</h1>
                        <p className="text-ink-secondary text-sm mt-1">Universidad Popular del Cesar</p>
                    </div>

                    <div className="animate-fade-in-up">
                        <div className="mb-8 hidden lg:block">
                            <h2 className="text-[1.75rem] font-bold text-ink tracking-tight leading-tight">
                                {isRegistering ? 'Crear Cuenta' : 'Iniciar sesión'}
                            </h2>
                            <p className="text-ink-secondary mt-2 text-sm leading-relaxed">
                                {isRegistering 
                                    ? 'Únete al portal institucional y accede a oportunidades únicas.'
                                    : 'Ingresa tus credenciales para acceder al portal institucional.'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {isRegistering && (
                                <div className="space-y-1.5 mb-2">
                                    <label className="block text-sm font-semibold text-ink">Tipo de cuenta</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" checked={roleId === 3} onChange={() => setRoleId(3)} className="text-brand-600 focus:ring-brand-500" />
                                            <span className="text-sm font-medium text-ink-secondary">Egresado</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" checked={roleId === 2} onChange={() => setRoleId(2)} className="text-brand-600 focus:ring-brand-500" />
                                            <span className="text-sm font-medium text-ink-secondary">Empresa</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-ink">
                                    Correo electrónico
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                                        <Mail className="w-4 h-4 text-ink-tertiary" />
                                    </span>
                                    <input
                                        type="email"
                                        className="input"
                                        style={{ paddingLeft: '2.5rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', fontSize: '0.9375rem' }}
                                        placeholder="correo@upc.edu.co"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-ink">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                                        <Lock className="w-4 h-4 text-ink-tertiary" />
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="input"
                                        style={{ paddingLeft: '2.5rem', paddingRight: '3rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', fontSize: '0.9375rem' }}
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
                                        aria-label="Mostrar u ocultar contraseña"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm animate-scale-in">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-3.5 text-[15px] rounded-xl"
                                style={{ marginTop: '1.25rem' }}
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> {isRegistering ? 'Registrando...' : 'Verificando...'}</>
                                ) : (isRegistering ? 'Crear cuenta' : 'Acceder al Portal')}
                            </button>
                        </form>

                        <div className="text-center mt-6">
                            <button 
                                type="button"
                                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                                className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                            >
                                {isRegistering ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿No tienes cuenta? Regístrate como Egresado/Empresa'}
                            </button>
                        </div>

                        <p className="text-center text-xs text-ink-tertiary mt-6">
                            ¿Problemas para ingresar? Contacta a la Oficina de Egresados.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}