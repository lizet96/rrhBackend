// routes/vacanteRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../db'); // Importa la conexión a la base de datos

// Endpoint para agregar una nueva vacante
router.post('/', (req, res) => {
  console.log('Datos recibidos para vacante:', req.body);
  const {
    vac_nombre,
    vac_descripcion,
    fecha_inicio,
    fecha_fin,
    sueldoMensual,
    id_empresa,
    id_categoria,
  } = req.body;

  const sql = `
    INSERT INTO vacante (
      vac_nombre, vac_descripcion, fecha_inicio, fecha_fin, 
      sueldoMensual, id_empresa, id_categoria
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(
    sql,
    [vac_nombre, vac_descripcion, fecha_inicio, fecha_fin, sueldoMensual, id_empresa, id_categoria],
    (err, result) => {
      if (err) {
        console.error('Error al guardar la vacante:', err);
        return res.status(500).json({ message: 'Error al guardar la vacante', error: err });
      }
      
      // Devolver el ID de la vacante recién creada
      const id_vacante = result.insertId;

      res.status(201).json({
        message: 'Vacante creada correctamente',
        id_vacante: id_vacante,
      });
    }
  );
});

module.exports = router;
