import { useState } from "react";
import { User } from "../types";
import { LogIn, Mail, Send, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showRequest, setShowRequest] = useState(false);
  const [requestData, setRequestData] = useState({ name: "", email: "", reason: "" });
  const [requestSent, setRequestSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        onLogin(data);
      } else {
        const err = await res.json();
        setError(err.error || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("Error de conexión");
    }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      if (res.ok) {
        setRequestSent(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f2ed] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif font-light tracking-tight text-stone-900 mb-2">
            Redacción <span className="italic">IA</span>
          </h1>
          <p className="text-stone-500 uppercase tracking-widest text-xs font-medium">
            Sistema de Gestión Periodística
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 p-8 border border-stone-100"
        >
          {!showRequest ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-2">Usuario</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-stone-200 transition-all outline-none"
                  placeholder="nombre.apellido"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-2">Contraseña</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-stone-200 transition-all outline-none pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 bottom-3 p-1 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && (
                <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                  <p className="text-red-500 text-xs italic text-center">
                    {error}. <br/>
                    <span className="font-bold">Tip:</span> Usa el "ojito" para revisar que la contraseña sea correcta.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-stone-900 text-white rounded-xl py-4 font-medium flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors"
              >
                <LogIn size={18} />
                Ingresar al Sistema
              </button>

              <div className="pt-4 border-top border-stone-100 text-center">
                <button
                  type="button"
                  onClick={() => setShowRequest(true)}
                  className="text-stone-400 text-xs hover:text-stone-600 transition-colors"
                >
                  ¿No tienes acceso? Solicitar credenciales
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {!requestSent ? (
                <form onSubmit={handleRequest} className="space-y-4">
                  <h2 className="text-xl font-serif text-stone-800 mb-4 italic">Solicitud de Acceso</h2>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      value={requestData.name}
                      onChange={(e) => setRequestData({ ...requestData, name: e.target.value })}
                      className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={requestData.email}
                      onChange={(e) => setRequestData({ ...requestData, email: e.target.value })}
                      className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-1">Motivo / Redacción</label>
                    <textarea
                      value={requestData.reason}
                      onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
                      className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 outline-none min-h-[100px]"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-stone-900 text-white rounded-xl py-4 font-medium flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    Enviar Solicitud
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRequest(false)}
                    className="w-full text-stone-400 text-xs py-2"
                  >
                    Volver al login
                  </button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail size={32} />
                  </div>
                  <h3 className="text-lg font-serif text-stone-800 mb-2">Solicitud Enviada</h3>
                  <p className="text-stone-500 text-sm mb-6">
                    Tu pedido ha sido registrado. El administrador revisará tu solicitud y te contactará por email.
                  </p>
                  <button
                    onClick={() => setShowRequest(false)}
                    className="text-stone-900 font-bold text-xs uppercase tracking-widest"
                  >
                    Volver al login
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
        
        <p className="text-center mt-8 text-stone-400 text-[10px] uppercase tracking-[0.2em]">
          © 2026 Editorial Intelligence System
        </p>
      </div>
    </div>
  );
}
