const express = require('express');
const { updateProfile, getUserProfile, updateProfileInfo, updatePassword  } = require('../controllers/profileController');
const { verifyToken } = require('../middlewares/authMiddleware');
const multer = require('multer');

const router = express.Router();

// Configuración de multer para la subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Ruta para obtener el perfil del usuario
router.get('/get-profile', verifyToken, getUserProfile);

// Ruta para actualizar la imagen de perfil
router.put('/update-profile', verifyToken, upload.single('us_foto'), updateProfile);
// Ruta para actualizar la información del postulante
router.put('/update-info', verifyToken, updateProfileInfo);
// Ruta para actualizar la contraseña
router.put('/update-password', updatePassword, verifyToken);
module.exports = router;
