import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  PackageCheck,
  Sparkles,
  ShieldCheck,
  Clock,
  Leaf,
  Heart,
  ChefHat,
  Truck,
  Star
} from 'lucide-react'

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.14, delayChildren: 0.08 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <motion.div
      className="page-transition"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* HERO */}
      <section className="hero">
        <div className="hero-ambient-glow hero-glow-1" />
        <div className="hero-ambient-glow hero-glow-2" />
        <div className="hero-ambient-glow hero-glow-3" />

        <div className="hero-content">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <div className="hero-freshness">
                <Sparkles size={16} className="hero-freshness-icon" />
                <span>Lo preparamos y envasamos exclusivamente bajo tu pedido</span>
              </div>
            </motion.div>

            <motion.h1 className="hero-title" variants={itemVariants}>
              El placer de lo <em>auténtico</em>,
              <br />
              hecho a tu medida.
            </motion.h1>

            <motion.p className="hero-subtitle" variants={itemVariants}>
              Yogures artesanales y postres de alta gama elaborados con ingredientes de primera,
              amor y tradición familiar. Frescura garantizada en cada cucharada.
            </motion.p>

            <motion.div className="hero-actions" variants={itemVariants}>
              <Link to="/catalogo" className="hero-btn-primary">
                <span>Ver Catálogo</span>
                <ArrowRight size={18} className="btn-arrow-icon" />
              </Link>
              <Link to="/seguimiento" className="hero-btn-secondary">
                <PackageCheck size={18} />
                <span>Rastrear Pedido</span>
              </Link>
            </motion.div>

            <motion.div className="hero-features-list" variants={itemVariants}>
              <div className="hero-feature-item">
                <Sparkles size={16} className="hero-feature-icon" />
                <span>100% Artesanal & Fresco</span>
              </div>
              <div className="hero-feature-item">
                <ShieldCheck size={16} className="hero-feature-icon" />
                <span>Elaboración: 1 a 3 días</span>
              </div>
              <div className="hero-feature-item">
                <Clock size={16} className="hero-feature-icon" />
                <span>Entrega en Bogotá</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* POR QUÉ ELEGIRNOS */}
      <section style={{ background: '#FAF4F0', padding: '80px 16px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C02E62', marginBottom: 12 }}>
              Nuestra promesa
            </p>
            <h2 style={{ fontFamily: 'serif', fontSize: '2rem', fontWeight: 700, color: '#1A0D16' }}>
              ¿Por qué Mi Capricho Secreto?
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {[
              { icon: '🌿', title: 'Ingredientes puros', desc: 'Solo usamos ingredientes de primera calidad, sin conservantes artificiales.' },
              { icon: '👨‍🍳', title: 'Bajo pedido', desc: 'Cada yogur y postre se elabora exclusivamente cuando lo pides. Máxima frescura.' },
              { icon: '❤️', title: 'Hecho con amor', desc: 'Recetas familiares y proceso artesanal en cada detalle.' },
              { icon: '🚚', title: 'Entrega en Bogotá', desc: 'Llevamos tu pedido fresco hasta tu puerta en la ciudad.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #fce7f3' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ fontFamily: 'serif', fontWeight: 700, fontSize: 18, color: '#1A0D16', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: '#57534e', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section style={{ background: '#FAF4F0', padding: '40px 16px 80px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C02E62', marginBottom: 12 }}>
              Simple y transparente
            </p>
            <h2 style={{ fontFamily: 'serif', fontSize: '2rem', fontWeight: 700, color: '#1A0D16' }}>
              ¿Cómo funciona?
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32 }}>
            {[
              { step: '01', title: 'Elige tus caprichos', desc: 'Explora el catálogo y añade a la cesta lo que más te apetezca.' },
              { step: '02', title: 'Confirmamos tu pedido', desc: 'Recibes confirmación y empezamos a prepararlo especialmente para ti.' },
              { step: '03', title: 'Elaboración artesanal', desc: 'En 1 a 3 días tu pedido está listo, fresco y envasado con cuidado.' },
              { step: '04', title: 'Entrega en Bogotá', desc: 'Te lo llevamos a casa. Puedes rastrear el estado en todo momento.' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, margin: '0 auto 16px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D83A73, #C02E62)',
                  color: 'white', fontWeight: 700, fontSize: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontFamily: 'serif', fontWeight: 700, color: '#1A0D16', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: '#57534e', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: '#1A0D16', padding: '80px 16px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 32, marginBottom: 24 }}>⭐</div>
          <h2 style={{ fontFamily: 'serif', fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: 16 }}>
            ¿Listo para tu próximo capricho?
          </h2>
          <p style={{ color: '#fecdd3', marginBottom: 32, fontSize: 15 }}>
            Cada pedido es una experiencia hecha a tu medida. Elige, pide y disfruta lo auténtico.
          </p>
          <Link
            to="/catalogo"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 36px', borderRadius: 9999,
              background: 'linear-gradient(to right, #D83A73, #C02E62)',
              color: 'white', fontWeight: 700, textDecoration: 'none'
            }}
          >
            Explorar el catálogo
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </motion.div>
  )
}