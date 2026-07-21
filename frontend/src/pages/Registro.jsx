// archivo: src/components/auth/RegistroForm.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/services/api";

// ── Validación ────────────────────────────────────────────────────
const schema = z
  .object({
    razon_social:       z.string().min(3, "Mínimo 3 caracteres").max(255),
    nit:                z.string().regex(
                          /^\d{3}\.?\d{3}\.?\d{3}-?\d$/,
                          "Formato inválido (ej: 900.123.456-7)"
                        ),
    email:              z.string().email("Correo inválido"),
    telefono:           z.string().optional(),
    rep_legal:          z.string().min(3, "Mínimo 3 caracteres"),
    cargo_rep:          z.string().optional(),
    password:           z.string()
                          .min(8, "Mínimo 8 caracteres")
                          .regex(/[A-Z]/, "Debe incluir una mayúscula")
                          .regex(/[0-9]/, "Debe incluir un número"),
    confirmar_password: z.string(),
  })
  .refine((d) => d.password === d.confirmar_password, {
    message: "Las contraseñas no coinciden",
    path:    ["confirmar_password"],
  });

// ── Tipos de ISP ──────────────────────────────────────────────────
const TIPOS_ISP = [
  {
    valor:   "ISP_RESIDENCIAL",
    label:   "Internet residencial",
    desc:    "Solo internet para estratos 1 al 6",
    formato: "T.1.2",
  },
  {
    valor:   "ISP_EMPRESARIAL",
    label:   "Internet empresarial",
    desc:    "Solo internet para segmento comercial y corporativo",
    formato: "T.1.1",
  },
  {
    valor:   "ISP_MIXTO",
    label:   "Internet residencial + empresarial",
    desc:    "Atiende hogares y empresas simultáneamente",
    formato: "T.1.1 + T.1.2",
  },
  {
    valor:   "ISP_TV",
    label:   "Internet + televisión",
    desc:    "Internet residencial con TV por suscripción",
    formato: "T.1.2 + F.7",
  },
  {
    valor:   "ISP_TV_MIXTO",
    label:   "Internet mixto + televisión",
    desc:    "Residencial, empresarial y TV por suscripción",
    formato: "T.1.1 + T.1.2 + F.7",
  },
  {
    valor:   "COMUNITARIO",
    label:   "TV y/o Internet comunitario",
    desc:    "Comunidad organizada sin ánimo de lucro (TV comunitaria / ICF)",
    formato: "F.1 + T.1.10",
  },
];

// ── Tokens de estilo compartidos ──────────────────────────────────
const S = {
  input: {
    background:   "rgba(255,255,255,0.05)",
    border:       "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color:        "white",
    fontSize:     "13px",
    padding:      "10px 14px",
    width:        "100%",
    outline:      "none",
    transition:   "border-color 0.2s",
  },
  inputErr: {
    background:   "rgba(248,113,113,0.07)",
    border:       "1px solid rgba(248,113,113,0.5)",
    borderRadius: "10px",
    color:        "white",
    fontSize:     "13px",
    padding:      "10px 14px",
    width:        "100%",
    outline:      "none",
    transition:   "border-color 0.2s",
  },
  label: {
    display:       "block",
    fontSize:      "10px",
    fontWeight:    "600",
    letterSpacing: "0.08em",
    color:         "rgba(255,255,255,0.7)",
    marginBottom:  "6px",
  },
  sectionTitle: {
    fontSize:      "10px",
    fontWeight:    "700",
    letterSpacing: "0.1em",
    color:         "rgba(255,255,255,0.4)",
    marginBottom:  "12px",
    paddingBottom: "8px",
    borderBottom:  "1px solid rgba(255,255,255,0.06)",
    fontFamily:    '"IBM Plex Mono", monospace',
  },
};

// ── Íconos ────────────────────────────────────────────────────────
const IconErr = () => (
  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
      clipRule="evenodd" />
  </svg>
);

const IconSpinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10"
      stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

// ── Campo reutilizable ────────────────────────────────────────────
function Campo({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label style={S.label}>
        {label}
        {required && (
          <span style={{ color: "rgba(248,113,113,0.8)" }}> *</span>
        )}
      </label>
      {children}
      {error && (
        <span className="flex items-center gap-1 text-xs" style={{ color: "#fca5a5" }}>
          <IconErr /> {error}
        </span>
      )}
    </div>
  );
}

// ── Input reutilizable ────────────────────────────────────────────
function Input({ register, name, type = "text", placeholder, error, extraStyle = {} }) {
  const base = error ? S.inputErr : S.input;
  return (
    <input
      {...register(name)}
      type={type}
      placeholder={placeholder}
      style={{ ...base, ...extraStyle }}
      onFocus={(e) => {
        e.target.style.borderColor = error
          ? "rgba(248,113,113,0.8)"
          : "rgba(244,228,9,0.55)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = error
          ? "rgba(248,113,113,0.5)"
          : "rgba(255,255,255,0.1)";
      }}
    />
  );
}

