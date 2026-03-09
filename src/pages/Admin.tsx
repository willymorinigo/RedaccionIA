import { useState, useEffect } from "react";
import { User, Branding } from "../types";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { motion } from "motion/react";
import Footer from "../components/Footer";
import BrandingLogo from "../components/BrandingLogo";

interface NewsroomConfig {
  name: string;
  logoUrl: string;
  primaryColor: string;
  bgColor: string;
}

interface AdminProps {
  user: User;
}

export default function Admin({ user }: AdminProps) {
  const [activeTab, setActiveTab] = useState<"newsrooms" | "users">("newsrooms");
  const [newsrooms, setNewsrooms] = useState<NewsroomConfig[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  
  // New item states
  const [isAdding, setIsAdding] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPassword, setNewItemPassword] = useState("");

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const refreshData = async () => {
    setLoading(true);
    // Small delay to allow Google Sheets to propagate changes
    await new Promise(resolve => setTimeout(resolve, 1000));
    await Promise.all([fetchNewsrooms(false), fetchUsers(false)]);
    setIsAdding(false);
    setNewItemName("");
    setNewItemPassword("");
    setLoading(false);
  };

  const fetchNewsrooms = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch(`/api/admin/newsrooms?t=${Date.now()}`);
      if (!response.ok) throw new Error("Error en la respuesta del servidor");
      const data = await response.json();
      setNewsrooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching newsrooms:", error);
      setNewsrooms([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchUsers = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch(`/api/admin/users?t=${Date.now()}`);
      if (!response.ok) throw new Error("Error en la respuesta del servidor");
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleUpdateNewsroom = async (name: string, field: string, value: string) => {
    setNewsrooms(prev => prev.map(n => n.name === name ? { ...n, [field]: value } : n));
  };

  const handleUpdateUser = async (username: string, field: string, value: any) => {
    setUsers(prev => prev.map(u => u.username === username ? { ...u, [field]: value } : u));
  };

  const handleSaveNewsroom = async (newsroom: NewsroomConfig) => {
    if (!newsroom.name) return alert("El nombre es obligatorio");
    setSaving(newsroom.name);
    try {
      const response = await fetch("/api/admin/newsrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newsroom),
      });
      
      if (response.ok) {
        alert("Redacción guardada correctamente.");
        refreshData();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "No se pudo guardar"}`);
      }
    } catch (error) {
      alert("Error de red al intentar guardar");
    } finally {
      setSaving(null);
    }
  };

  const handleSaveUser = async (userToSave: User) => {
    if (!userToSave.username) return alert("El nombre de usuario es obligatorio");
    setSaving(userToSave.username);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userToSave),
      });
      
      if (response.ok) {
        alert("Usuario guardado correctamente.");
        refreshData();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "No se pudo actualizar el usuario"}`);
      }
    } catch (error) {
      alert("Error de red al intentar actualizar usuario");
    } finally {
      setSaving(null);
    }
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setNewItemName("");
    setNewItemPassword("");
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewItemName("");
    setNewItemPassword("");
  };

  const isAdmin = user.username === "willy" || user.username === "admin";
  if (!isAdmin) {
    return <div className="p-8">Acceso denegado</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <header className="bg-white border-b border-stone-200 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 text-stone-400 hover:text-stone-900 transition-colors">
            <Icons.ChevronLeft size={24} />
          </Link>
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <BrandingLogo user={user as any} size="sm" />
          </Link>
          <div>
            <h1 className="text-xl font-serif font-bold text-stone-900 leading-tight">Administración Central</h1>
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
              {activeTab === "newsrooms" ? "Gestión de Redacciones" : "Gestión de Usuarios"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex bg-stone-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab("newsrooms")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "newsrooms" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
            >
              Redacciones
            </button>
            <button 
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "users" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
            >
              Usuarios
            </button>
          </div>
          
          {!isAdding && (
            <button
              onClick={handleAddClick}
              className="bg-stone-900 text-white p-2 rounded-xl hover:bg-stone-800 transition-colors"
              title={activeTab === "newsrooms" ? "Agregar Redacción" : "Agregar Usuario"}
            >
              <Icons.Plus size={20} />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-12">
        {activeTab === "newsrooms" ? (
          <>
            <div className="mb-12 flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-serif text-stone-900 mb-2">Configuración de Marca</h2>
                <p className="text-stone-500">
                  Define la identidad visual para cada grupo editorial.
                </p>
              </div>
              <button 
                onClick={refreshData}
                className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                title="Refrescar lista"
              >
                <Icons.RefreshCw size={20} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            {isAdding && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 bg-stone-900 text-white rounded-3xl p-8 shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-serif">Nueva Redacción</h3>
                  <button onClick={handleCancelAdd} className="text-stone-400 hover:text-white">
                    <Icons.X size={20} />
                  </button>
                </div>
                <div className="flex gap-4">
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Nombre de la redacción..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="flex-1 bg-white/10 border-none rounded-xl px-4 py-3 text-white placeholder:text-stone-500 outline-none focus:ring-2 focus:ring-white/20"
                  />
                  <button 
                    onClick={() => handleSaveNewsroom({ name: newItemName, logoUrl: "", primaryColor: "#1c1917", bgColor: "#fafaf9" })}
                    disabled={!newItemName || saving === newItemName}
                    className="bg-white text-stone-900 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-stone-100 transition-all disabled:opacity-50"
                  >
                    {saving === newItemName ? "Guardando..." : "Crear Redacción"}
                  </button>
                </div>
              </motion.div>
            )}

            {loading ? (
              <div className="animate-pulse text-stone-400 italic font-serif">Cargando configuraciones...</div>
            ) : (
              <div className="space-y-8">
                {newsrooms.map((nr) => (
                  <motion.div 
                    key={nr.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-serif font-bold text-stone-900">{nr.name}</h3>
                      <button
                        onClick={() => handleSaveNewsroom(nr)}
                        disabled={saving === nr.name}
                        className="bg-stone-900 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-50"
                      >
                        {saving === nr.name ? "Guardando..." : "Guardar Cambios"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-2">URL del Logo (.png)</label>
                        <input
                          type="text"
                          value={nr.logoUrl}
                          onChange={(e) => handleUpdateNewsroom(nr.name, "logoUrl", e.target.value)}
                          className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-stone-200 transition-all outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-2">Color Primario</label>
                        <input
                          type="text"
                          value={nr.primaryColor}
                          onChange={(e) => handleUpdateNewsroom(nr.name, "primaryColor", e.target.value)}
                          className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-stone-200 transition-all outline-none text-sm font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-2">Color de Fondo</label>
                        <input
                          type="text"
                          value={nr.bgColor}
                          onChange={(e) => handleUpdateNewsroom(nr.name, "bgColor", e.target.value)}
                          className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-stone-200 transition-all outline-none text-sm font-mono"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-12 flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-serif text-stone-900 mb-2">Gestión de Usuarios</h2>
                <p className="text-stone-500">
                  Administra los accesos, límites y redacciones de los periodistas.
                </p>
              </div>
              <button 
                onClick={refreshData}
                className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                title="Refrescar lista"
              >
                <Icons.RefreshCw size={20} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            {loading ? (
              <div className="animate-pulse text-stone-400 italic font-serif">Cargando usuarios...</div>
            ) : (
              <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-100">
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-400">Usuario</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-400">Redacción</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-400">Límite Diario</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-400 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {isAdding && (
                      <tr className="bg-stone-900 text-white">
                        <td className="px-6 py-4">
                          <input 
                            autoFocus
                            type="text"
                            placeholder="nombre.apellido"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            className="w-full bg-white/10 border-none rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-stone-500 outline-none mb-2"
                          />
                          <input 
                            type="text"
                            placeholder="contraseña"
                            value={newItemPassword}
                            onChange={(e) => setNewItemPassword(e.target.value)}
                            className="w-full bg-white/10 border-none rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-stone-500 outline-none"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] text-stone-400 italic">Se asignará al guardar</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] text-stone-400 italic">20 (defecto)</span>
                        </td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                          <button 
                            onClick={handleCancelAdd}
                            className="text-stone-400 hover:text-white"
                          >
                            <Icons.X size={18} />
                          </button>
                          <button
                            onClick={() => handleSaveUser({ 
                              username: newItemName, 
                              password: newItemPassword || "123", 
                              dailyLimit: 20, 
                              usage: 0, 
                              newsroom: newsrooms[0]?.name || "Admin" 
                            })}
                            disabled={!newItemName || saving === newItemName}
                            className="text-white hover:text-stone-300 disabled:opacity-30"
                          >
                            <Icons.Save size={18} />
                          </button>
                        </td>
                      </tr>
                    )}
                    {users.map((u) => (
                      <tr key={u.username} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-stone-900">{u.username}</div>
                          <div className="text-[10px] text-stone-400 mb-2">Uso actual: {u.usage}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase font-bold text-stone-300">Pass:</span>
                            <input 
                              type="text"
                              value={u.password}
                              onChange={(e) => handleUpdateUser(u.username, "password", e.target.value)}
                              className="bg-stone-100 border-none rounded px-2 py-1 text-[10px] w-24 focus:ring-1 focus:ring-stone-200 outline-none"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={u.newsroom}
                            onChange={(e) => handleUpdateUser(u.username, "newsroom", e.target.value)}
                            className="bg-stone-100 border-none rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-stone-200 outline-none"
                          >
                            {newsrooms.map(nr => (
                              <option key={nr.name} value={nr.name}>{nr.name}</option>
                            ))}
                            {!newsrooms.some(nr => nr.name === u.newsroom) && (
                              <option value={u.newsroom}>{u.newsroom}</option>
                            )}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            type="number"
                            value={u.dailyLimit}
                            onChange={(e) => handleUpdateUser(u.username, "dailyLimit", parseInt(e.target.value))}
                            className="w-20 bg-stone-100 border-none rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-stone-200 outline-none"
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleSaveUser(u)}
                            disabled={saving === u.username}
                            className="text-stone-900 hover:text-stone-600 disabled:opacity-30"
                          >
                            <Icons.Save size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
