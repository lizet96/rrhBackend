const express = require('express');
const router = express.Router();
const postulanteController = require('../controllers/postulanteController');

router.get('/api/VacanteEmpresa', postulanteController.getVacantesEmpresa);
router.get('/api/Postulantes', postulanteController.getPostulantes);

module.exports = router;