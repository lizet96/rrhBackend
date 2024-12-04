const express = require('express');
const router = express.Router();
const db = require('../db'); // Conexión a la base de datos

// Ruta para obtener preguntas y sus respuestas filtradas por id_formulario
router.get('/preguntas', (req, res) => {
  const { id_formulario } = req.query; // Obtener el id_formulario desde los parámetros de la consulta

  // Verificar que id_formulario esté presente
  if (!id_formulario) {
    return res.status(400).json({ error: 'Falta id_formulario' });
  }
  if (!Array.isArray(respuestas) || respuestas.length === 0) {
    return res.status(400).json({ error: 'Las respuestas están vacías o son inválidas' });
  }
  if (!id_usuario) {
    return res.status(400).json({ error: 'Falta id_usuario' });
  }
  
  console.log("Recibido id_formulario:", id_formulario); // Log para verificar qué valor llega

  const query = `
    SELECT p.id_pregunta, p.texto_pregunta, r.id_respuesta, r.opcion_respuesta
    FROM preguntas p
    LEFT JOIN respuestas r ON p.id_pregunta = r.id_pregunta
    WHERE p.id_formulario = ?
  `;

  db.query(query, [id_formulario], (err, results) => {
    if (err) {
      console.error("Error al obtener preguntas del formulario:", err.message, err.stack);
      return res.status(500).json({ error: 'Error al ejecutar la consulta SQL para preguntas del formulario' });
    }
    

    const preguntas = results.reduce((acc, row) => {
      let pregunta = acc.find(p => p.id_pregunta === row.id_pregunta);

      if (!pregunta) {
        pregunta = {
          id_pregunta: row.id_pregunta,
          texto_pregunta: row.texto_pregunta,
          respuestas: [],
        };
        acc.push(pregunta);
      }

      if (row.id_respuesta) {
        pregunta.respuestas.push({
          id_respuesta: row.id_respuesta,
          opcion_respuesta: row.opcion_respuesta,
        });
      }

      return acc;
    }, []);

    console.log("Preguntas generadas:", JSON.stringify(preguntas, null, 2)); // Log para verificar resultados
    res.json(preguntas);
  });
});

module.exports = router;
