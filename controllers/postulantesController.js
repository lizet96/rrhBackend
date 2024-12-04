const db = require("../db");  // Asegúrate de que la conexión a la base de datos está configurada correctamente

// Obtener vacantes por id_empresa
exports.getVacantesEmpresa = (req, res) => {

  const query = `
    SELECT id_vacante, vac_nombre, vac_descripcion, fecha_inicio, fecha_fin, sueldoMensual, id_empresa, id_categoria
    FROM vacante;
  `;
  
  // Realiza la consulta en la base de datos
  db.query(query, [id_empresa], (error, resultados) => {
    if (error) {
      console.error("Error al obtener los resultados:", error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (resultados.length === 0) {
      return res.status(404).json({ error: 'No se encontraron resultados para vacantes' });
    }

    // Devuelve los resultados como JSON
    res.json(resultados);
  });
};

// Obtener postulantes con totalcompleto >= 80 por id_vacante
exports.getPostulantes = (req, res) => {
  const id_vacante = req.query.id_vacante;  // Obtenemos el id de la vacante desde los parámetros de consulta

  const query = `
    SELECT id_candidato, id_vacante, totalcompleto
    FROM candidatovacante
    WHERE id_vacante = ? AND totalcompleto >= 80;
  `;
  
  // Realiza la consulta en la base de datos
  db.query(query, [id_vacante], (error, resultados) => {
    if (error) {
      console.error("Error al obtener los resultados:", error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (resultados.length === 0) {
      return res.status(404).json({ error: 'No se encontraron resultados para postulantes' });
    }

    // Devuelve los resultados como JSON
    res.json(resultados);
  });
};