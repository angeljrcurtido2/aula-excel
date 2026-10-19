-- Aula Excel: base de datos propia, separada de sistema_ale_2.
-- Se evitan los ENUM a propósito (un valor fuera del ENUM se guarda como cadena vacía sin error): se valida en la aplicación.
CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(30) NOT NULL,
  nombre VARCHAR(80) NOT NULL,
  xp INT UNSIGNED NOT NULL DEFAULT 0,
  racha_actual INT UNSIGNED NOT NULL DEFAULT 0,
  mejor_racha INT UNSIGNED NOT NULL DEFAULT 0,
  ultimo_dia DATE NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso TIMESTAMP NULL,
  UNIQUE KEY uq_usuarios_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS progreso (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  actividad VARCHAR(60) NOT NULL,
  clase TINYINT UNSIGNED NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  completada TINYINT(1) NOT NULL DEFAULT 0,
  mejor_puntaje TINYINT UNSIGNED NOT NULL DEFAULT 0,
  intentos INT UNSIGNED NOT NULL DEFAULT 0,
  estado JSON NULL,
  xp_ganado INT UNSIGNED NOT NULL DEFAULT 0,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_progreso (usuario_id, actividad),
  KEY ix_progreso_clase (usuario_id, clase),
  CONSTRAINT fk_progreso_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS insignias (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  codigo VARCHAR(40) NOT NULL,
  ganada_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_insignia (usuario_id, codigo),
  CONSTRAINT fk_insignia_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
