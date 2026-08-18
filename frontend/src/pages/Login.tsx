import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, BookOpen, Users, Award, Briefcase, GraduationCap, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
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
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegistering) {
                await authApi.post('/register', { email, password, role_id: roleId });
                setRegistrationSuccess(true);
            } else {
                const { data } = await authApi.post('/login', { email, password });
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                if (data.user.role_name === 'GRADUATE') {
                    navigate('/profile', { replace: true });
                } else {
                    navigate('/companies', { replace: true });
                }
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

    const handleResendEmail = async () => {
        try {
            await authApi.post('/resend-verification', { email });
            alert("Correo de verificación reenviado a " + email);
        } catch (err: unknown) {
            const apiErr = err as ApiError;
            alert(apiErr.response?.data?.detail || "Error al reenviar el correo");
        }
    };

    // Calculate a simple password strength
    const getPasswordStrength = () => {
        if (!password) return 0;
        let score = 0;
        if (password.length > 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score; // 0 to 4
    };

    const strength = getPasswordStrength();
    const strengthLabels = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'];
    const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-brand-400', 'bg-green-500'];

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
                    <div className="flex items-center gap-4 animate-fade-in-up">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 shadow-lg">
                            <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-[15px] leading-tight">Universidad Popular del Cesar</p>
                            <p className="text-white/50 text-xs font-medium mt-0.5">Oficina de Seguimiento a Egresados</p>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="space-y-10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
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
                            {features.map(({ icon: Icon, title, desc }, idx) => (
                                <div key={title} className="rounded-2xl p-4 border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/8 transition-colors animate-fade-in-up" style={{ animationDelay: `${200 + idx * 50}ms` }}>
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
                    <p className="text-white/25 text-[11px] animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                        © {new Date().getFullYear()} Universidad Popular del Cesar · Sistema de Acreditación Institucional
                    </p>
                </div>
            </div>

            {/* ── Right panel: form ── */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative bg-[var(--bg-main)]">
                <div className="absolute inset-0 pointer-events-none opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(var(--border-color) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                <div className="w-full max-w-[420px] relative z-10">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-10">
                        <div className="w-20 h-20 mx-auto mb-4 bg-brand-600 rounded-2xl shadow-lg flex items-center justify-center text-white">
                             <GraduationCap className="w-10 h-10" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Portal de Egresados</h1>
                        <p className="text-ink-secondary text-sm mt-1">Universidad Popular del Cesar</p>
                    </div>

                    {registrationSuccess ? (
                        <div className="animate-scale-in text-center bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Mail className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Revisa tu correo</h2>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                Hemos enviado un enlace de verificación a <br/>
                                <strong className="text-slate-800 font-semibold">{email}</strong>. 
                                <br/><br/>
                                Haz clic en el enlace para activar tu cuenta y poder iniciar sesión.
                            </p>
                            
                            <div className="space-y-3">
                                <button 
                                    onClick={() => { setRegistrationSuccess(false); setIsRegistering(false); setPassword(''); }}
                                    className="w-full btn-primary py-3"
                                >
                                    Volver al Login
                                </button>
                                <button 
                                    onClick={handleResendEmail}
                                    className="w-full btn-ghost py-3 text-sm"
                                >
                                    No recibí el correo, reenviar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in-up bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100">
                            <div className="mb-8">
                                <h2 className="text-[1.75rem] font-bold text-slate-800 tracking-tight leading-tight">
                                    {isRegistering ? 'Crear Cuenta' : 'Bienvenido de nuevo'}
                                </h2>
                                <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                    {isRegistering 
                                        ? 'Únete al portal institucional y accede a oportunidades únicas.'
                                        : 'Ingresa tus credenciales para acceder al portal institucional.'}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {isRegistering && (
                                    <div className="space-y-2 mb-4">
                                        <label className="block text-sm font-semibold text-slate-700">¿Cómo deseas registrarte?</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className={`relative flex flex-col items-center p-4 cursor-pointer rounded-2xl border-2 transition-all ${roleId === 3 ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-200'}`}>
                                                <input type="radio" checked={roleId === 3} onChange={() => setRoleId(3)} className="sr-only" />
                                                <GraduationCap className={`w-8 h-8 mb-2 ${roleId === 3 ? 'text-brand-600' : 'text-slate-400'}`} />
                                                <span className={`text-sm font-bold ${roleId === 3 ? 'text-brand-700' : 'text-slate-600'}`}>Egresado</span>
                                                {roleId === 3 && <div className="absolute top-2 right-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /></div>}
                                            </label>
                                            <label className={`relative flex flex-col items-center p-4 cursor-pointer rounded-2xl border-2 transition-all ${roleId === 2 ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-200'}`}>
                                                <input type="radio" checked={roleId === 2} onChange={() => setRoleId(2)} className="sr-only" />
                                                <Building2 className={`w-8 h-8 mb-2 ${roleId === 2 ? 'text-brand-600' : 'text-slate-400'}`} />
                                                <span className={`text-sm font-bold ${roleId === 2 ? 'text-brand-700' : 'text-slate-600'}`}>Empresa</span>
                                                {roleId === 2 && <div className="absolute top-2 right-2"><CheckCircle2 className="w-4 h-4 text-brand-500" /></div>}
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Correo electrónico
                                    </label>
                                    <div className="relative group">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 transition-colors group-focus-within:text-brand-600">
                                            <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-brand-600" />
                                        </span>
                                        <input
                                            type="email"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                                            style={{ paddingLeft: '2.75rem', paddingTop: '0.875rem', paddingBottom: '0.875rem', fontSize: '0.9375rem' }}
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
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Contraseña
                                    </label>
                                    <div className="relative group">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 transition-colors group-focus-within:text-brand-600">
                                            <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-brand-600" />
                                        </span>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                                            style={{ paddingLeft: '2.75rem', paddingRight: '3rem', paddingTop: '0.875rem', paddingBottom: '0.875rem', fontSize: '0.9375rem' }}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                            tabIndex={-1}
                                            aria-label="Mostrar u ocultar contraseña"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    
                                    {isRegistering && password.length > 0 && (
                                        <div className="pt-2 animate-fade-in-up">
                                            <div className="flex gap-1 h-1.5 mb-1.5">
                                                {[...Array(4)].map((_, i) => (
                                                    <div key={i} className={`h-full flex-1 rounded-full transition-colors duration-300 ${i < strength ? strengthColors[strength] : 'bg-slate-200'}`} />
                                                ))}
                                            </div>
                                            <p className="text-xs font-medium text-slate-500 text-right">{strengthLabels[strength]}</p>
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm animate-scale-in">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                                        <span dangerouslySetInnerHTML={{ __html: error }} />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || (isRegistering && strength < 2)}
                                    className="w-full btn-primary py-3.5 text-[15px] rounded-xl font-bold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all relative overflow-hidden group"
                                    style={{ marginTop: '1.5rem' }}
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                                    <span className="relative flex items-center justify-center gap-2">
                                        {loading ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> {isRegistering ? 'Creando cuenta...' : 'Iniciando sesión...'}</>
                                        ) : (
                                            <>{isRegistering ? 'Crear cuenta ahora' : 'Acceder al Portal'} {!isRegistering && <ArrowRight className="w-4 h-4" />}</>
                                        )}
                                    </span>
                                </button>
                            </form>

                            <div className="mt-8 flex items-center">
                                <div className="flex-1 border-t border-slate-200"></div>
                                <span className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">O</span>
                                <div className="flex-1 border-t border-slate-200"></div>
                            </div>

                            <div className="text-center mt-6">
                                <button 
                                    type="button"
                                    onClick={() => { setIsRegistering(!isRegistering); setError(''); setPassword(''); }}
                                    className="text-[15px] font-semibold text-slate-600 hover:text-brand-600 transition-colors"
                                >
                                    {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate gratis'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}