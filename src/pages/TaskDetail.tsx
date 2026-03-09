import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { User, Task } from "../types";
import { TASKS } from "../constants";
import { generateTaskContent } from "../services/gemini";
import * as Icons from "lucide-react";
import { motion } from "motion/react";
import Markdown from "react-markdown";
import BrandingLogo from "../components/BrandingLogo";
import Footer from "../components/Footer";

interface TaskDetailProps {
  user: User;
  onRefreshUser: () => void;
}

export default function TaskDetail({ user, onRefreshUser }: TaskDetailProps) {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const task = TASKS.find((t) => t.id === taskId);
  
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  const [copyingIndex, setCopyingIndex] = useState<number | null>(null);

  if (!task) {
    return <div className="p-8">Tarea no encontrada</div>;
  }

  const IconComponent = (Icons as any)[task.icon];

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const output = await generateTaskContent(task, inputs);
      setResult(output);
      // Wait a bit for the background track-usage to finish and then refresh user
      setTimeout(onRefreshUser, 2000);
    } catch (err) {
      setError("Ocurrió un error al generar el contenido. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    }
  };

  const handleCopyItem = (text: string, index: number) => {
    // Remove the number prefix if it exists (e.g., "1. ")
    let cleanText = text.replace(/^\d+[\.\)]\s+/, "").replace(/^(Tweet|Bajada|Prompt|Idea|Cita)\s[A-Z0-9]+[:\s]\s*/, "");
    
    // Remove character counts like (65 car.) or (120 car) or [120 car] or (65 caracteres)
    // More robust regex to catch variations
    cleanText = cleanText.replace(/\s*[\(\[]\d+\s*(car|caracteres|chars).*?[\)\]]/gi, "");
    
    navigator.clipboard.writeText(cleanText.trim());
    setCopyingIndex(index);
    setTimeout(() => setCopyingIndex(null), 2000);
  };

  const parseResultItems = (text: string) => {
    if (!text) return null;
    
    // Check if it's a numbered list
    if (/^\d+[\.\)]\s/m.test(text)) {
      return text.split(/\n(?=\d+[\.\)]\s)/).map(i => i.trim()).filter(Boolean);
    }
    
    // Check if it's a bulleted list
    if (/^[•\-\*]\s/m.test(text)) {
      return text.split(/\n(?=[•\-\*]\s)/).map(i => i.trim()).filter(Boolean);
    }

    // Check for specific prefixes
    if (/^(Tweet|Bajada|Prompt|Idea|Cita)\s[A-Z0-9]+[:\s]/m.test(text)) {
      return text.split(/\n(?=(Tweet|Bajada|Prompt|Idea|Cita)\s[A-Z0-9]+[:\s])/).map(i => i.trim()).filter(Boolean);
    }

    return null;
  };

  const resultItems = parseResultItems(result || "");

  const renderItem = (item: string, index: number) => {
    // Extract character count if present
    const charCountMatch = item.match(/[\(\[](\d+\s*car[\.\s]*)[\)\]]\s*$/);
    const charCount = charCountMatch ? charCountMatch[0] : null;
    const itemText = charCount ? item.replace(charCount, "").trim() : item;

    return (
      <motion.div 
        key={index}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group bg-stone-50 rounded-2xl p-5 border border-stone-100 hover:border-brand-primary/20 hover:bg-white transition-all relative"
      >
        <div className="pr-10 text-stone-800 text-sm leading-relaxed">
          <Markdown>{itemText}</Markdown>
          {charCount && (
            <span className="inline-block mt-2 px-2 py-0.5 bg-stone-200 text-stone-500 rounded text-[9px] font-bold uppercase tracking-wider">
              {charCount.replace(/[\(\)\[\]]/g, "").trim()}
            </span>
          )}
        </div>
        <button
          onClick={() => handleCopyItem(item, index)}
          className="absolute top-4 right-4 p-2 rounded-lg bg-white border border-stone-200 text-stone-400 hover:text-brand-primary hover:border-brand-primary transition-all shadow-sm opacity-0 group-hover:opacity-100"
          title="Copiar este item"
        >
          {copyingIndex === index ? (
            <Icons.Check size={14} className="text-green-500" />
          ) : (
            <Icons.Copy size={14} />
          )}
        </button>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-bg font-sans pb-20">
      <header className="bg-white border-b border-stone-200 px-8 py-4 grid grid-cols-3 items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 text-stone-400 hover:text-stone-900 transition-colors">
            <Icons.ChevronLeft size={24} />
          </Link>
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <BrandingLogo user={user} size="sm" />
          </Link>
        </div>

        <div className="flex items-center justify-center">
          <h1 className="text-xl font-serif font-bold text-stone-900">{task.title}</h1>
        </div>
        
        <div className="text-right">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">
            Usuario: {user.username}
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Input Section */}
        <section className="space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm">
            <h2 className="text-xl font-serif font-bold text-stone-900 mb-6 italic">Configuración de la Tarea</h2>
            
            <div className="space-y-6">
              {task.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-2">
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={inputs[field.name] || ""}
                      onChange={(e) => setInputs({ ...inputs, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full bg-stone-50 border-none rounded-2xl px-5 py-4 min-h-[250px] focus:ring-2 focus:ring-stone-200 transition-all outline-none text-sm leading-relaxed"
                    />
                  ) : (
                    <input
                      type="text"
                      value={inputs[field.name] || ""}
                      onChange={(e) => setInputs({ ...inputs, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full bg-stone-50 border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-stone-200 transition-all outline-none text-sm"
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !inputs.text}
              className="w-full mt-10 bg-brand-primary text-white rounded-2xl py-5 font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/10"
            >
              {loading ? (
                <>
                  <Icons.Loader2 size={20} className="animate-spin" />
                  Procesando Redacción...
                </>
              ) : (
                <>
                  <Icons.Sparkles size={20} />
                  Generar Contenido
                </>
              )}
            </button>
          </div>

          <div className="bg-stone-900/5 rounded-2xl p-6 border border-stone-900/10">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-3">Reglas Editoriales Aplicadas</h3>
            <ul className="space-y-2">
              {task.rules.map((rule, i) => (
                <li key={i} className="text-xs text-stone-600 flex gap-2">
                  <span className="text-stone-400">•</span> {rule}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Output Section */}
        <section className="relative">
          <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-stone-900 italic">Resultado</h2>
              {result && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors"
                >
                  {copying ? (
                    <>
                      <Icons.Check size={14} className="text-green-500" />
                      Copiado Todo
                    </>
                  ) : (
                    <>
                      <Icons.Copy size={14} />
                      Copiar Todo
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-auto">
              {result ? (
                <div className="space-y-4">
                  {resultItems ? (
                    resultItems.map((item, index) => renderItem(item, index))
                  ) : (
                    <div className="markdown-body text-stone-800 leading-relaxed whitespace-pre-wrap">
                      <Markdown>{result}</Markdown>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-300 py-20">
                  <Icons.FileText size={48} strokeWidth={1} className="mb-4" />
                  <p className="font-serif italic text-lg">Esperando generación...</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex gap-3 items-center">
                <Icons.AlertCircle size={18} />
                {error}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
