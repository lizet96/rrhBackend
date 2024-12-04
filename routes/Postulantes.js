const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const  { getVacantesEmpresa, getPostulantes } = require('../controllers/postulantesController');

router.get('/api/VacanteEmpresa', verifyToken,  getVacantesEmpresa);
router.get('/api/Postulantes', verifyToken, getPostulantes);

module.exports = router;