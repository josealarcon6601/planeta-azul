import { Link } from 'react-router-dom'
import { MessageCircle, Waves, Bot, CheckCircle, ChevronRight, Euro, Globe, Anchor } from 'lucide-react'

function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="bg-blue-900 rounded-lg px-3 py-2 flex items-center flex-shrink-0">
        <img src="/logo.svg" alt="Planeta Azul" className="h-4 sm:h-5 w-auto" />
      </div>
      <span className="hidden sm:block text-[11px] font-semibold tracking-wide text-gray-400 uppercase border-l border-gray-200 pl-3">Buceo y Naturaleza<br/>Cabo de Palos</span>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Logo />
          <Link to="/dashboard" className="flex items-center gap-1.5 bg-blue-900 text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors">
            Dashboard <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img src="/hero.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/90 via-blue-900/75 to-blue-900/50" />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-6 pt-28 sm:pt-36 pb-14 sm:pb-24 grid lg:grid-cols-2 gap-10 sm:gap-16 items-center">
          {/* Chat demo */}
          <div className="relative order-2 lg:order-1 px-2 sm:px-0">
            <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-6 border border-gray-100 max-w-sm mx-auto">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">🤿</div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Planeta Azul</p>
                  <p className="text-xs text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" />En línea</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 max-w-[80%] text-sm text-gray-700">Hi! How much is a baptism dive?</div>
                <div className="bg-blue-900 rounded-2xl rounded-tr-sm p-3 max-w-[80%] ml-auto text-sm text-white text-right">Hi, I'm Coral 🐠 The baptism dive is 90€, no experience needed — instructor and gear included!</div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 max-w-[80%] text-sm text-gray-700">¡Genial! ¿Hay sitio el sábado por la mañana?</div>
                <div className="bg-blue-900 rounded-2xl rounded-tr-sm p-3 max-w-[80%] ml-auto text-sm text-white text-right">¡Sí! Quedan plazas en la salida de las 08:30 🤿</div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 max-w-[80%] text-sm text-gray-700">Parfait, réservez pour moi et ma copine, merci !</div>
                <div className="bg-blue-900 rounded-2xl rounded-tr-sm p-3 max-w-[80%] ml-auto text-sm text-white text-right">✅ C'est noté ! Deux places réservées samedi 08h30. À bientôt sur le bateau 🌊</div>
              </div>
            </div>
            <div className="absolute -top-2 -right-1 sm:-top-3 sm:-right-3 bg-gold-500 text-blue-950 text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl shadow-lg">✓ Confirmée</div>
            <div className="absolute -bottom-2 -left-1 sm:-bottom-3 sm:-left-3 bg-white border border-gray-100 text-xs sm:text-sm shadow-lg px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl">🌍 EN · ES · FR y más</div>
          </div>

          {/* Texto */}
          <div className="order-1 lg:order-2 text-white text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur text-white text-sm font-medium px-3 py-1 rounded-full mb-6 border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Disponible 24/7 por WhatsApp
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
              Tu Centro de Buceo,{' '}
              <span className="text-gold-400">Siempre Disponible</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-50/90 leading-relaxed mb-4">
              Coral, nuestra asistente con IA, atiende a tus buceadores por WhatsApp en varios idiomas, las 24 horas.
              Informa precios y disponibilidad al instante, y reserva bautismos, inmersiones y cursos automáticamente.
            </p>
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-gold-300/90 uppercase mb-8">Cabo de Palos · Centro National Geographic · Reserva Marina Islas Hormigas</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/dashboard" className="flex items-center justify-center gap-2 w-full sm:w-auto bg-white text-blue-900 px-6 py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg font-semibold hover:bg-blue-50 transition-all shadow-lg">
                Ir al Dashboard <ChevronRight className="w-5 h-5" />
              </Link>
              <a href="#como-funciona" className="flex items-center justify-center gap-2 w-full sm:w-auto border-2 border-white/40 text-white px-6 py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg font-semibold hover:border-white hover:bg-white/10 transition-colors">
                Cómo funciona
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </section>

      {/* Features */}
      <section className="py-14 sm:py-20 px-5 sm:px-6 bg-gradient-to-b from-blue-50/60 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Todo lo que necesitas, automatizado</h2>
            <p className="text-base sm:text-xl text-gray-500">Coral atiende a tus clientes para que tú te centres en el mar</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
            {[
              { icon: <Euro className="w-7 h-7 text-blue-700" />, bg: 'bg-blue-50', t: 'Precios Siempre al Día', d: 'Actualiza bautismos, inmersiones, bonos y cursos desde el dashboard y Coral responderá siempre con el precio correcto, sin inventarse cifras.' },
              { icon: <Waves className="w-7 h-7 text-gold-600" />, bg: 'bg-gold-50', t: 'Reservas Automáticas', d: 'Agenda, cancela o reprograma bautismos, inmersiones guiadas y cursos directamente desde WhatsApp, respetando la capacidad real del barco.' },
              { icon: <Globe className="w-7 h-7 text-purple-600" />, bg: 'bg-purple-50', t: 'Multi-idioma', d: 'Detecta el idioma del cliente y responde en español, inglés, francés o el que corresponda, sin mezclar idiomas en una misma respuesta.' }
            ].map((c, i) => (
              <div key={i} className={`${c.bg} rounded-3xl p-6 sm:p-8 hover:scale-105 transition-transform duration-300`}>
                <div className="mb-4">{c.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{c.t}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-14 sm:py-20 px-5 sm:px-6 bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Cómo funciona</h2>
            <p className="text-base sm:text-xl text-gray-500">3 pasos y el buceador tiene su plaza reservada</p>
          </div>
          <div className="space-y-6 sm:space-y-8">
            {[
              { n: '01', icon: <MessageCircle className="w-5 h-5 text-blue-700" />, t: 'El cliente escribe al WhatsApp del centro', d: 'Cualquier consulta de precios, puntos de inmersión o reserva — por el mismo número de WhatsApp que ya conocen.' },
              { n: '02', icon: <Bot className="w-5 h-5 text-purple-600" />, t: 'Coral (la IA) lo atiende al instante, en su idioma', d: 'En segundos responde con las tarifas vigentes, consulta plazas libres en el barco y guía al buceador.' },
              { n: '03', icon: <CheckCircle className="w-5 h-5 text-green-600" />, t: 'La reserva queda confirmada automáticamente', d: 'Se guarda en el sistema y aparece en el dashboard. Si algo se sale de lo que Coral sabe responder, pasa el contacto directo del equipo.' }
            ].map((s, i) => (
              <div key={i} className="flex gap-4 sm:gap-5 items-start">
                <div className="w-11 h-11 sm:w-14 sm:h-14 flex-shrink-0 bg-blue-900 text-white rounded-2xl flex items-center justify-center font-bold text-base sm:text-lg">{s.n}</div>
                <div className="pt-1">
                  <div className="flex items-center gap-2 mb-1"><span className="hidden sm:inline">{s.icon}</span><h3 className="text-base sm:text-lg font-bold text-gray-900">{s.t}</h3></div>
                  <p className="text-sm sm:text-base text-gray-500 leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 sm:mt-14 text-center">
            <Link to="/dashboard" className="inline-flex items-center gap-2 bg-blue-900 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg font-semibold hover:bg-blue-800 transition-all shadow-lg shadow-blue-200">
              Acceder al Dashboard <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-950 text-gray-400 py-10 sm:py-12 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-white font-semibold mb-2"><Anchor className="w-5 h-5 text-gold-400" /> Planeta Azul</div>
            <p className="text-sm">Paseo Dimas Ortega, 24 — Cabo de Palos, Murcia</p>
            <p className="text-sm">+34 968 56 45 32 · planeta@planeta-azul.com</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <p className="text-sm">Powered by Claude + Twilio WhatsApp</p>
            <Link to="/dashboard" className="text-gold-300 hover:text-gold-200 text-sm transition-colors">Dashboard →</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
