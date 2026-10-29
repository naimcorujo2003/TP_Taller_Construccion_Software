-- SocioClub: creation script + initial data (MySQL 8).
-- The Spring Boot app also creates the tables itself (spring.jpa.hibernate.ddl-auto=create) and loads
-- src/main/resources/data.sql, which holds the same data as this file.
CREATE DATABASE IF NOT EXISTS socioclub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE socioclub;

DROP TABLE IF EXISTS inscripcion;
DROP TABLE IF EXISTS socio;
DROP TABLE IF EXISTS actividad;

CREATE TABLE socio (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  dni VARCHAR(8) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  email VARCHAR(255),
  telefono VARCHAR(255),
  estado_cuota VARCHAR(10) NOT NULL
);

CREATE TABLE actividad (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  disciplina VARCHAR(255) NOT NULL,
  profesor VARCHAR(255) NOT NULL,
  dias VARCHAR(255) NOT NULL,
  horario VARCHAR(255) NOT NULL,
  edad_minima INT NOT NULL,
  edad_maxima INT NOT NULL,
  cupo_maximo INT NOT NULL,
  cuota_mensual DECIMAL(10,2) NOT NULL
);

CREATE TABLE inscripcion (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  fecha_inscripcion DATE NOT NULL,
  estado VARCHAR(10) NOT NULL,
  socio_id BIGINT NOT NULL,
  actividad_id BIGINT NOT NULL,
  CONSTRAINT fk_inscripcion_socio FOREIGN KEY (socio_id) REFERENCES socio (id),
  CONSTRAINT fk_inscripcion_actividad FOREIGN KEY (actividad_id) REFERENCES actividad (id)
);

-- Activities (ids 1..8 in this order)
INSERT INTO actividad (nombre, disciplina, dias, horario, edad_minima, edad_maxima, cupo_maximo, cuota_mensual, profesor) VALUES
  ('Fútbol infantil', 'Fútbol', 'Lun y Mié', '18:00', 6, 12, 40, 18000.00, 'Diego Ferreyra'),
  ('Vóley mixto', 'Vóley', 'Mar y Jue', '19:00', 13, 60, 24, 20000.00, 'Laura Ceballos'),
  ('Básquet juvenil', 'Básquet', 'Lun y Vie', '19:30', 12, 17, 20, 19000.00, 'Martín Oviedo'),
  ('Natación', 'Natación', 'Mar y Jue', '17:00', 5, 70, 30, 26000.00, 'Sofía Bustos'),
  ('Patín artístico', 'Patín', 'Mié y Vie', '17:30', 5, 15, 25, 21000.00, 'Carla Peralta'),
  ('Ajedrez', 'Ajedrez', 'Sáb', '10:00', 8, 99, 16, 9000.00, 'Raúl Giménez'),
  ('Funcional adultos', 'Fitness', 'Lun, Mié y Vie', '20:30', 18, 65, 30, 22000.00, 'Paula Luna'),
  ('Yoga', 'Bienestar', 'Mar y Jue', '9:00', 16, 99, 15, 17000.00, 'Inés Arguello');

