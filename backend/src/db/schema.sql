-- ── Empresas ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS empresas (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  razon_social  VARCHAR(255)  NOT NULL,
  nit           VARCHAR(20)   NOT NULL UNIQUE,
  tipo_isp      ENUM('ISP_RESIDENCIAL','ISP_EMPRESARIAL','ISP_MIXTO','ISP_TV','ISP_TV_MIXTO') NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  telefono      VARCHAR(20),
  rep_legal     VARCHAR(255)  NOT NULL,
  cargo_rep     VARCHAR(100),
  municipio     VARCHAR(100),
  password_hash VARCHAR(255)  NOT NULL,
  rol           ENUM('empresa','admin') NOT NULL DEFAULT 'empresa',
  estado        ENUM('activo','inactivo','pendiente') NOT NULL DEFAULT 'pendiente',
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Códigos OTP ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_codes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  empresa_id  INT          NOT NULL,
  codigo      VARCHAR(6)   NOT NULL,
  expires_at  DATETIME     NOT NULL,
  usado       TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- ── Reportes T.1.2 ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reportes_t12 (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  empresa_id    INT          NOT NULL,
  anio          YEAR         NOT NULL,
  trimestre     ENUM('1T','2T','3T','4T') NOT NULL,
  municipio     VARCHAR(100) NOT NULL,
  estado        ENUM('borrador','pendiente_revision','aprobado','con_observaciones','rechazado') NOT NULL DEFAULT 'borrador',
  observaciones TEXT,
  datos_planes  JSON         NOT NULL,
  datos_pqr     JSON         NOT NULL,
  revisado_por  INT,
  revisado_at   TIMESTAMP,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id)   REFERENCES empresas(id) ON DELETE CASCADE,
  FOREIGN KEY (revisado_por) REFERENCES empresas(id) ON DELETE SET NULL,
  UNIQUE KEY unique_reporte (empresa_id, anio, trimestre)
);

-- ── Reportes Formato 7 ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reportes_f7 (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  empresa_id      INT          NOT NULL,
  anio            YEAR         NOT NULL,
  trimestre       ENUM('1T','2T','3T','4T') NOT NULL,
  estado          ENUM('borrador','pendiente_revision','aprobado','con_observaciones','rechazado') NOT NULL DEFAULT 'borrador',
  observaciones   TEXT,
  datos_generales JSON         NOT NULL,
  datos_ingresos  JSON         NOT NULL,
  datos_planes    JSON         NOT NULL,
  datos_pqr       JSON         NOT NULL,
  datos_encuestas JSON         NOT NULL,
  revisado_por    INT,
  revisado_at     TIMESTAMP,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id)   REFERENCES empresas(id) ON DELETE CASCADE,
  FOREIGN KEY (revisado_por) REFERENCES empresas(id) ON DELETE SET NULL,
  UNIQUE KEY unique_reporte_f7 (empresa_id, anio, trimestre)
);

-- ── Admin inicial ─────────────────────────────────────────────────
-- password: Admin2026* (bcrypt hash)
INSERT IGNORE INTO empresas (razon_social, nit, tipo_isp, email, rep_legal, password_hash, rol, estado)
VALUES (
  'Gesco IA',
  '000-000-000-0',
  'ISP_RESIDENCIAL',
  'admin@gesco.co',
  'Equipo Gesco IA',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin',
  'activo'
);