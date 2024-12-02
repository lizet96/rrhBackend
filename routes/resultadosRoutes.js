// routes/resultadosRoutes.js

const express = require('express');
const router = express.Router();
const resultadosController = require('../controllers/resultadosController');

// Ruta para obtener los resultados del formulario
router.get('/api/resultados', resultadosController.getResultados);

module.exports = router;
