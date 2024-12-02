const express = require('express');
const router = express.Router();
const db = require('../db'); // Conexión a la base de datos

// Ruta para obtener preguntas y sus respuestas filtradas por id_formulario
router.get('/preguntas', (req, res) => {
  const { id_formulario } = req.query; // Obtener el id_formulario desde los parámetros de la consulta

  // Verificar que id_formulario esté presente
  if (!id_formulario) {
    return res.status(400).json({ error: 'El id_formulario es necesario' });
  }

  // Consulta para obtener las preguntas y sus respuestas asociadas al id_formulario
  const query = `
    SELECT p.id_pregunta, p.texto_pregunta, p.tipo_respuesta, r.id_respuesta, r.opcion_respuesta
    FROM preguntas p
    LEFT JOIN respuestas r ON p.id_pregunta = r.id_pregunta
    WHERE p.id_formulario = ?
  `;

  db.query(query, [id_formulario], (err, results) => {
    if (err) {
      console.error('Error al obtener preguntas:', err);
      return res.status(500).json({ error: 'Error al obtener preguntas' });
    }

    // Agrupar las respuestas por pregunta
    const preguntas = results.reduce((acc, row) => {
      // Encontrar la pregunta en el acumulador
      let pregunta = acc.find(p => p.id_pregunta === row.id_pregunta);

      // Si la pregunta no está en el acumulador, agregarla
      if (!pregunta) {
        pregunta = {
          id_pregunta: row.id_pregunta,
          texto_pregunta: row.texto_pregunta,
          tipo_respuesta: row.tipo_respuesta,
          respuestas: [],
        };
        acc.push(pregunta);
      }

      // Si hay respuestas, agregarlas a la pregunta correspondiente
      if (row.id_respuesta) {
        pregunta.respuestas.push({
          id_respuesta: row.id_respuesta,
          opcion_respuesta: row.opcion_respuesta,
        });
      }

      return acc;
    }, []);

    // Enviar las preguntas con sus respuestas como respuesta
    res.json(preguntas);
  });
});

module.exports = router;
