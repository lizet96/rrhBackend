// routes/respuestas.js

const express = require('express');
const router = express.Router();

// Importa la conexión de la base de datos desde db.js
const db = require('../db'); // Aquí importamos la conexión a la base de datos
// Configuración de la conexión a la base de datos
// Ruta para guardar las respuestas
router.post('/guardar_respuestas', (req, res) => {
  const { id_formulario, respuestas } = req.body;

  // Validar que las respuestas no estén vacías
  if (!id_formulario || !Array.isArray(respuestas) || respuestas.length === 0) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  // Insertar respuestas en la tabla pregunta_respuesta
  const query = 'INSERT INTO pregunta_respuesta (id_pregunta, id_respuesta) VALUES ?';
  const values = respuestas.map((respuesta) => [respuesta.id_pregunta, respuesta.id_respuesta]);

  db.query(query, [values], (err, result) => {
    if (err) {
      console.error("Error al guardar las respuestas:", err);
      return res.status(500).json({ error: 'Error al guardar las respuestas' });
    }
    res.json({ success: 'Respuestas guardadas exitosamente' });
  });
});

module.exports = router;
