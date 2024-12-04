const express = require('express');
const router = express.Router();

// Importa la conexión de la base de datos desde db.js
const db = require('../db');

// Ruta para guardar las respuestas
router.post('/guardar_respuestas', (req, res) => {
  const { id_formulario, respuestas, id_usuario } = req.body;
  console.log("ID del formulario:", id_formulario);

  // Validar que las respuestas no estén vacías
  if (!id_formulario || !Array.isArray(respuestas) || respuestas.length === 0 || !id_usuario) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  // Reorganiza el flujo para obtener las preguntas antes de las respuestas
  const idsPreguntas = respuestas.map((r) => r.id_pregunta);
  if (!idsPreguntas || idsPreguntas.length === 0) {
    return res.status(400).json({ error: 'No se enviaron preguntas para validar' });
  }
  
  console.log("IDs de preguntas recibidos:", idsPreguntas);

  // Obtener todas las preguntas del formulario
  const queryPreguntasFormulario = `
    SELECT DISTINCT id_pregunta 
    FROM respuestas 
    WHERE id_pregunta IN (?) AND id_formulario = ?
  `;
  
  db.query(queryPreguntasFormulario, [idsPreguntas, id_formulario], (err, preguntasFormulario) => {
    if (err) {
      console.error("Error al obtener preguntas del formulario:", err);
      return res.status(500).json({ error: 'Error al obtener preguntas del formulario' });
    }

    // Validar si todas las preguntas fueron respondidas
    if (preguntasFormulario.length !== idsPreguntas.length) {
      return res.status(400).json({ error: 'No se han respondido todas las preguntas' });
    }

    console.log("Preguntas válidas recibidas:", preguntasFormulario);

    // Procesar cada respuesta
    const promises = respuestas.map((respuesta) => {
      const { id_pregunta, id_respuesta } = respuesta;

      console.log("ID de la pregunta:", id_pregunta);
      console.log("ID de la respuesta:", id_respuesta);

      // Obtener la respuesta correcta desde la base de datos
      const queryRespuestaCorrecta = `
        SELECT res_valor, res_estatus 
        FROM respuestas 
        WHERE id_pregunta = ? AND id_respuesta = ?
      `;

      return new Promise((resolve, reject) => {
        db.query(queryRespuestaCorrecta, [id_pregunta, id_respuesta], (err, result) => {
          if (err) {
            console.error("Error al obtener la respuesta correcta:", err);
            return reject('Error al obtener las respuestas correctas');
          }

          if (result.length === 0) {
            return reject(`Respuesta no encontrada en la base de datos para la pregunta ${id_pregunta}`);
          }

          const { res_valor, res_estatus } = result[0];

          // Insertar en la tabla 'resultados'
          const queryInsertResultado = `
            INSERT INTO resultados (id_usuario, id_pregunta, estatus_pregunta, result_valor)
            VALUES (?, ?, ?, ?)
          `;

          db.query(queryInsertResultado, [id_usuario, id_pregunta, res_estatus, res_valor], (err) => {
            if (err) {
              console.error("Error al guardar el resultado:", err);
              return reject('Error al guardar el resultado');
            }
            resolve(true);
          });
        });
      });
    });

    // Procesar todas las respuestas en paralelo
    Promise.all(promises)
      .then(() => {
        // Actualizar el estatus en 'candidatohabilidad'
        const queryUpdateCandidatoHabilidad = `
          UPDATE candidatohabilidad 
          SET estatus = 1 -- 1 indica "completado"
          WHERE id_formulario = ?
        `;
        
        db.query(queryUpdateCandidatoHabilidad, [id_formulario], (err) => {
          if (err) {
            console.error("Error al actualizar el estatus en candidatohabilidad:", err);
            return res.status(500).json({ error: 'Error al actualizar el estatus' });
          }

          return res.json({ success: 'Formulario completado y resultados guardados exitosamente' });
        });
      })
      .catch((error) => {
        console.error("Error al procesar las respuestas:", error);
        res.status(500).json({ error });
      });
  });
});

module.exports = router;
