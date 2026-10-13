import { Link } from 'react-router-dom'
import { Instagram, Facebook, Heart } from 'lucide-react'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-rose-950 text-rose-100 py-10 mt-20 border-t border-rose-900">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">

                {/* Marca */}
                <div className="space-y-3">
                    <h3 className="text-2xl font-serif font-bold text-white tracking-wide">
                        Mi Capricho <span className="text-rose-400 font-light italic">Secreto</span>
                    </h3>
                    <p className="text-sm text-rose-300">
                        Yogur artesanal, postres y repostería hechos con amor y tradición familiar.
                    </p>
                </div>

                {/* Enlaces Legales */}
                <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white">Legal y Soporte</h4>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link to="/privacidad" className="hover:text-white transition-colors duration-200">
                                Política de Privacidad
                            </Link>
                        </li>
                        <li>
                            <Link to="/terminos" className="hover:text-white transition-colors duration-200">
                                Términos del Servicio
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Contacto / Redes */}
                <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white">Síguenos</h4>
                    <div className="flex justify-center md:justify-start gap-4">
                        <a href="#" className="p-2 bg-rose-900 rounded-full hover:bg-rose-800 transition-colors">
                            <Instagram size={20} />
                        </a>
                        <a href="#" className="p-2 bg-rose-900 rounded-full hover:bg-rose-800 transition-colors">
                            <Facebook size={20} />
                        </a>
                    </div>
                </div>

            </div>

            <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-rose-900/50 flex flex-col md:flex-row items-center justify-between text-xs text-rose-400/80">
                <p>© {currentYear} Mi Capricho Secreto. Todos los derechos reservados.</p>
                <p className="flex items-center gap-1 mt-2 md:mt-0">
                    Hecho con <Heart size={12} className="text-rose-500 fill-rose-500" /> en Colombia
                </p>
            </div>
        </footer>
    )
}