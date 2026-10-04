import React from 'react';
import { Phone, MapPin, Clock, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { WHATSAPP_PHONE, getGeneralWhatsAppUrl } from '../../services/whatsappService';

interface FooterProps {
  onOpenAdmin: () => void;
  onSelectCategory: (cat: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onSelectCategory }) => {
  return (
    <footer className="bg-[#1A0D16] text-[#FAF4F0] pt-16 pb-12 border-t border-[#2F1528] relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#D83A73]/10 to-[#E5A87B]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#2F1528]">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4 text-left">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E5A87B]" />
              <span className="font-serif text-2xl font-bold tracking-tight text-white block">
                Mi Capricho Secreto
              </span>
            </div>
            <p className="text-xs text-stone-400 max-w-md leading-relaxed">
              Obrador artesanal en Bogotá especializado en yogur casero de fermentación prolongada, yogur griego extra denso filtrado en paño y repostería de temporada. Cada lote se elabora exclusivamente bajo pedido en lapsos de 1 a 3 días hábiles para garantizar la máxima frescura biológica.
            </p>
            <div className="flex flex-wrap items-center gap-5 text-xs text-stone-400 pt-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E5A87B]" />
                <span>Bogotá D.C., Colombia</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#E5A87B]" />
                <span>Elaboración: 1 a 3 días</span>
              </div>
            </div>
          </div>

          {/* Catalog shortcuts */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#E5A87B]">
              Menú de Selección
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('Yogur Griego');
                    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Yogur Griego de Autor
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('Yogur Casero');
                    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Yogur Casero Tradicional
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('Repostería de Temporada');
                    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Repostería de Temporada
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    document.getElementById('rastreo')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-[#E5A87B] font-semibold"
                >
                  Rastrear mi Pedido
                </button>
              </li>
              <li>
                <a
                  href={getGeneralWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-emerald-400"
                >
                  <Phone className="w-3 h-3" />
                  <span>Atención WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Secure Administrative Portal */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#E5A87B]">
              Gestión Interna
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Plataforma protegida con autenticación criptográfica SHA-256 para el equipo de cocina y administración.
            </p>
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 text-xs text-[#E5A87B] hover:text-white font-semibold transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#D83A73]" />
              <span>Portal de Cocina & Gestión</span>
            </button>
          </div>
        </div>

        {/* Quiet copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Mi Capricho Secreto. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5">
            <span>Elaborado con pasión en Bogotá</span>
            <Heart className="w-3.5 h-3.5 text-[#D83A73] fill-current" />
          </p>
        </div>
      </div>
    </footer>
  );
};
