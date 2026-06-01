CREATE DATABASE IF NOT EXISTS my_progettorkmk
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE my_progettorkmk;

CREATE TABLE IF NOT EXISTS contrattotelefonico (
  numero VARCHAR(20) NOT NULL,
  dataAttivazione DATE NOT NULL,
  tipo ENUM('ricarica', 'consumo') NOT NULL,
  minutiResidui INT NULL,
  creditoResiduo DECIMAL(10, 2) NULL,
  PRIMARY KEY (numero),
  CHECK (
    (tipo = 'consumo' AND minutiResidui IS NOT NULL AND creditoResiduo IS NULL)
    OR
    (tipo = 'ricarica' AND minutiResidui IS NULL AND creditoResiduo IS NOT NULL)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS simattiva (
  codice VARCHAR(30) NOT NULL,
  tipoSIM ENUM('standard', 'microSIM', 'nanoSIM', 'eSIM') NOT NULL,
  associataA VARCHAR(20) NOT NULL,
  dataAttivazione DATE NOT NULL,
  PRIMARY KEY (codice),
  UNIQUE KEY uq_sim_attiva_associata_a (associataA),
  CONSTRAINT fk_sim_attiva_contratto
    FOREIGN KEY (associataA)
    REFERENCES contrattotelefonico(numero)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS simdisattiva (
  codice VARCHAR(30) NOT NULL,
  tipoSIM ENUM('standard', 'microSIM', 'nanoSIM', 'eSIM') NOT NULL,
  eraAssociataA VARCHAR(20) NOT NULL,
  dataAttivazione DATE NOT NULL,
  dataDisattivazione DATE NOT NULL,
  PRIMARY KEY (codice),
  KEY idx_sim_disattiva_contratto (eraAssociataA),
  KEY idx_sim_disattiva_data (dataDisattivazione),
  CONSTRAINT fk_sim_disattiva_contratto
    FOREIGN KEY (eraAssociataA)
    REFERENCES contrattotelefonico(numero)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CHECK (dataDisattivazione >= dataAttivazione)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS simnonattiva (
  codice VARCHAR(30) NOT NULL,
  tipoSIM ENUM('standard', 'microSIM', 'nanoSIM', 'eSIM') NOT NULL,
  PRIMARY KEY (codice)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS telefonata (
  id INT NOT NULL,
  effettuataDa VARCHAR(20) NOT NULL,
  data DATE NOT NULL,
  ora TIME NOT NULL,
  durata INT NOT NULL,
  costo DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (id, effettuataDa),
  KEY idx_telefonata_contratto (effettuataDa),
  KEY idx_telefonata_data (data),
  CONSTRAINT fk_telefonata_contratto
    FOREIGN KEY (effettuataDa)
    REFERENCES contrattotelefonico(numero)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CHECK (durata >= 0),
  CHECK (costo >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
