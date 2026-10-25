const TELEGRAM_BOT_TOKEN = '8965426151:AAG3nwgiCu6-EXvHDV3pSDg-m49UFtzfWcQ'
const TELEGRAM_CHAT_ID = '1375710224'

/**
 * Envía un mensaje de nuevo pedido a Telegram
 */
export async function sendOrderToTelegram({ pedidoId, total, items, user }) {
    const productLines = items
        .map((item) => {
            const nombre = item.nombre || item.product?.nombre || 'Producto'
            const cantidad = item.cantidad || 1
            const precio = item.precio_unitario || item.product?.precio || 0
            return `• ${nombre} x${cantidad} — $${Number(precio * cantidad).toLocaleString('es-CO')}`
        })
        .join('\n')

    const customerName = user?.user_metadata?.full_name || user?.email || 'Cliente'
    const customerEmail = user?.email || 'No registrado'

    const message = `
🛒 *NUEVO PEDIDO #${pedidoId}*

👤 *Cliente:* ${customerName}
📧 *Email:* ${customerEmail}

📦 *Productos:*
${productLines}

💰 *Total:* $${Number(total).toLocaleString('es-CO')} COP

⏰ ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}
  `.trim()

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
            }),
        })

        const data = await response.json()
        return { success: data.ok, data }
    } catch (error) {
        console.error('Error enviando a Telegram:', error)
        return { success: false, error: error.message }
    }
}