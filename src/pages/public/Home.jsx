import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, PackageCheck, Sparkles, ShieldCheck, Clock, HeartHandshake } from 'lucide-react'

export default function Home() {
  const [trackCode, setTrackCode] = useState('')
  const navigate = useNavigate()

  const handleTrackSubmit = (e) => {
    e.preventDefault()
    if (!trackCode.trim()) return
    navigate(`/seguimiento?order=${encodeURIComponent(trackCode.trim().toUpperCase())}`)
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
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="hero-freshness">
              <Sparkles size={16} /> Lo preparamos y envasamos exclusivamente bajo tu pedido
            </div>

            <h1 className="hero-title">
              El placer de lo <em>auténtico</em>, hecho a tu medida.
            </h1>

            <p className="hero-subtitle">
              Descubre nuestro catálogo exclusivo
            </p>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
