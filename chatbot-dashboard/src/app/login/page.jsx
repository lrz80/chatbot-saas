'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import { setCookie } from 'cookies-next';
import Cookies from 'js-cookie';
import {
  FaRobot,
  FaChartBar,
  FaWhatsapp,
  FaFacebookMessenger,
  FaInstagram,
  FaMicrophoneAlt,
  FaBullhorn,
} from 'react-icons/fa';

// Array de nodos con posición en Tailwind y coordenadas (x, y) para las líneas
const nodos = [
  {
    icon: <FaRobot size={36} style={{ color: '#a855f7' }} />,
    title: 'Atención 24/7',
    desc: 'Siempre online para tu negocio.',
    posClass: 'top-[5%] left-[10%]',
    x: 10,
    y: 5,
  },
  {
    icon: <FaChartBar size={36} style={{ color: '#6366f1' }} />,
    title: 'Estadísticas',
    desc: 'Panel con rendimiento en tiempo real.',
    posClass: 'top-[5%] right-[10%]',
    x: 90,
    y: 5,
  },
  {
    icon: <FaWhatsapp size={36} style={{ color: '#25D366' }} />,
    title: 'WhatsApp',
    desc: 'Responde mensajes automáticamente.',
    posClass: 'top-[50%] left-[2%]',
    x: 2,
    y: 50,
  },
  {
    icon: <FaFacebookMessenger size={36} style={{ color: '#0084FF' }} />,
    title: 'Facebook',
    desc: 'Chatbot conectado a tu fanpage.',
    posClass: 'top-[50%] right-[2%]',
    x: 98,
    y: 50,
  },
  {
    icon: <FaInstagram size={36} style={{ color: '#E1306C' }} />,
    title: 'Instagram DM',
    desc: 'Atiende tus DMs con IA.',
    posClass: 'bottom-[20%] left-[15%]',
    x: 15,
    y: 80,
  },
  {
    icon: <FaMicrophoneAlt size={36} style={{ color: '#6366f1' }} />,
    title: 'Voz AI',
    desc: 'Responde llamadas como un humano.',
    posClass: 'bottom-[20%] right-[15%]',
    x: 85,
    y: 80,
  },
  {
    icon: <FaBullhorn size={36} style={{ color: '#facc15' }} />,
    title: 'Campañas',
    desc: 'Marketing automatizado y efectivo.',
    posClass: 'bottom-[5%] left-[40%]',
    x: 40,
    y: 95,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const token = await user.getIdToken();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        // Guardar uid o cualquier dato si querés
        Cookies.set("firebaseUid", user.uid);
        setCookie("user", user.uid, { maxAge: 60 * 60 * 24 });

        router.push("/dashboard");
      } else {
        setError("No se pudo validar el token.");
      }

    } catch (err) {
      setError('Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black text-white px-4 overflow-hidden">
      {/* Fondo radial */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-900/30 to-black z-0" />

      {/* SVG para dibujar líneas desde el centro (login card) hacia cada nodo */}
      <svg
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {nodos.map((nodo, index) => (
          <line
            key={index}
            x1="50%"
            y1="50%"
            x2={`${nodo.x}%`}
            y2={`${nodo.y}%`}
            stroke="white"
            strokeOpacity="0.15"
            strokeWidth="2"
          />
        ))}
      </svg>

      {/* Nodos informativos */}
      <div className="absolute inset-0 z-10">
        {nodos.map((nodo, index) => (
          <div
            key={index}
            className={`absolute ${nodo.posClass} bg-white/5 border border-white/10 p-4 rounded-xl w-60 backdrop-blur-md shadow-lg hover:scale-105 transition-transform`}
          >
            <div className="flex items-center gap-3 mb-2">
              {nodo.icon}
              <span className="text-white text-base font-semibold">{nodo.title}</span>
            </div>
            <p className="text-sm text-white/60">{nodo.desc}</p>
          </div>
        ))}
      </div>

      {/* Login Card */}
      <div className="relative z-20 w-full max-w-md bg-white/10 border border-white/20 backdrop-blur-md text-white rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-purple-300 drop-shadow">
          Iniciar sesión
        </h1>

        {error && (
          <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-white/80">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-white/80">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-white font-semibold shadow-lg"
          >
            Ingresar
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-white/60">
          ¿Aún no tienes cuenta?{' '}
          <a
            href="/register"
            className="text-purple-400 underline hover:text-purple-300 transition"
          >
            Registrate
          </a>
        </p>
      </div>
    </div>
  );
}
