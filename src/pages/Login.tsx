import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { animate, stagger, createTimeline } from "animejs";
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiShield,
  FiZap, FiSmartphone, FiSun, FiMoon, FiExternalLink, FiAlertCircle,
  FiKey,
} from "react-icons/fi";
import PeruMarketLogo from "../resources/PeruMarketERPLogo.png";
import { authService, type LoginRequest } from "../services/authService";
import { useTheme } from "../context/ThemeContext";
import "../styles/Login.css";

// Credenciales de prueba (usuario Administrador del seed de Supabase)
const DEMO = { email: "jean@perumarket.com", password: "Admin123!" };

export default function Login() {
  const navigate = useNavigate();
  const { mode, toggleMode } = useTheme();

  const [email, setEmail] = useState(
    () => localStorage.getItem("remember-email") ?? ""
  );
  const [pass, setPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(
    () => Boolean(localStorage.getItem("remember-email"))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  // Burbujas decorativas (bokeh) del fondo
  const bokeh = useMemo(
    () =>
      Array.from({ length: 18 }).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 30 + Math.random() * 130,
        o: 0.04 + Math.random() * 0.1,
      })),
    []
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const sel = (s: string) => root.querySelectorAll(s);

    const tl = createTimeline({
      defaults: { ease: "outExpo", duration: reduce ? 1 : 800 },
    });

    tl.add(
      sel('[data-anim="form"]'),
      {
        opacity: [0, 1],
        translateY: [22, 0],
        delay: stagger(reduce ? 0 : 60),
      },
      0
    ).add(
      sel('[data-anim="brand"]'),
      {
        opacity: [0, 1],
        scale: [0.94, 1],
        delay: stagger(reduce ? 0 : 90),
      },
      reduce ? 0 : 120
    );

    if (!reduce) {
      animate(sel('[data-anim="bokeh"]'), {
        translateY: [0, -18],
        loop: true,
        alternate: true,
        duration: 4200,
        ease: "inOutSine",
        delay: stagger(200),
      });
    }

    return () => {
      tl.pause();
    };
  }, []);

  useEffect(() => {
    if (!error || !errorRef.current) return;
    animate(errorRef.current, {
      translateX: [0, -10, 10, -7, 7, -3, 3, 0],
      duration: 480,
      ease: "outQuad",
    });
  }, [error]);

  const handleLogin = async () => {
    if (email === "" || pass === "") {
      setError("Por favor, complete todos los campos");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const credentials: LoginRequest = {
        email: email.trim(),
        password: pass,
      };
      const response = await authService.login(credentials);
      if (response.success) {
        if (remember) localStorage.setItem("remember-email", email.trim());
        else localStorage.removeItem("remember-email");
        navigate("/dashboard");
      } else {
        setError(response.message || "Credenciales incorrectas");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al iniciar sesión";
      console.error("Error en login:", err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const usarDemo = () => {
    setEmail(DEMO.email);
    setPass(DEMO.password);
    setError("");
  };

  const inputBase =
    "w-full pl-11 pr-4 py-3 bg-white border border-transparent rounded-lg text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/70 transition-all";

  return (
    <div
      ref={rootRef}
      className="relative min-h-screen flex items-center justify-center font-sans text-white overflow-x-hidden py-8 px-4 sm:px-6 bg-gradient-to-br from-[#3a0a08] via-[#160404] to-[#2a0707]"
    >
      {/* Burbujas / bokeh de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {bokeh.map((b, i) => (
          <span
            key={i}
            data-anim="bokeh"
            className="absolute rounded-full bg-[#E0312A]"
            style={{
              top: `${b.top}%`,
              left: `${b.left}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              opacity: b.o,
              filter: "blur(2px)",
            }}
          />
        ))}
        <div className="absolute -top-40 -right-32 w-[34rem] h-[34rem] rounded-full bg-[#E0312A]/15 blur-[130px]" />
        <div className="absolute -bottom-48 -left-32 w-[34rem] h-[34rem] rounded-full bg-[#6E0F0B]/30 blur-[130px]" />
      </div>

      {/* Toggle de tema */}
      <button
        type="button"
        onClick={toggleMode}
        title="Cambiar tema"
        className="absolute top-6 right-6 z-30 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
      >
        {mode === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
      </button>

      {/* ───────────── Tarjeta principal ───────────── */}
      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 lg:min-h-[640px] rounded-3xl sm:rounded-[2rem] overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
        {/* ── Panel izquierdo: ilustración / marca ── */}
        <div className="relative hidden lg:flex flex-col bg-white p-8 overflow-hidden">
          {/* Logo arriba */}
          <div data-anim="brand" className="opacity-0 relative z-10 flex items-center gap-3">
            <img
              src={PeruMarketLogo}
              alt="Peru Market"
              className="h-12 w-auto object-contain"
            />
            <div>
              <p className="text-sm font-bold leading-tight text-[#A91E16]">
                PERU MARKET
              </p>
              <p className="text-xs font-medium text-gray-500">Sistema ERP</p>
            </div>
          </div>

          {/* Ilustración central */}
          <div className="relative z-10 flex-1 flex items-center justify-center py-10">
            {/* Halos suaves */}
            <div className="absolute w-72 h-72 rounded-full bg-[#E0312A]/10 blur-2xl" />
            <div className="absolute w-52 h-52 rounded-full bg-[#E0312A]/5" />
            <div
              data-anim="brand"
              className="opacity-0 relative inline-flex items-center justify-center bg-gradient-to-br from-[#E0312A] to-[#A91E16] rounded-[2rem] p-10 shadow-xl shadow-[#E0312A]/30"
            >
              <img
                src={PeruMarketLogo}
                alt="Peru Market"
                className="h-40 xl:h-48 w-auto object-contain brightness-0 invert"
              />
            </div>
          </div>

          {/* Footer del panel */}
          <p
            data-anim="brand"
            className="opacity-0 relative z-10 text-xs text-gray-400"
          >
            © 2026 Peru Market — Todos los derechos reservados
          </p>
        </div>

        {/* ── Panel derecho: formulario ── */}
        <div className="relative flex flex-col justify-center bg-gradient-to-br from-[#E0312A] via-[#B91C1C] to-[#7E120D] px-6 py-8 sm:p-10 lg:p-12">
          {/* Logo visible solo en movil (el panel ilustrado se oculta) */}
          <div data-anim="form" className="opacity-0 lg:hidden mb-5 flex items-center gap-3">
            <div className="inline-flex bg-white rounded-xl p-2 shadow-md">
              <img
                src={PeruMarketLogo}
                alt="Peru Market"
                className="h-9 w-auto object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-white">PERU MARKET</p>
              <p className="text-xs font-medium text-white/70">Sistema ERP</p>
            </div>
          </div>

          <div className="w-full max-w-sm mx-auto">
            <h1
              data-anim="form"
              className="opacity-0 text-3xl sm:text-4xl font-bold text-white"
            >
              Iniciar Sesión
            </h1>
            <p data-anim="form" className="opacity-0 mt-1.5 text-white/70 text-sm">
              Bienvenido de nuevo, ingresa tus credenciales.
            </p>

            {/* Datos de prueba */}
            <div
              data-anim="form"
              className="opacity-0 mt-5 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <FiKey className="w-4 h-4 text-white" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/90">
                  Datos de prueba
                </span>
              </div>
              <p className="text-xs text-white/80">
                Correo: <span className="font-medium text-white">{DEMO.email}</span>
              </p>
              <p className="text-xs text-white/80">
                Contraseña:{" "}
                <span className="font-medium text-white">{DEMO.password}</span>
              </p>
              <button
                type="button"
                onClick={usarDemo}
                className="mt-2 text-xs font-semibold text-white underline-offset-2 hover:underline"
              >
                Usar datos de prueba →
              </button>
            </div>

            {/* Error */}
            {error && (
              <div
                ref={errorRef}
                className="mt-5 flex items-center gap-3 rounded-lg border border-white/30 bg-black/20 px-4 py-3"
              >
                <FiAlertCircle className="w-5 h-5 text-white flex-shrink-0" />
                <p className="text-sm text-white">{error}</p>
              </div>
            )}

            {/* Formulario */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="mt-5 space-y-4"
            >
              {/* Correo */}
              <div data-anim="form" className="opacity-0">
                <label className="block text-sm font-medium text-white/90 mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative group">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    disabled={isLoading}
                    autoComplete="email"
                    className={inputBase}
                    placeholder="nombre@perumarket.com"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div data-anim="form" className="opacity-0">
                <label className="block text-sm font-medium text-white/90 mb-1.5">
                  Contraseña
                </label>
                <div className="relative group">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    disabled={isLoading}
                    autoComplete="current-password"
                    className={`${inputBase} pr-11`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E0312A] transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {/* Recordar / recuperar */}
              <div
                data-anim="form"
                className="flex flex-wrap items-center justify-between gap-2 opacity-0"
              >
                <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer select-none whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-white/30 bg-white/10 accent-white"
                  />
                  Recordar sesión
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setError(
                      "Para recuperar tu acceso contacta al administrador del sistema."
                    )
                  }
                  className="text-sm font-medium text-white/90 hover:text-white hover:underline underline-offset-2 transition-colors whitespace-nowrap"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Botón principal */}
              <button
                type="submit"
                disabled={isLoading}
                data-anim="form"
                className="opacity-0 w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-[#A91E16] bg-white shadow-lg hover:bg-white/95 hover:shadow-xl active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-[#E0312A]/40 border-t-[#E0312A] rounded-full animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <FiArrowRight size={18} />
                    Iniciar Sesión
                  </>
                )}
              </button>
            </form>

            {/* Botón secundario */}
            <button
              type="button"
              data-anim="form"
              onClick={() => navigate("/test-connection")}
              className="opacity-0 mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-white/90 border border-white/30 hover:bg-white/10 transition-all"
            >
              <FiExternalLink size={16} />
              Probar conexión
            </button>

            {/* Badges de confianza (ocultos en movil para mantener el card centrado) */}
            <div
              data-anim="form"
              className="opacity-0 mt-6 hidden sm:flex flex-wrap items-center justify-center gap-2"
            >
              {[
                { icon: <FiShield size={14} />, label: "Seguro" },
                { icon: <FiZap size={14} />, label: "Rápido" },
                { icon: <FiSmartphone size={14} />, label: "Responsive" },
              ].map((b) => (
                <span
                  key={b.label}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium"
                >
                  {b.icon}
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
