/**
 * Construye la URL de WhatsApp codificada correctamente con emojis intactos.
 */
export const buildWhatsAppURL = (orderId, total, items) => {
  const phone = '573142748881'

  const itemLines = items
    .map((item) => `• ${item.nombre} x${item.cantidad} — $${(item.precio_unitario * item.cantidad).toLocaleString('es-CO')}`)
    .join('\n')

  const rawText = `Hola Mi Capricho Secreto ✨\n\nMi pedido es el #${orderId} 🍨\n\n${itemLines}\n\nTotal: $${Number(total).toLocaleString('es-CO')}\n\n¡Gracias! 💖`

  const encodedText = encodeURIComponent(rawText)
  return `https://wa.me/${phone}?text=${encodedText}`
}
