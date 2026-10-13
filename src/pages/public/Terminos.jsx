import { motion } from 'framer-motion'
import { ClipboardList, ShoppingBag, Truck, AlertCircle } from 'lucide-react'

export default function Terminos() {
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
                    <ClipboardList className="text-rose-300 mx-auto mb-4" size={48} strokeWidth={1.5} />
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">Términos del Servicio</h1>
                    <p className="text-rose-200 text-sm">Última actualización: {new Date().toLocaleDateString('es-CO')}</p>
                </div>

                {/* Contenido Legal Expandido */}
                <div className="p-8 md:p-12 space-y-10 text-gray-700 leading-relaxed text-lg">
                    <p className="text-center text-gray-500 italic mb-8">
                        Bienvenido a <strong className="text-rose-900 font-serif">Mi Capricho Secreto</strong>. Al utilizar nuestra plataforma, usted acepta estar legalmente vinculado a las siguientes condiciones y términos comerciales.
                    </p>

                    <div className="flex gap-4 items-start">
                        <div className="bg-rose-100 p-3 rounded-xl text-rose-800 shrink-0 mt-1">
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-semibold text-rose-950 mb-3">1. Uso del Sitio y Aceptación</h2>
                            <p>Nuestra plataforma virtual ha sido diseñada para la visualización, compra y gestión de pedidos de productos de repostería y lácteos artesanales. Al acceder, navegar y registrarse mediante nuestro sistema de autenticación de Google, el usuario asume la responsabilidad de proveer datos verídicos y mantener la confidencialidad de su cuenta.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="bg-rose-100 p-3 rounded-xl text-rose-800 shrink-0 mt-1">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-semibold text-rose-950 mb-3">2. Productos y Precios</h2>
                            <p>Todos nuestros productos, incluyendo yogures y postres, son elaborados de forma artesanal, por lo que su presentación final puede variar ligeramente respecto a las imágenes ilustrativas. Todos los precios publicados están expresados en Pesos Colombianos (COP) e incluyen impuestos locales. <strong>Mi Capricho Secreto</strong> se reserva el derecho de modificar sus tarifas sin previo aviso, garantizando el precio acordado en los pedidos que ya se encuentren facturados.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="bg-rose-100 p-3 rounded-xl text-rose-800 shrink-0 mt-1">
                            <Truck size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-semibold text-rose-950 mb-3">3. Entregas y Tiempos de Envío</h2>
                            <p>Debido a la naturaleza fresca y perecedera de nuestros productos, las entregas están sujetas a la disponibilidad diaria de inventario y a rutas específicas. El tiempo estimado de entrega comenzará a contar a partir de la confirmación formal del pedido en la sección de estado. Nos comprometemos a mantener la cadena de frío y cuidado durante todo el transporte hasta su destino.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="bg-rose-100 p-3 rounded-xl text-rose-800 shrink-0 mt-1">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-semibold text-rose-950 mb-3">4. Política de Cambios y Devoluciones</h2>
                            <p>Siendo alimentos perecederos, únicamente se aceptarán reclamaciones o devoluciones al momento exacto de la recepción del pedido en caso de daños evidentes en el empaque o producto equivocado. Una vez recibido a conformidad por el cliente, no se aceptarán devoluciones por motivos de bioseguridad alimentaria.</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}