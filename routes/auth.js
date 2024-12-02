const express = require('express');
const { registerUser, loginUser,verifyEmail  } = require('../controllers/authController');

const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post('/register', registerUser);

// Ruta para iniciar sesión
router.post('/login', loginUser);

// Ruta para verificar el correo electrónico
router.get('/verify-email', verifyEmail);

module.exports = router;
