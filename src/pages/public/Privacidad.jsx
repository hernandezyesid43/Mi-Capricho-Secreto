import { motion } from 'framer-motion'
import { Shield, Lock, Eye, UserCheck } from 'lucide-react'

export default function Privacidad() {
    return (
        <div className="min-h-screen bg-rose-50/30 pt-28 pb-16 px-4">
            <motion.div
                className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Cabecera elegante */}
                <div className="bg-rose-950 px-8 py-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    <Shield className="text-rose-300 mx-auto mb-4" size={48} strokeWidth={1.5} />
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">Política de Privacidad</h1>
                    <p className="text-rose-200 text-sm">Última actualización: {new Date().toLocaleDateString('es-CO')}</p>
                </div>

                {/* Contenido Legal Expandido */}
                <div className="p-8 md:p-12 space-y-10 text-gray-700 leading-relaxed text-lg">
                    <p className="text-center text-gray-500 italic">
                        En <strong className="text-rose-900 font-serif">Mi Capricho Secreto</strong> valoramos profundamente su confianza. Esta política explica de forma clara y transparente cómo protegemos y manejamos su información.
                    </p>

                    <div className="flex gap-4 items-start">
                        <div className="bg-rose-100 p-3 rounded-xl text-rose-800 shrink-0 mt-1">
                            <Eye size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-semibold text-rose-950 mb-3">1. Información que recopilamos</h2>
                            <p>Al registrarse o iniciar sesión mediante Google, recopilamos únicamente la información pública estrictamente necesaria proporcionada por su cuenta de Google, la cual incluye su <strong>nombre completo</strong> y su <strong>dirección de correo electrónico</strong>. Adicionalmente, al realizar un pedido, podremos solicitar datos de entrega como su dirección física y número de contacto.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="bg-rose-100 p-3 rounded-xl text-rose-800 shrink-0 mt-1">
                            <UserCheck size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-semibold text-rose-950 mb-3">2. Uso de la información</h2>
                            <p>Sus datos personales se utilizan con el único propósito de brindarle un servicio de excelencia. Esto incluye: la creación y gestión de su perfil de cliente, el procesamiento de sus órdenes y compras, el despacho de productos a su domicilio, y la comunicación directa en caso de novedades, promociones u actualizaciones sobre su pedido.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="bg-rose-100 p-3 rounded-xl text-rose-800 shrink-0 mt-1">
                            <Lock size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-semibold text-rose-950 mb-3">3. Protección y Confidencialidad</h2>
                            <p>Su privacidad es nuestra prioridad. <strong>Mi Capricho Secreto</strong> garantiza que bajo ninguna circunstancia vende, alquila, comercia ni transfiere su información personal a terceros. Nuestra plataforma utiliza protocolos de seguridad y bases de datos encriptadas provistas por servicios líderes en la industria para prevenir accesos no autorizados.</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-rose-100 text-center">
                        <h2 className="text-xl font-serif font-semibold text-rose-950 mb-4">4. Derechos del Usuario y Contacto</h2>
                        <p className="text-base text-gray-600 mb-6">Usted tiene derecho a conocer, actualizar, rectificar o solicitar la eliminación de sus datos personales de nuestro sistema en cualquier momento.</p>
                        <p className="bg-rose-50 inline-block px-6 py-3 rounded-lg text-rose-900 border border-rose-100 font-medium">
                            Si tiene inquietudes, contáctenos al correo: hernandezyesid43@gmail.com
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}