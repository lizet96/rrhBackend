const db = require("../db");  // Asegúrate de que la conexión a la base de datos está configurada correctamente

// Controlador para obtener los resultados de todos los formularios
exports.getResultados = (req, res) => {
  const query = `
    SELECT 
      v.vac_nombre AS vacante_nombre,
      f.for_nombre AS formulario_nombre,
      h.hab_nombre AS habilidad_nombre,
      COUNT(p.id_pregunta) AS total_preguntas,
      SUM(CASE WHEN r.res_estatus = 1 THEN 1 ELSE 0 END) AS respuestas_correctas, 
      IF(COUNT(p.id_pregunta) > 0, 
         (SUM(CASE WHEN r.res_estatus = 1 THEN 1 ELSE 0 END) / COUNT(p.id_pregunta)) * 100, 
         0) AS promedio_respuestas_correctas
    FROM 
      vacante v
    JOIN 
      formulario f ON v.id_vacante = f.id_vacante
    JOIN 
      habilidad h ON f.id_habilidad = h.id_habilidad
    JOIN 
      preguntas p ON f.id_formulario = p.id_formulario
    JOIN 
      pregunta_respuesta pr ON p.id_pregunta = pr.id_pregunta
    JOIN 
      respuestas r ON pr.id_respuesta = r.id_respuesta
    GROUP BY 
      v.id_vacante, f.id_formulario, h.id_habilidad
    ORDER BY 
      vacante_nombre, formulario_nombre;
  `;

  // Realiza la consulta en la base de datos
  db.query(query, (error, resultados) => {
    if (error) {
      console.error("Error al obtener los resultados:", error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (resultados.length === 0) {
      return res.status(404).json({ error: 'No se encontraron resultados para los formularios' });
    }

    // Devuelve los resultados como JSON
    res.json(resultados);
  });
};
