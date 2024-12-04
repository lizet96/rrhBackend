const express = require('express');
const router = express.Router();

// Importa la conexión de la base de datos desde db.js
const db = require('../db');

// Ruta para guardar las respuestas
router.post('/guardar_respuestas', (req, res) => {
  const { id_formulario, respuestas, id_usuario } = req.body;

  if (!id_formulario || !Array.isArray(respuestas) || respuestas.length === 0 || !id_usuario) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  const idsPreguntas = respuestas.map((r) => r.id_pregunta);

  const promises = respuestas.map(({ id_pregunta, id_respuesta }) => {
    const queryRespuestaCorrecta = `
      SELECT res_valor, res_estatus 
      FROM respuestas 
      WHERE id_pregunta = ? AND id_respuesta = ?
    `;

    return new Promise((resolve, reject) => {
      db.query(queryRespuestaCorrecta, [id_pregunta, id_respuesta], (err, result) => {
        if (err || result.length === 0) {
          return reject('Error al obtener respuestas o respuesta no encontrada');
        }

        const { res_valor, res_estatus } = result[0];
        const queryInsertResultado = `
          INSERT INTO resultados (id_usuario, id_pregunta, estatus_pregunta, result_valor)
          VALUES (?, ?, ?, ?)
        `;

        db.query(queryInsertResultado, [id_usuario, id_pregunta, res_estatus, res_valor], (err) => {
          if (err) {
            return reject('Error al guardar el resultado');
          }
          resolve(true);
        });
      });
    });
  });

  Promise.all(promises)
    .then(() => {
      const queryPreguntasFormulario = `
        SELECT DISTINCT id_pregunta 
        FROM respuestas 
        WHERE id_pregunta IN (?) AND id_formulario = ?
      `;

      db.query(queryPreguntasFormulario, [idsPreguntas, id_formulario], (err, preguntasFormulario) => {
        if (err) {
          return res.status(500).json({ error: 'Error al obtener preguntas del formulario' });
        }

        if (preguntasFormulario.length === idsPreguntas.length) {
          const queryUpdateCandidatoHabilidad = `
            UPDATE candidatohabilidad 
            SET estatus = 1 
            WHERE id_formulario = ?
          `;

          db.query(queryUpdateCandidatoHabilidad, [id_formulario], (err) => {
            if (err) {
              return res.status(500).json({ error: 'Error al actualizar el estatus' });
            }
            return res.json({ success: 'Formulario completado y resultados guardados exitosamente' });
          });
        } else {
          res.json({ success: 'Respuestas guardadas, pero el formulario aún no se ha completado' });
        }
      });
    })
    .catch((error) => {
      console.error("Error al procesar las respuestas:", error);
      res.status(500).json({ error });
    });
});


module.exports = router;