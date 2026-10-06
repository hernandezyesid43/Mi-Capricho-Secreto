import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Asegúrate de que la ruta a tu cliente de supabase sea correcta
// import { supabase } from '../../utils/supabaseClient'; 

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Aquí simulamos o conectamos con Supabase
      // Si usas Supabase Auth real:
      /*
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      */

      // Simulación temporal funcional para avanzar rápido sin errores de conexión:
      setTimeout(() => {
        if (email.includes('admin')) {
          alert('Bienvenido Administrador');
          navigate('/mcs-management');
        } else {
          alert('Inicio de sesión exitoso');
          navigate('/catalogo');
        }
        setLoading(false);
      }, 1000);

    } catch (error) {
      setMessage(error.message || 'Ocurrió un error en la autenticación');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ padding: '80px 20px', maxWidth: '400px', margin: '0 auto', color: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
      </h2>

      {message && <div style={{ background: '#ff4d4d', padding: '10px', marginBottom: '15px', borderRadius: '5px' }}>{message}</div>}

      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Correo Electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', background: '#222', color: '#fff' }}
            placeholder="tu@correo.com"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', background: '#222', color: '#fff' }}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '12px', background: '#a8325a', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Registrarse')}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', cursor: 'pointer', color: '#d48fa4' }} onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
      </p>
    </div>
  );
}