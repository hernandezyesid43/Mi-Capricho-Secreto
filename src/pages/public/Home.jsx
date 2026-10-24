import { useState, useEffect } from 'react'
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
import { supabase } from '../services/supabase' // Ajusta la ruta si es necesario
import AnimatedProductCard from '../components/ui/AnimatedProductCard' // Ajusta la ruta si es necesario

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    async function loadFeatured() {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true)
        .order('id')
        .limit(4)

      if (!error && data) {
        const fixed = data.map((p) => {
          let finalImageUrl = p.imagen_url
          if (finalImageUrl && !finalImageUrl.startsWith('http')) {
            const { data: publicUrlData } = supabase.storage
              .from('productos')
              .getPublicUrl(finalImageUrl)
            finalImageUrl = publicUrlData.publicUrl
          }
          return { ...p, imagen_url: finalImageUrl, image: finalImageUrl }
        })
        setFeaturedProducts(fixed)
      }
      setLoadingProducts(false)
    }
    loadFeatured()
  }, [])

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
      {/* ========== HERO ========== */}
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

      {/* ========== POR QUÉ ELEGIRNOS ========== */}
      <section className="py-20 px-4" style={{ background: '#FAF4F0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest uppercase text-[#C02E62] mb-3">
              Nuestra promesa
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1A0D16]">
              ¿Por qué Mi Capricho Secreto?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Leaf className="w-6 h-6" />,
                title: 'Ingredientes puros',
                desc: 'Solo usamos ingredientes de primera calidad, sin conservantes artificiales.',
              },
              {
                icon: <ChefHat className="w-6 h-6" />,
                title: 'Bajo pedido',
                desc: 'Cada yogur y postre se elabora exclusivamente cuando lo pides. Máxima frescura.',
              },
              {
                icon: <Heart className="w-6 h-6" />,
                title: 'Hecho con amor',
                desc: 'Recetas familiares y proceso artesanal en cada detalle.',
              },
              {
                icon: <Truck className="w-6 h-6" />,
                title: 'Entrega en Bogotá',
                desc: 'Llevamos tu pedido fresco hasta tu puerta en la ciudad.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#C02E62] flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-serif font-bold text-lg text-[#1A0D16] mb-2">{item.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PRODUCTOS DESTACADOS ========== */}
      <section className="py-20 px-4" style={{ background: '#1A0D16' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest uppercase text-[#E5A87B] mb-3">
              Selección especial
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
              Nuestros caprichos favoritos
            </h2>
            <p className="text-rose-200/80 text-sm max-w-md mx-auto">
              Una muestra de lo que preparamos con dedicación cada semana.
            </p>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/5 rounded-3xl h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, i) => (
                <AnimatedProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#D83A73] to-[#C02E62] text-white font-bold text-sm hover:shadow-lg hover:scale-105 transition-all"
            >
              Ver catálogo completo
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== CÓMO FUNCIONA ========== */}
      <section className="py-20 px-4" style={{ background: '#FAF4F0' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest uppercase text-[#C02E62] mb-3">
              Simple y transparente
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1A0D16]">
              ¿Cómo funciona?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Elige tus caprichos',
                desc: 'Explora el catálogo y añade a la cesta lo que más te apetezca.',
              },
              {
                step: '02',
                title: 'Confirmamos tu pedido',
                desc: 'Recibes confirmación y empezamos a prepararlo especialmente para ti.',
              },
              {
                step: '03',
                title: 'Elaboración artesanal',
                desc: 'En 1 a 3 días tu pedido está listo, fresco y envasado con cuidado.',
              },
              {
                step: '04',
                title: 'Entrega en Bogotá',
                desc: 'Te lo llevamos a casa. Puedes rastrear el estado en todo momento.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#D83A73] to-[#C02E62] text-white font-bold text-lg flex items-center justify-center shadow-md">
                  {item.step}
                </div>
                <h3 className="font-serif font-bold text-[#1A0D16] mb-2">{item.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA FINAL ========== */}
      <section className="py-20 px-4" style={{ background: '#1A0D16' }}>
        <div className="max-w-3xl mx-auto text-center">
          <Star className="w-10 h-10 text-[#E5A87B] mx-auto mb-6" />
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para tu próximo capricho?
          </h2>
          <p className="text-rose-200/80 mb-8 text-sm md:text-base">
            Cada pedido es una experiencia hecha a tu medida. Elige, pide y disfruta lo auténtico.
          </p>
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-[#D83A73] to-[#C02E62] text-white font-bold hover:shadow-xl hover:scale-105 transition-all"
          >
            Explorar el catálogo
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </motion.div>
  )
}