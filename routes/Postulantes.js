const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const  { getVacantesEmpresa, getPostulantes } = require('../controllers/postulantesController');

router.get('/api/VacanteEmpresa', getVacantesEmpresa);
router.get('/api/Postulantes', getPostulantes);


module.exports = router;