-- Socios (ids 1..24 in this order; 16 and 17 are MOROSO)
INSERT INTO socio (dni, nombre, apellido, fecha_nacimiento, email, telefono, estado_cuota) VALUES
  ('40111001', 'Mateo', 'Gómez', '2018-04-12', 'mateo.gomez@mail.com', '351-555-1001', 'AL_DIA'),
  ('40111002', 'Sofía', 'Díaz', '2016-09-03', 'sofia.diaz@mail.com', '351-555-1002', 'AL_DIA'),
  ('40111003', 'Lucas', 'Romero', '2019-07-21', 'lucas.romero@mail.com', '351-555-1003', 'AL_DIA'),
  ('40111004', 'Valentina', 'Sosa', '2014-11-30', 'valentina.sosa@mail.com', '351-555-1004', 'AL_DIA'),
  ('40111005', 'Tomás', 'Acosta', '2021-02-10', 'tomas.acosta@mail.com', '351-555-1005', 'AL_DIA'),
  ('40222001', 'Camila', 'Ledesma', '2012-03-15', 'camila.ledesma@mail.com', '351-555-1006', 'AL_DIA'),
  ('40222002', 'Joaquín', 'Barrios', '2010-06-08', 'joaquin.barrios@mail.com', '351-555-1007', 'AL_DIA'),
  ('40222003', 'Martina', 'Ríos', '2009-12-19', 'martina.rios@mail.com', '351-555-1008', 'AL_DIA'),
  ('28333001', 'Laura', 'Fernández', '1988-05-02', 'laura.fernandez@mail.com', '351-555-1009', 'AL_DIA'),
  ('30333002', 'Carlos', 'Pereyra', '1985-08-17', 'carlos.pereyra@mail.com', '351-555-1010', 'AL_DIA'),
  ('32333003', 'Lucía', 'Martínez', '1992-01-25', 'lucia.martinez@mail.com', '351-555-1011', 'AL_DIA'),
  ('25333004', 'Roberto', 'Herrera', '1972-10-05', 'roberto.herrera@mail.com', '351-555-1012', 'AL_DIA'),
  ('6333005', 'Elena', 'Vargas', '1960-03-30', 'elena.vargas@mail.com', '351-555-1013', 'AL_DIA'),
  ('35333006', 'Diego', 'Molina', '1995-12-01', 'diego.molina@mail.com', '351-555-1014', 'AL_DIA'),
  ('33333007', 'Julieta', 'Castro', '1990-07-14', 'julieta.castro@mail.com', '351-555-1015', 'AL_DIA'),
  ('37333008', 'Nicolás', 'Peralta', '1999-09-09', 'nicolas.peralta@mail.com', '351-555-1016', 'MOROSO'),
  ('27333009', 'Mónica', 'Aguirre', '1980-02-28', 'monica.aguirre@mail.com', '351-555-1017', 'MOROSO'),
  ('41444001', 'Federico', 'Luna', '2008-04-04', 'federico.luna@mail.com', '351-555-1018', 'AL_DIA'),
  ('38333010', 'Paula', 'Giménez', '1997-06-22', 'paula.gimenez@mail.com', '351-555-1019', 'AL_DIA'),
  ('29333011', 'Ricardo', 'Ortiz', '1983-11-11', 'ricardo.ortiz@mail.com', '351-555-1020', 'AL_DIA'),
  ('36333012', 'Gabriela', 'Soria', '1994-03-03', 'gabriela.soria@mail.com', '351-555-1021', 'AL_DIA'),
  ('31333013', 'Andrés', 'Paz', '1987-10-30', 'andres.paz@mail.com', '351-555-1022', 'AL_DIA'),
  ('34333014', 'Hernán', 'Bustos', '1991-08-08', 'hernan.bustos@mail.com', '351-555-1023', 'AL_DIA'),
  ('39333015', 'Sabrina', 'Quiroga', '1998-01-19', 'sabrina.quiroga@mail.com', '351-555-1024', 'AL_DIA');

-- Inscriptions. Yoga is full (15/15), Ajedrez is almost full (15/16), Laura Fernandez (DNI 28333001) has 3 activities.
-- Inscription id 1 (Sofia Diaz, Futbol infantil) is used by the baja examples.
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '40111002' AND a.nombre = 'Fútbol infantil';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '40111003' AND a.nombre = 'Fútbol infantil';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '40111004' AND a.nombre = 'Fútbol infantil';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '40222002' AND a.nombre = 'Yoga';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '40222003' AND a.nombre = 'Yoga';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '28333001' AND a.nombre = 'Yoga';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '30333002' AND a.nombre = 'Yoga';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '32333003' AND a.nombre = 'Yoga';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '25333004' AND a.nombre = 'Yoga';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '6333005' AND a.nombre = 'Yoga';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '35333006' AND a.nombre = 'Yoga';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '33333007' AND a.nombre = 'Yoga';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '41444001' AND a.nombre = 'Yoga';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '38333010' AND a.nombre = 'Yoga';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '29333011' AND a.nombre = 'Yoga';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '36333012' AND a.nombre = 'Yoga';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '31333013' AND a.nombre = 'Yoga';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '34333014' AND a.nombre = 'Yoga';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '40111002' AND a.nombre = 'Ajedrez';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '40111004' AND a.nombre = 'Ajedrez';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '40222001' AND a.nombre = 'Ajedrez';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '40222002' AND a.nombre = 'Ajedrez';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '28333001' AND a.nombre = 'Ajedrez';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '30333002' AND a.nombre = 'Ajedrez';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '25333004' AND a.nombre = 'Ajedrez';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '6333005' AND a.nombre = 'Ajedrez';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '35333006' AND a.nombre = 'Ajedrez';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '41444001' AND a.nombre = 'Ajedrez';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '38333010' AND a.nombre = 'Ajedrez';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '29333011' AND a.nombre = 'Ajedrez';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '36333012' AND a.nombre = 'Ajedrez';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '31333013' AND a.nombre = 'Ajedrez';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '39333015' AND a.nombre = 'Ajedrez';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '28333001' AND a.nombre = 'Natación';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '40111005' AND a.nombre = 'Natación';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '32333003' AND a.nombre = 'Natación';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '40222001' AND a.nombre = 'Vóley mixto';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '41444001' AND a.nombre = 'Vóley mixto';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '30333002' AND a.nombre = 'Funcional adultos';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '25333004' AND a.nombre = 'Funcional adultos';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '40111005' AND a.nombre = 'Patín artístico';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '40222002' AND a.nombre = 'Básquet juvenil';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'ACTIVA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '40222003' AND a.nombre = 'Básquet juvenil';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'BAJA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '37333008' AND a.nombre = 'Básquet juvenil';
INSERT INTO inscripcion (fecha_inscripcion, estado, socio_id, actividad_id) SELECT '2026-09-01', 'BAJA', s.id, a.id FROM socio s, actividad a WHERE s.dni = '27333009' AND a.nombre = 'Funcional adultos';
