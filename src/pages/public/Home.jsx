import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, PackageCheck, Sparkles, ShieldCheck, Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Componente de Partículas Interactivas
function ParticleBackground() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Crear partículas
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = ['rgba(252, 167, 181', 'rgba(212, 160, 168', 'rgba(183, 110, 121'][
          Math.floor(Math.random() * 3)
        ];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Limites del canvas
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;

        // Efecto de atracción al cursor
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200) {
          this.speedX += dx * 0.00005;
          this.speedY += dy * 0.00005;
          this.opacity = Math.min(this.opacity + 0.02, 0.8);
        } else {
          this.opacity = Math.max(this.opacity - 0.005, 0.2);
        }

        // Limitar velocidad
        const maxSpeed = 2;
        const speed = Math.sqrt(this.speedX ** 2 + this.speedY ** 2);
        if (speed > maxSpeed) {
          this.speedX = (this.speedX / speed) * maxSpeed;
          this.speedY = (this.speedY / speed) * maxSpeed;
        }
      }

      draw() {
        ctx.fillStyle = `${this.color}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = `${this.color}, ${this.opacity * 0.5})`;
      }
    }

    // Inicializar partículas
    for (let i = 0; i < 80; i++) {
      particlesRef.current.push(new Particle());
    }

    // Actualizar mouse position
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animar
    const animate = () => {
      ctx.fillStyle = 'rgba(74, 14, 46, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.shadowBlur = 0;

      particlesRef.current.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    // Manejar resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.16,
        delayChildren: 0.1,
      },
    },
  };

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
  };

  return (
    <motion.div
      className="page-transition"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      ref={containerRef}
    >
      {/* Fondo con Partículas */}
      <ParticleBackground />

      {/* Hero Section Principal */}
      <section className="hero-premium relative">
        {/* Glows ambientales de fondo */}
        <div className="hero-ambient-glow hero-glow-1" />
        <div className="hero-ambient-glow hero-glow-2" />
        <div className="hero-ambient-glow hero-glow-3" />

        {/* Efecto radial dinámico que sigue el cursor */}
        <motion.div
          className="hero-radial-light"
          animate={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
          }}
          transition={{
            type: 'spring',
            damping: 30,
            stiffness: 200,
          }}
        />

        <div className="hero-content relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <div className="hero-freshness glass-effect">
                <Sparkles size={16} className="hero-freshness-icon" />
                <span>Lo preparamos y envasamos exclusivamente bajo tu pedido</span>
              </div>
            </motion.div>

            <motion.h1 className="hero-title gradient-text-luxury" variants={itemVariants}>
              El placer de lo <em>auténtico</em>,<br />
              hecho a tu medida.
            </motion.h1>

            <motion.p className="hero-subtitle" variants={itemVariants}>
              Descubre creaciones artesanales exclusivas que despiertan tus sentidos.
              Calidad insuperable y frescura garantizada.
            </motion.p>

            <motion.div className="hero-actions" variants={itemVariants}>
              <Link to="/catalogo" className="hero-btn-primary glass-glow">
                <span>Ver Catálogo</span>
                <ArrowRight size={18} className="btn-arrow-icon" />
              </Link>
              <Link to="/seguimiento" className="hero-btn-secondary glass-effect">
                <PackageCheck size={18} />
                <span>Rastrear Pedido</span>
              </Link>
            </motion.div>

            <motion.div className="hero-features-list" variants={itemVariants}>
              <div className="hero-feature-item glass-effect-sm">
                <Sparkles size={16} className="hero-feature-icon" />
                <span>100% Artesanal & Fresco</span>
              </div>
              <div className="hero-feature-item glass-effect-sm">
                <ShieldCheck size={16} className="hero-feature-icon" />
                <span>Elaboración: 1 a 3 días</span>
              </div>
              <div className="hero-feature-item glass-effect-sm">
                <Clock size={16} className="hero-feature-icon" />
                <span>Entrega en Bogotá</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
