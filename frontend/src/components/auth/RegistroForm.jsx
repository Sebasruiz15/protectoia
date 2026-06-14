// src/components/auth/RegistroForm.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../../services/api";

const schema = z
  .object({
    razon_social: z.string().min(3, "Mínimo 3 caracteres").max(255),
    nit: z
      .string()
      .regex(
        /^\d{3}\.?\d{3}\.?\d{3}-?\d$/,
        "Formato inválido (ej: 900.123.456-7)",
      ),
    email: z.string().email("Correo inválido"),
    telefono: z.string().optional(),
    rep_legal: z.string().min(3, "Mínimo 3 caracteres"),
    cargo_rep: z.string().optional(),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe incluir una mayúscula")
      .regex(/[0-9]/, "Debe incluir un número"),
    confirmar_password: z.string(),
  })
  .refine((d) => d.password === d.confirmar_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar_password"],
  });

// Campo de formulario reutilizable
function Campo({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && (
        <span className="text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}

// Input con estilo unificado
function Input({ register, name, type = "text", placeholder, error }) {
  return (
    <input
      {...register(name)}
      type={type}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white transition-all outline-none
        placeholder:text-slate-300
        ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        }`}
    />
  );
}

export function RegistroForm({ onExito }) {
  const [cargando, setCargando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (datos) => {
    setCargando(true);
    setErrorGlobal("");
    try {
      const { data } = await api.post("/auth/registro", datos);
      onExito({ empresa_id: data.empresa_id, email: data.email });
    } catch (err) {
      // El interceptor de `api` devuelve `{ mensaje, status, campos }`.
      // Aceptamos tanto arrays como objetos para mayor compatibilidad.
      const campos = err.campos ?? [];
      const falloCampo = Array.isArray(campos)
        ? campos[0]?.campo
        : campos?.campo;
      if (falloCampo === "email") {
        setError("email", { message: "Este correo ya está registrado." });
      } else if (falloCampo === "nit") {
        setError("nit", { message: "Este NIT ya está registrado." });
      } else {
        setErrorGlobal(err.mensaje || "Error desconocido");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {errorGlobal && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {errorGlobal}
        </div>
      )}

      {/* Datos de la empresa */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Datos de la empresa
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Campo
              label="Razón social"
              error={errors.razon_social?.message}
              required
            >
              <Input
                register={register}
                name="razon_social"
                placeholder="Mi Empresa S.A.S."
                error={errors.razon_social}
              />
            </Campo>
          </div>
          <Campo label="NIT" error={errors.nit?.message} required>
            <Input
              register={register}
              name="nit"
              placeholder="900.123.456-7"
              error={errors.nit}
            />
          </Campo>
          <Campo label="Teléfono" error={errors.telefono?.message}>
            <Input
              register={register}
              name="telefono"
              placeholder="300 000 0000"
              type="tel"
              error={errors.telefono}
            />
          </Campo>
        </div>
      </div>

      {/* Representante legal */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Representante legal
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo
            label="Nombre completo"
            error={errors.rep_legal?.message}
            required
          >
            <Input
              register={register}
              name="rep_legal"
              placeholder="Nombre completo"
              error={errors.rep_legal}
            />
          </Campo>
          <Campo label="Cargo" error={errors.cargo_rep?.message}>
            <Input
              register={register}
              name="cargo_rep"
              placeholder="Gerente General"
              error={errors.cargo_rep}
            />
          </Campo>
        </div>
      </div>

      {/* Acceso */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Acceso a la plataforma
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Campo
              label="Correo institucional"
              error={errors.email?.message}
              required
            >
              <Input
                register={register}
                name="email"
                type="email"
                placeholder="contacto@empresa.co"
                error={errors.email}
              />
            </Campo>
          </div>
          <Campo label="Contraseña" error={errors.password?.message} required>
            <Input
              register={register}
              name="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              error={errors.password}
            />
          </Campo>
          <Campo
            label="Confirmar contraseña"
            error={errors.confirmar_password?.message}
            required
          >
            <Input
              register={register}
              name="confirmar_password"
              type="password"
              placeholder="Repite la contraseña"
              error={errors.confirmar_password}
            />
          </Campo>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          La contraseña debe tener mínimo 8 caracteres, una mayúscula y un
          número.
        </p>
      </div>

      <button
        type="submit"
        disabled={cargando}
        className="w-full py-3 rounded-xl bg-[#0C447C] hover:bg-[#042C53] text-white text-sm font-semibold
          transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
          flex items-center justify-center gap-2"
      >
        {cargando ? (
          <>
            <svg
              className="animate-spin w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Creando cuenta…
          </>
        ) : (
          "Crear cuenta"
        )}
      </button>
    </form>
  );
}
