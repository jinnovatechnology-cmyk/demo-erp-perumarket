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

  const particles = useMemo(
    () =>
      Array.from({ length: 26 }).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 2 + Math.random() * 5,
        o: 0.1 + Math.random() * 0.35,
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
        translateX: [-26, 0],
        delay: stagger(reduce ? 0 : 65),
      },
      0
    ).add(
      sel('[data-anim="brand"]'),
      {
        opacity: [0, 1],
        translateY: [26, 0],
        delay: stagger(reduce ? 0 : 90),
      },
      reduce ? 0 : 150
    );

    if (!reduce) {
      animate(sel('[data-anim="particle"]'), {
        translateY: [0, -14],
        opacity: [0.12, 0.4],
        loop: true,
        alternate: true,
        duration: 3200,
        ease: "inOutSine",
        delay: stagger(160),
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
    "w-full pl-12 pr-4 py-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/35 focus:outline-none focus:border-[#E0312A] focus:ring-2 focus:ring-[#E0312A]/30 focus:bg-white/[0.06] transition-all";

  return (
    <div
      ref={rootRef}
      className="min-h-screen flex bg-[#0b0b0c] font-sans text-white overflow-hidden"
    >
      {/* Toggle de tema */}
      <button
        type="button"
        onClick={toggleMode}
        title="Cambiar tema"
        className="absolute top-6 right-6 z-30 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
      >
        {mode === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
      </button>

      {/* ───────────── Panel Izquierdo: Formulario ───────────── */}
      <div className="w-full lg:w-[44%] flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div data-anim="form" className="mb-8 opacity-0">
            <div className="inline-flex bg-white rounded-2xl p-3 shadow-lg">
              <img
                src={PeruMarketLogo}
                alt="Peru Market"
                className="h-14 w-auto object-contain"
              />
            </div>
            <div className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-[#E0312A] to-[#A91E16]" />
            <p className="mt-4 text-white/50 text-sm">
              Inicia sesión en tu cuenta
            </p>
          </div>

          {/* Datos de prueba */}
          <div
            data-anim="form"
            className="mb-5 rounded-xl border border-[#E0312A]/30 bg-[#E0312A]/[0.07] p-4 opacity-0"
          >
            <div className="flex items-center gap-2 mb-2">
              <FiKey className="w-4 h-4 text-[#F0726A]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#F0726A]">
                Datos de prueba
              </span>
            </div>
            <p className="text-sm text-white/70">
              Correo:{" "}
              <span className="font-medium text-white">{DEMO.email}</span>
            </p>
            <p className="text-sm text-white/70">
              Contraseña:{" "}
              <span className="font-medium text-white">{DEMO.password}</span>
            </p>
            <button
              type="button"
              onClick={usarDemo}
              className="mt-3 text-xs font-semibold text-[#F0726A] hover:text-[#F8A39D] transition-colors"
            >
              Usar datos de prueba →
            </button>
          </div>

          {/* Error */}
          {error && (
            <div
              ref={errorRef}
              className="mb-5 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
            >
              <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Formulario */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-5"
          >
            {/* Correo */}
            <div data-anim="form" className="opacity-0">
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Correo electrónico
              </label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35 group-focus-within:text-[#E0312A] transition-colors" />
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
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Contraseña
              </label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35 group-focus-within:text-[#E0312A] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  disabled={isLoading}
                  autoComplete="current-password"
                  className={`${inputBase} pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#E0312A] transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* Recordar / recuperar */}
            <div
              data-anim="form"
              className="flex items-center justify-between opacity-0"
            >
              <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[#E0312A]"
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
                className="text-sm font-medium text-[#F0726A] hover:text-[#F8A39D] transition-colors"
              >
                Recuperar acceso
              </button>
            </div>

            {/* Botón principal */}
            <button
              type="submit"
              disabled={isLoading}
              data-anim="form"
              className="opacity-0 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#E0312A] to-[#A91E16] shadow-lg shadow-[#E0312A]/30 hover:shadow-xl hover:shadow-[#E0312A]/40 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
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

          {/* Divisor */}
          <div data-anim="form" className="my-6 flex items-center gap-4 opacity-0">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30">o</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Botón secundario */}
          <button
            type="button"
            data-anim="form"
            onClick={() => navigate("/test-connection")}
            className="opacity-0 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-white/80 border border-white/10 hover:bg-white/[0.05] hover:text-white transition-all"
          >
            <FiExternalLink size={16} />
            Probar conexión
          </button>

          {/* Footer */}
          <p
            data-anim="form"
            className="mt-8 text-center text-xs text-white/30 opacity-0"
          >
            © 2026 Peru Market — Todos los derechos reservados
          </p>
        </div>
      </div>

      {/* ───────────── Panel Derecho: Marca ───────────── */}
      <div className="hidden lg:flex lg:w-[56%] relative items-center justify-center overflow-hidden bg-gradient-to-br from-[#E0312A] via-[#B91C1C] to-[#6E0F0B]">
        {/* Partículas */}
        <div className="absolute inset-0">
          {particles.map((p, i) => (
            <span
              key={i}
              data-anim="particle"
              className="absolute rounded-full bg-white"
              style={{
                top: `${p.top}%`,
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.o,
              }}
            />
          ))}
        </div>

        {/* Glow sutil */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#F0473B]/25 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 w-96 h-96 rounded-full bg-[#6E0F0B]/50 blur-3xl" />

        {/* Contenido */}
        <div className="relative z-10 text-center px-12">
          <div
            data-anim="brand"
            className="opacity-0 inline-flex bg-white rounded-3xl p-8 shadow-2xl"
          >
            <img
              src={PeruMarketLogo}
              alt="Peru Market"
              className="h-40 xl:h-48 w-auto object-contain"
            />
          </div>
          <h2
            data-anim="brand"
            className="opacity-0 mt-10 text-3xl font-bold text-white"
          >
            Sistema ERP
          </h2>
          <p
            data-anim="brand"
            className="opacity-0 mt-3 text-white/80 text-lg max-w-md mx-auto"
          >
            Gestiona tu negocio de manera inteligente y eficiente
          </p>

          {/* Badges */}
          <div
            data-anim="brand"
            className="opacity-0 mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            {[
              { icon: <FiShield size={16} />, label: "Seguro" },
              { icon: <FiZap size={16} />, label: "Rápido" },
              { icon: <FiSmartphone size={16} />, label: "Responsive" },
            ].map((b) => (
              <span
                key={b.label}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm text-white text-sm font-medium"
              >
                {b.icon}
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
