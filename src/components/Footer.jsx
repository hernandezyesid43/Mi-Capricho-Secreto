import { Link } from 'react-router-dom'
import { Instagram, Facebook, Heart, Shield, ClipboardList } from 'lucide-react'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    // Estilos fijos para evitar que los ignore el procesador
    const footerStyles = {
        position: 'relative',
        backgroundColor: '#1A0B12', // El color ciruela/vino ultra oscuro
        color: 'rgba(255, 228, 230, 0.8)', // Letras en oro rosa/rosa claro
        borderTop: '1px solid rgba(159, 18, 57, 0.4)', // Línea superior vino delicada
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
        paddingTop: '64px',
        paddingBottom: '40px',
        width: '100%'
    }

    const containerStyles = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        position: 'relative',
        zIndex: 10
    }

    const gridStyles = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '32px',
        paddingBottom: '48px',
        borderBottom: '1px solid rgba(136, 19, 55, 0.3)'
    }

    const titleStyles = {
        fontSize: '28px',
        fontFamily: 'serif',
        fontWeight: 'bold',
        color: '#ffffff',
        letterSpacing: '0.025em',
        marginBottom: '16px',
        textDecoration: 'none'
    }

    const textStyles = {
        fontSize: '14px',
        lineHeight: '1.6',
        color: 'rgba(255, 228, 230, 0.6)',
        maxWidth: '400px',
        margin: '0'
    }

    const headingStyles = {
        fontSize: '12px',
        fontWeight: '600',
        letterSpacing: '0.15em',
        color: '#f43f5e', // Oro rosa/rosa vibrante para el título
        textTransform: 'uppercase',
        marginBottom: '16px',
        marginTop: '0'
    }

    const listStyles = {
        listStyle: 'none',
        padding: '0',
        margin: '0',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    }

    const linkStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: 'rgba(255, 228, 230, 0.7)',
        textDecoration: 'none',
        fontSize: '14px',
        transition: 'color 0.2s ease'
    }

    const socialContainerStyles = {
        display: 'flex',
        gap: '16px',
        marginTop: '12px'
    }

    const iconButtonStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '42px',
        height: '42px',
        backgroundColor: 'rgba(76, 5, 25, 0.4)',
        border: '1px solid rgba(136, 19, 55, 0.25)',
        borderRadius: '50%',
        color: '#fda4af',
        transition: 'all 0.2s ease',
        textDecoration: 'none'
    }

    const bottomBarStyles = {
        marginTop: '40px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        fontSize: '12px',
        letterSpacing: '0.05em',
        color: 'rgba(251, 113, 133, 0.4)',
        textTransform: 'uppercase'
    }

    return (
        <footer style={footerStyles}>
            {/* Línea de brillo sutil en la parte superior */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '1200px',
                height: '1px',
                background: 'linear-gradient(to right, transparent, rgba(244, 63, 94, 0.2), transparent)'
            }} />

            <div style={containerStyles}>
                <div style={gridStyles}>

                    {/* Columna 1: Branding y Descripción */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Link to="/" style={titleStyles}>
                            Mi Capricho <span style={{ color: '#fca5a5', fontWeight: '300', fontStyle: 'italic' }}>Secreto</span>
                        </Link>
                        <p style={textStyles}>
                            Yogur artesanal, postres y repostería de alta gama elaborados con ingredientes de primera calidad, amor y tradición familiar.
                        </p>
                    </div>

                    {/* Columna 2: Enlaces Legales y Soporte */}
                    <div>
                        <h4 style={headingStyles}>LEGAL Y SOPORTE</h4>
                        <ul style={listStyles}>
                            <li>
                                <Link
                                    to="/privacidad"
                                    style={linkStyles}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 228, 230, 0.7)'}
                                >
                                    <Shield size={14} style={{ color: 'rgba(244, 63, 94, 0.6)' }} />
                                    <span>Política de Privacidad</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/terminos"
                                    style={linkStyles}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 228, 230, 0.7)'}
                                >
                                    <ClipboardList size={14} style={{ color: 'rgba(244, 63, 94, 0.6)' }} />
                                    <span>Términos del Servicio</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Columna 3: Redes Sociales */}
                    <div>
                        <h4 style={headingStyles}>SÍGUENOS</h4>
                        <p style={{ ...textStyles, fontSize: '13px', color: 'rgba(255, 228, 230, 0.5)' }}>
                            Descubre nuestras últimas creaciones y pedidos en redes sociales.
                        </p>
                        <div style={socialContainerStyles}>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noreferrer"
                                style={iconButtonStyles}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(136, 19, 55, 0.5)';
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(76, 5, 25, 0.4)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                                title="Instagram"
                            >
                                <Instagram size={18} />
                            </a>
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noreferrer"
                                style={iconButtonStyles}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(136, 19, 55, 0.5)';
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(76, 5, 25, 0.4)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                                title="Facebook"
                            >
                                <Facebook size={18} />
                            </a>
                        </div>
                    </div>

                </div>

                {/* Derechos de Autor */}
                <div style={bottomBarStyles}>
                    <p style={{ margin: 0 }}>
                        © {currentYear} Mi Capricho Secreto. Todos los derechos reservados.
                    </p>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0, textTransform: 'none' }}>
                        Hecho con <Heart size={10} style={{ color: '#f43f5e', fill: '#f43f5e' }} /> en Colombia
                    </p>
                </div>
            </div>
        </footer>
    )
}