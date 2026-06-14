// src/components/auth/VerificacionOTP.jsx
import { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';

const LONGITUD = 6;
const REENVIO_ESPERA = 60; // segundos

export function VerificacionOTP({ empresaId, email, onExito }) {
  const [digitos, setDigitos]     = useState(Array(LONGITUD).fill(''));
  const [cargando, setCargando]   = useState(false);
  const [error, setError]         = useState('');
  const [enviando, setEnviando]   = useState(false);
  const [segundos, setSegundos]   = useState(REENVIO_ESPERA);
  const [exitoso, setExitoso]     = useState(false);
  const refs = useRef([]);

  // Cuenta regresiva para reenvío
  useEffect(() => {
    if (segundos <= 0) return;
    const t = setTimeout(() => setSegundos((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [segundos]);

  // Auto-foco en el primer input al montar
  useEffect(() => { refs.current[0]?.focus(); }, []);

  const handleChange = (i, valor) => {
    // Solo acepta dígitos
    if (!/^\d?$/.test(valor)) return;
    const nuevo = [...digitos];
    nuevo[i] = valor;
    setDigitos(nuevo);
    setError('');
    // Avanza al siguiente input automáticamente
    if (valor && i < LONGITUD - 1) refs.current[i + 1]?.focus();
    // Si se completaron los 6 dígitos, envía automáticamente
    if (nuevo.every((d) => d !== '') && valor) {
      verificar(nuevo.join(''));
    }
  };

  const handleKeyDown = (i, e) => {
    // Retrocede al input anterior al borrar
    if (e.key === 'Backspace' && !digitos[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pegado = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LONGITUD);
    if (!pegado) return;
    const nuevo = Array(LONGITUD).fill('');
    pegado.split('').forEach((c, i) => { nuevo[i] = c; });
    setDigitos(nuevo);
    refs.current[Math.min(pegado.length, LONGITUD - 1)]?.focus();
    if (pegado.length === LONGITUD) verificar(pegado);
  };

  const verificar = async (codigo) => {
    setCargando(true);
    setError('');
    try {
      const { data } = await api.post('/auth/verificar', {
        empresa_id: empresaId,
        codigo,
      });
      setExitoso(true);
      setTimeout(() => onExito(data), 1200);
    } catch (err) {
      setError(err.mensaje);
      setDigitos(Array(LONGITUD).fill(''));
      refs.current[0]?.focus();
    } finally {
      setCargando(false);
    }
  };

  const reenviar = async () => {
    if (segundos > 0) return;
    setEnviando(true);
    setError('');
    try {
      await api.post('/auth/reenviar-codigo', { empresa_id: empresaId });
      setSegundos(REENVIO_ESPERA);
      setDigitos(Array(LONGITUD).fill(''));
      refs.current[0]?.focus();
    } catch (err) {
      setError(err.mensaje);
    } finally {
      setEnviando(false);
    }
  };

  // Pantalla de éxito
  if (exitoso) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-800">¡Cuenta verificada!</p>
          <p className="text-sm text-slate-500 mt-1">Redirigiendo al portal…</p>
        </div>
      </div>
    );
  }

  const emailOculto = email.replace(/(.{2}).+(@.+)/, '$1•••$2');

  return (
    <div className="flex flex-col items-center gap-6">

      {/* Icono */}
      <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
        <svg className="w-7 h-7 text-[#0C447C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-sm text-slate-500">
          Enviamos un código de 6 dígitos a
        </p>
        <p className="text-sm font-semibold text-slate-700 mt-0.5">{emailOculto}</p>
      </div>

      {/* Inputs OTP */}
      <div className="flex gap-3" onPaste={handlePaste}>
        {digitos.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={cargando}
            className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none
              transition-all duration-150 bg-white
              ${error
                ? 'border-red-300 text-red-600 bg-red-50'
                : d
                  ? 'border-[#0C447C] text-[#0C447C] bg-blue-50'
                  : 'border-slate-200 text-slate-800 focus:border-[#0C447C] focus:bg-blue-50'
              }
              disabled:opacity-50`}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="w-full bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 text-center">
          {error}
        </div>
      )}

      {/* Estado de carga */}
      {cargando && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Verificando…
        </div>
      )}

      {/* Reenvío */}
      <div className="text-center text-sm text-slate-500">
        ¿No recibiste el correo?{' '}
        {segundos > 0 ? (
          <span className="text-slate-400">
            Reenviar en <span className="font-semibold text-slate-600 tabular-nums">{segundos}s</span>
          </span>
        ) : (
          <button
            onClick={reenviar}
            disabled={enviando}
            className="text-[#0C447C] font-semibold hover:underline disabled:opacity-60 transition-colors"
          >
            {enviando ? 'Enviando…' : 'Reenviar código'}
          </button>
        )}
      </div>
    </div>
  );
}
