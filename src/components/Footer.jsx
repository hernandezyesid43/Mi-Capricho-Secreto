import { Link } from 'react-router-dom'
import { Instagram, Facebook, Heart, Shield, ClipboardList } from 'lucide-react'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="relative bg-[#1A0B12] text-rose-100/80 border-t border-rose-900/40 overflow-hidden font-sans">
            {/* Sutil brillo ambiental de fondo */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-80 bg-rose-900/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 pt-16 pb-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 pb-12 border-b border-rose-950/60">

                    {/* Columna 1: Branding y Descripción */}
                    <div className="space-y-4">
                        <Link to="/" className="inline-block group">
                            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-wide transition-colors duration-200 group-hover:text-rose-200">
                                Mi Capricho <span className="text-rose-300 font-light italic">Secreto</span>
                            </h3>
                        </Link>
                        <p className="text-sm md:text-base text-rose-200/60 font-light leading-relaxed max-w-md">
                            Yogur artesanal, postres y repostería de alta gama elaborados con ingredientes de primera calidad, amor y tradición familiar.
                        </p>
                    </div>

                    {/* Columna 2: Enlaces Legales y Soporte */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold tracking-widest text-rose-300 uppercase">
                            LEGAL Y SOPORTE
                        </h4>
                        <ul className="space-y-3 text-sm md:text-base">
                            <li>
                                <Link
                                    to="/privacidad"
                                    className="inline-flex items-center gap-2 text-rose-200/70 hover:text-white transition-all duration-250 transform hover:translate-x-1"
                                >
                                    <Shield size={14} className="text-rose-400/60" />
                                    <span>Política de Privacidad</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/terminos"
                                    className="inline-flex items-center gap-2 text-rose-200/70 hover:text-white transition-all duration-250 transform hover:translate-x-1"
                                >
                                    <ClipboardList size={14} className="text-rose-400/60" />
                                    <span>Términos del Servicio</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Columna 3: Redes Sociales e Interacción */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold tracking-widest text-rose-300 uppercase">
                            SÍGUENOS
                        </h4>
                        <p className="text-sm text-rose-200/50 font-light">
                            Descubre nuestras últimas creaciones y pedidos en redes.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noreferrer"
                                className="p-3 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/25 rounded-full text-rose-300 hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-rose-950/50 transition-all duration-200"
                                title="Instagram"
                            >
                                <Instagram size={18} />
                            </a>
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noreferrer"
                                className="p-3 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/25 rounded-full text-rose-300 hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-rose-950/50 transition-all duration-200"
                                title="Facebook"
                            >
                                <Facebook size={18} />
                            </a>
                        </div>
                    </div>

                </div>

                {/* Derechos de Autor y Sello de Calidad */}
                <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs tracking-wider text-rose-400/40 uppercase">
                    <p className="text-center md:text-left">
                        © {currentYear} Mi Capricho Secreto. Todos los derechos reservados.
                    </p>
                    <p className="flex items-center gap-1.5 font-light normal-case">
                        Hecho con <Heart size={10} className="text-rose-500 fill-rose-500 animate-pulse" /> en Colombia
                    </p>
                </div>
            </div>
        </footer>
    )
}