import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

export default function Privacidad() {
  return (
    <motion.div 
      className="max-w-4xl mx-auto p-8 mt-12 bg-white rounded-xl shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <Shield className="text-rose-600" size={32} />
        <h1 className="text-3xl font-bold text-gray-800">Política de Privacidad</h1>
      </div>
      
      <div className="space-y-6 text-gray-600 leading-relaxed">
        <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-CO')}</p>
        
        <h2 className="text-xl font-semibold text-gray-800">1. Información que recopilamos</h2>
        <p>Al iniciar sesión en Mi Capricho Secreto a través de Google, recopilamos únicamente la información pública estrictamente necesaria para crear su cuenta: su nombre y dirección de correo electrónico.</p>
        
        <h2 className="text-xl font-semibold text-gray-800">2. Uso de la información</h2>
        <p>Utilizamos sus datos exclusivamente para: gestionar sus pedidos, identificarle como cliente en nuestro sistema, y comunicarnos con usted en caso de novedades con sus compras.</p>
        
        <h2 className="text-xl font-semibold text-gray-800">3. Protección de sus datos</h2>
        <p>Mi Capricho Secreto no vende, alquila ni comparte su información personal con terceros. Sus datos están protegidos y se utilizan únicamente para el funcionamiento de esta tienda virtual.</p>

        <h2 className="text-xl font-semibold text-gray-800">4. Contacto</h2>
        <p>Si desea eliminar su cuenta o tiene dudas sobre el manejo de sus datos, puede contactarnos a través de nuestros canales oficiales de atención.</p>
      </div>
    </motion.div>
  )
}