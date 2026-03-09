import * as Icons from "lucide-react";

export default function Footer() {
  return (
    <footer className="max-w-7xl mx-auto px-8 py-12 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex flex-col items-center md:items-start gap-2">
        <p className="text-stone-400 text-xs italic font-serif">
          "El periodismo es el primer borrador de la historia."
        </p>
        <p className="text-[10px] uppercase tracking-widest font-bold text-stone-300">
          Desarrollado por <a href="https://www.instagram.com/willymorinigo22" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-stone-900 transition-colors">@willymorinigo22</a>
        </p>
      </div>
      <div className="flex gap-8">
        <a href="https://www.instagram.com/willymorinigo22" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-2">
          <Icons.Instagram size={14} />
          <span className="text-[10px] uppercase tracking-widest font-bold">Instagram</span>
        </a>
        <a href="#" className="text-stone-400 text-[10px] uppercase tracking-widest hover:text-stone-900">Soporte</a>
        <a href="#" className="text-stone-400 text-[10px] uppercase tracking-widest hover:text-stone-900">Privacidad</a>
      </div>
    </footer>
  );
}
