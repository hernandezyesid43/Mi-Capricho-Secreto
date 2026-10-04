import { Order } from '../types';

export const WHATSAPP_PHONE = '573142748881';

/**
 * Genera la URL de WhatsApp garantizando la preservación de emojis en UTF-8.
 * Utiliza api.whatsapp.com directamente para evitar la pérdida de caracteres en
 * la redirección HTTP 302 de wa.me, y remueve selectores de variación que generan signos '?'.
 */
export function buildWhatsAppUrl(phone: string, text: string): string {
  // Elimina selectores de variación que causan signos de interrogación '?' en WhatsApp
  const cleanText = text.replace(/[\uFE00-\uFE0F]/g, '');
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(cleanText)}`;
}

/**
 * Mensaje breve, emotivo y cercano para consultas generales o de recetas.
 * Utiliza emojis con soporte universal que no se corrompen en ningún dispositivo.
 */
export function getGeneralWhatsAppMessage(productName?: string): string {
  if (productName) {
    return `¡Hola! 🍓✨ Vi en su página el *${productName}* y me antojé muchísimo 😋

¿Tienen disponible para estos días en Bogotá? Sé que preparan todo fresquito bajo pedido (1 a 3 días) ✨

¡Quedo súper atento para coordinar el mío! 🙌❤️`;
  }

  return `¡Hola! 👋✨ Estuve viendo su tienda y todo se ve delicioso 🍓🍯

¿Me podrían contar qué delicias tienen para entrega en Bogotá? Sé que elaboran todo artesanal bajo pedido (1 a 3 días) 😋

¡Muchas gracias! ❤️✨`;
}

export function getGeneralWhatsAppUrl(productName?: string): string {
  const message = getGeneralWhatsAppMessage(productName);
  return buildWhatsAppUrl(WHATSAPP_PHONE, message);
}

/**
 * Mensaje ágil, emotivo, alegre y conciso para formalizar un pedido por WhatsApp.
 */
export function formatWhatsAppMessage(order: Order): string {
  const itemsList = order.items
    .map(
      (item) =>
        `• ${item.cantidad}x *${item.nombre}* ($${item.subtotal.toLocaleString('es-CO')})`
    )
    .join('\n');

  const notasLine = order.notas_entrega
    ? `📝 *Nota:* "${order.notas_entrega.trim()}"\n`
    : '';

  return `¡Hola! 👋🍓 Acabo de armar mi pedido en la web y me antojé de todo 😋✨

📦 *Pedido #${order.codigo_orden}*
👤 *Para:* ${order.cliente_nombre}
📍 *Entrega:* ${order.direccion_envio} (${order.barrio_localidad})
${notasLine}🍯 *Mis antojitos:*
${itemsList}

💰 *Total:* *$${order.total.toLocaleString('es-CO')} COP* (${order.metodo_pago})
⏰ *Preparación:* 1 a 3 días fresquito con mucho amor ❤️✨

¿Me confirman para coordinar el pago y la entrega? ¡Mil gracias! 🙌`;
}

export function openWhatsAppCheckout(order: Order): void {
  const message = formatWhatsAppMessage(order);
  const url = buildWhatsAppUrl(WHATSAPP_PHONE, message);
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function openGeneralWhatsApp(productName?: string): void {
  const url = getGeneralWhatsAppUrl(productName);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Mensaje para consultar el estado actual de un pedido directamente por WhatsApp.
 */
export function getOrderTrackingWhatsAppUrl(order: Order): string {
  const message = `¡Hola! 👋🍓 Quería consultar cómo va mi pedido *#${order.codigo_orden}* a nombre de *${order.cliente_nombre}* (Estado actual en web: *${order.estado}*). ¡Muchas gracias! ✨`;
  return buildWhatsAppUrl(WHATSAPP_PHONE, message);
}

