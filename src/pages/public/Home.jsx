import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, PackageCheck, Sparkles, ShieldCheck, Clock } from 'lucide-react'

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.16,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <motion.div
      className="page-transition"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Hero Section Principal */}
      <section className="hero">
        {/* Glows ambientales de fondo */}
        <div className="hero-ambient-glow hero-glow-1" />
        <div className="hero-ambient-glow hero-glow-2" />
        <div className="hero-ambient-glow hero-glow-3" />

        <div className="hero-content">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <div className="hero-freshness">
                <Sparkles size={16} className="hero-freshness-icon" />
                <span>Lo preparamos y envasamos exclusivamente bajo tu pedido</span>
              </div>
            </motion.div>

            <motion.h1 className="hero-title" variants={itemVariants}>
              El placer de lo <em>auténtico</em>,<br />
              hecho a tu medida.
            </motion.h1>

            <motion.p className="hero-subtitle" variants={itemVariants}>
              Descubre creaciones artesanales exclusivas que despiertan tus sentidos.
              Calidad insuperable y frescura garantizada.
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
    </motion.div>
  )
}

