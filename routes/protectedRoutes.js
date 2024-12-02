const express = require('express');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const USER_TYPES = require('../config/userTypes');
const db = require('../db'); // Conexión a la base de datos

const router = express.Router();


router.get('/admin-area', verifyToken, requireRole(USER_TYPES.ADMIN), (req, res) => {
  res.json({ message: "Bienvenido al área de administración" });
});

router.get('/client-area', verifyToken, requireRole(USER_TYPES.CLIENT), (req, res) => {
  res.json({ message: "Bienvenido al área de clientes" });
});  

/* router.post('/vacante', (req, res) => {
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
    [
      vac_nombre,
      vac_descripcion,
      fecha_inicio,
      fecha_fin,
      sueldoMensual,
      id_empresa || null,
      id_categoria || null,
    ],
    (err, result) => {
      if (err) {
        console.error('Error al guardar la vacante:', err);
        return res.status(500).json({ message: 'Error al guardar la vacante' });
      }
      res.status(201).json({ message: 'Vacante guardada con éxito' });
    }
  );
}); */

module.exports = router;