// ── Selector tipo ISP ─────────────────────────────────────────────
function SelectorISP({ value, onChange, error }) {
  return (
    <div className="flex flex-col gap-2">
      {TIPOS_ISP.map((tipo) => {
        const sel = value === tipo.valor;
        return (
          <button
            key={tipo.valor}
            type="button"
            onClick={() => onChange(tipo.valor)}
            className="w-full text-left rounded-xl px-4 py-3 transition-all duration-150"
            style={{
              background: sel
                ? "rgba(244,228,9,0.15)"
                : "rgba(255,255,255,0.03)",
              border: sel
                ? "1px solid rgba(244,228,9,0.5)"
                : error
                ? "1px solid rgba(248,113,113,0.3)"
                : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Radio visual */}
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{
                    border:     sel ? "1px solid #f4e409" : "1px solid rgba(255,255,255,0.2)",
                    background: sel ? "rgba(244,228,9,0.15)" : "transparent",
                    flexShrink: 0,
                  }}
                >
                  {sel && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: "#f4e409" }}
                    />
                  )}
                </div>

                {/* Texto */}
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: sel ? "white" : "rgba(255,255,255,0.65)" }}
                  >
                    {tipo.label}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {tipo.desc}
                  </p>
                </div>
              </div>

              {/* Badge formato */}
              <span
                className="text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{
                  background: sel ? "rgba(244,228,9,0.15)" : "rgba(255,255,255,0.04)",
                  border:     sel ? "1px solid rgba(244,228,9,0.35)" : "1px solid rgba(255,255,255,0.07)",
                  color:      sel ? "#f4e409" : "rgba(255,255,255,0.35)",
                }}
              >
                {tipo.formato}
              </span>
            </div>
          </button>
        );
      })}

      {error && (
        <span className="flex items-center gap-1 text-xs mt-1" style={{ color: "#fca5a5" }}>
          <IconErr /> {error}
        </span>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────
export function RegistroForm({ onExito }) {
  const [cargando,    setCargando]    = useState(false);
  const [errorGlobal, setErrorGlobal] = useState("");
  const [tipoISP,     setTipoISP]     = useState("");
  const [tipoError,   setTipoError]   = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (datos) => {
    if (!tipoISP) {
      setTipoError("Selecciona el tipo de operador");
      return;
    }
    setTipoError("");
    setCargando(true);
    setErrorGlobal("");

    try {
      const { data } = await api.post("/auth/registro", { ...datos, tipo_isp: tipoISP });
      onExito({ empresa_id: data.empresa_id, email: data.email });
    } catch (err) {
      const campos     = err.campos ?? [];
      const falloCampo = Array.isArray(campos) ? campos[0]?.campo : campos?.campo;
      if (falloCampo === "email") {
        setError("email", { message: "Este correo ya está registrado." });
      } else if (falloCampo === "nit") {
        setError("nit", { message: "Este NIT ya está registrado." });
      } else {
        setErrorGlobal(err.mensaje || "Error desconocido. Intenta de nuevo.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-7">

      {/* Error global */}
      {errorGlobal && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl px-4 py-3 text-xs"
          style={{
            background: "rgba(248,113,113,0.1)",
            border:     "1px solid rgba(248,113,113,0.3)",
            color:      "#fca5a5",
          }}
        >
          <IconErr />
          {errorGlobal}
        </div>
      )}

      {/* ── 1. Datos de la empresa ── */}
      <div>
        <p style={S.sectionTitle}>DATOS DE LA EMPRESA</p>
        <div className="flex flex-col gap-4">
          <Campo label="Razón social" error={errors.razon_social?.message} required>
            <Input register={register} name="razon_social"
              placeholder="Mi Empresa S.A.S." error={errors.razon_social} />
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="NIT" error={errors.nit?.message} required>
              <Input register={register} name="nit"
                placeholder="900.123.456-7" error={errors.nit} />
            </Campo>
            <Campo label="Teléfono" error={errors.telefono?.message}>
              <Input register={register} name="telefono"
                type="tel" placeholder="300 000 0000" error={errors.telefono} />
            </Campo>
          </div>
        </div>
      </div>

      {/* ── 2. Tipo de operador ISP ── */}
      <div>
        <p style={S.sectionTitle}>TIPO DE OPERADOR</p>
        <p className="text-xs mb-3 leading-relaxed"
          style={{ color: "rgba(255,255,255,0.45)" }}>
          Define qué formatos regulatorios debes reportar ante la CRC y MinTIC.
        </p>
        <SelectorISP
          value={tipoISP}
          onChange={(v) => { setTipoISP(v); setTipoError(""); }}
          error={tipoError}
        />
      </div>

      {/* ── 3. Representante legal ── */}
      <div>
        <p style={S.sectionTitle}>REPRESENTANTE LEGAL</p>
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Nombre completo" error={errors.rep_legal?.message} required>
            <Input register={register} name="rep_legal"
              placeholder="Nombre completo" error={errors.rep_legal} />
          </Campo>
          <Campo label="Cargo" error={errors.cargo_rep?.message}>
            <Input register={register} name="cargo_rep"
              placeholder="Gerente General" error={errors.cargo_rep} />
          </Campo>
        </div>
      </div>

      {/* ── 4. Acceso a la plataforma ── */}
      <div>
        <p style={S.sectionTitle}>ACCESO A LA PLATAFORMA</p>
        <div className="flex flex-col gap-4">
          <Campo label="Correo institucional" error={errors.email?.message} required>
            <Input register={register} name="email"
              type="email" placeholder="contacto@empresa.co" error={errors.email} />
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Contraseña" error={errors.password?.message} required>
              <Input register={register} name="password"
                type="password" placeholder="Mínimo 8 caracteres" error={errors.password} />
            </Campo>
            <Campo label="Confirmar contraseña" error={errors.confirmar_password?.message} required>
              <Input register={register} name="confirmar_password"
                type="password" placeholder="Repite la contraseña"
                error={errors.confirmar_password} />
            </Campo>
          </div>

          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            Mínimo 8 caracteres, una mayúscula y un número.
          </p>
        </div>
      </div>

      {/* ── Botón ── */}
      <button
        type="submit"
        disabled={cargando}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: "#f4e409", color: "#0b1830" }}
        onMouseEnter={(e) => { if (!cargando) e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
      >
        {cargando ? <><IconSpinner /> Creando cuenta…</> : "Crear cuenta"}
      </button>
    </form>
  );
}