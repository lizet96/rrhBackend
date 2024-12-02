const express = require('express');
const router = express.Router();
const db = require('../db'); // Conexión a la base de datos

// Ruta para obtener formularios filtrados por id_vacante
router.get('/formularios', (req, res) => {
  const { vacante_id } = req.query; // Obtener el id_vacante desde los parámetros de la consulta

  // Verificar que vacante_id esté presente
  if (!vacante_id) {
    return res.status(400).json({ error: 'El id_vacante es necesario' });
  }

  // Consulta para obtener los formularios asociados al id_vacante
  const query = 'SELECT * FROM formulario WHERE id_vacante = ?';

  db.query(query, [vacante_id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error al obtener formularios' });
    } else {
      res.json(results); // Enviar los resultados como respuesta
    }
  });
});

module.exports = router;
