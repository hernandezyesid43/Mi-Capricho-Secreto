import { MessageCircle } from 'lucide-react'

const PHONE = '573142748881' // sin + ni espacios
const DEFAULT_MESSAGE = 'Hola Mi Capricho Secreto ✨ Me gustaría obtener más información sobre sus productos.'

export default function WhatsAppButton() {
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escribir por WhatsApp"
            title="Escribir por WhatsApp"
            style={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 200,
                width: 58,
                height: 58,
                borderRadius: '50%',
                background: '#25D366',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(37, 211, 102, 0.45)',
                textDecoration: 'none',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08)'
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(37, 211, 102, 0.55)'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.45)'
            }}
        >
            <MessageCircle size={28} strokeWidth={2.2} />
        </a>
    )
}