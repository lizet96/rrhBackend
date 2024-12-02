// routes/vacanteHabilidadRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../db'); // Importa la conexión a la base de datos

// Endpoint para asociar una habilidad a una vacante
router.post('/', (req, res) => {
    console.log('Datos recibidos para vacantehabilidad:', req.body);
  const { id_vacante, id_habilidad } = req.body;

  // Validación básica
  if (!id_vacante || !id_habilidad) {
    return res.status(400).json({ error: 'ID de vacante y habilidad son obligatorios' });
  }

  const query = 'INSERT INTO vacantehabilidad (id_vacante, id_habilidad) VALUES (?, ?)';

  db.query(query, [id_vacante, id_habilidad], (err) => {
    if (err) {
      console.error('Error al asociar habilidad:', err);
      return res.status(500).json({ error: 'Error al asociar habilidad' });
    }

    res.status(201).json({ message: 'Habilidad asociada correctamente' });
  });
});

module.exports = router;
