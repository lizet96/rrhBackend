const db = require("../db");

// Obtener todas las vacantes (sin filtrar por id_empresa)
exports.getVacantesEmpresa = (req, res) => {
  const query = `
    SELECT id_vacante, vac_nombre, vac_descripcion, fecha_inicio, fecha_fin, sueldoMensual, id_categoria
    FROM vacante;
  `;
  db.query(query, (error, resultados) => {
    if (error) {
      console.error("Error al obtener las vacantes:", error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(resultados);
  });
};

// Obtener postulantes por id_vacante con información de candidato y usuario
exports.getPostulantes = (req, res) => {
  const id_vacante = req.query.id_vacante;

  const query = `
    SELECT 
      c.id_candidato, 
      c.telefono, 
      u.us_nombre, 
      u.us_apellido, 
      u.us_correo
    FROM candidatovacante cv
    JOIN candidatos c ON c.id_candidato = cv.id_candidato
    JOIN usuario u ON u.id_usuario = c.id_usuario
    WHERE cv.id_vacante = ? AND cv.totalcompleto >= 80;
  `;
  
  db.query(query, [id_vacante], (error, resultados) => {
    if (error) {
      console.error("Error al obtener los postulantes:", error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(resultados);
  });
};