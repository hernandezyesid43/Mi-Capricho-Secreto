import { motion } from 'framer-motion'
import { ClipboardList } from 'lucide-react'

export default function Terminos() {
    return (
        <motion.div
            className="max-w-4xl mx-auto p-8 mt-12 bg-white rounded-xl shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <ClipboardList className="text-rose-600" size={32} />
                <h1 className="text-3xl font-bold text-gray-800">Condiciones del Servicio</h1>
            </div>

            <div className="space-y-6 text-gray-600 leading-relaxed">
                <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-CO')}</p>

                <h2 className="text-xl font-semibold text-gray-800">1. Aceptación de los términos</h2>
                <p>Al acceder y utilizar el sitio web de Mi Capricho Secreto, usted acepta estar sujeto a estos términos de servicio y a todas las leyes y regulaciones aplicables.</p>

                <h2 className="text-xl font-semibold text-gray-800">2. Uso del servicio</h2>
                <p>Nuestra plataforma permite la visualización y pedido de yogures y postres artesanales. El usuario se compromete a proporcionar información verídica al momento de registrarse y realizar pedidos.</p>

                <h2 className="text-xl font-semibold text-gray-800">3. Precios y Pagos</h2>
                <p>Los precios de nuestros productos están sujetos a cambios sin previo aviso. Nos reservamos el derecho de modificar o discontinuar cualquier producto en cualquier momento.</p>

                <h2 className="text-xl font-semibold text-gray-800">4. Disponibilidad y Entregas</h2>
                <p>Los tiempos de entrega y disponibilidad de los productos artesanales dependen de la demanda y el stock diario. Nos comunicaremos con usted si surge algún inconveniente con su orden.</p>
            </div>
        </motion.div>
    )
}