import { User } from "../types";
import { TASKS } from "../constants";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { motion } from "motion/react";
import BrandingLogo from "../components/BrandingLogo";
import Footer from "../components/Footer";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    onLogout();
  };

  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <BrandingLogo user={user} size="md" />
          </Link>
          {!user.branding?.logoUrl && (
            <div>
              <h1 className="text-xl font-serif font-bold text-stone-900 leading-tight">
                {user.newsroom || "Redacción IA"}
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Panel de Control</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          {(user.username === "willy" || user.username === "admin") && (
            <Link 
              to="/admin" 
              className="text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-2"
            >
              <Icons.Settings size={14} />
              Admin
            </Link>
          )}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-stone-800">{user.username}</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">
              Uso: {user.usage} / {user.dailyLimit} consultas
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
            title="Cerrar Sesión"
          >
            <Icons.LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-serif text-stone-900 mb-2">Tareas Recurrentes</h2>
          <p className="text-stone-500 max-w-2xl">
            Selecciona una herramienta para optimizar tu flujo de trabajo periodístico. 
            Todas las salidas están configuradas según los estándares de redacción latinoamericana.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TASKS.map((task, index) => {
            const IconComponent = (Icons as any)[task.icon];
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link 
                  to={`/task/${task.id}`}
                  className="group block bg-white p-8 rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl hover:shadow-stone-200/50 transition-all h-full"
                >
                  <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-brand-primary group-hover:text-white transition-colors mb-6">
                    {IconComponent && <IconComponent size={24} />}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">{task.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{task.description}</p>
                  
                  <div className="mt-8 flex items-center text-[10px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-stone-900 transition-colors">
                    Abrir Herramienta <Icons.ArrowRight size={12} className="ml-2" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
