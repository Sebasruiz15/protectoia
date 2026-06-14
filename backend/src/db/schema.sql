-- ============================================================
-- IA System Grup — Schema base de datos
-- Ejecutar en orden en PostgreSQL
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Empresas registradas
CREATE TABLE empresas (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Datos básicos
  razon_social      VARCHAR(255) NOT NULL,
  nit               VARCHAR(20)  NOT NULL UNIQUE,
  email             VARCHAR(255) NOT NULL UNIQUE,
  password_hash     VARCHAR(255) NOT NULL,
  -- Datos de contacto
  telefono          VARCHAR(20),
  rep_legal         VARCHAR(255),
  cargo_rep         VARCHAR(100),
  -- Estado de la cuenta
  verificado        BOOLEAN      DEFAULT FALSE,
  activo            BOOLEAN      DEFAULT TRUE,
  rol               VARCHAR(20)  DEFAULT 'empresa', -- 'empresa' | 'admin'
  -- Timestamps
  created_at        TIMESTAMPTZ  DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  DEFAULT NOW()
);

-- Códigos OTP para verificación de correo y recuperación
CREATE TABLE otp_codigos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id  UUID        NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  codigo      VARCHAR(6)  NOT NULL,
  tipo        VARCHAR(30) NOT NULL, -- 'verificacion_email' | 'reset_password'
  usado       BOOLEAN     DEFAULT FALSE,
  expira_en   TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_empresas_email ON empresas(email);
CREATE INDEX idx_empresas_nit   ON empresas(nit);
CREATE INDEX idx_otp_empresa    ON otp_codigos(empresa_id);
CREATE INDEX idx_otp_codigo     ON otp_codigos(codigo);
