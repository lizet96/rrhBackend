const express = require('express');
const { updateProfile, getUserProfile, updateProfileInfo, updatePassword } = require('../controllers/profileController');
const { verifyToken } = require('../middlewares/authMiddleware');
const multer = require('multer');

const router = express.Router();

// Configuración de multer para la subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Destino de subida configurado:', 'uploads/');
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    console.log('Nombre del archivo configurado:', filename);
    cb(null, filename);
  }
});
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Validación de tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      console.log('Tipo de archivo no permitido:', file.mimetype);
      return cb(new Error('Solo se permiten archivos JPG, JPEG y PNG.'));
    }
    cb(null, true);
  }
});

// Validadores para las entradas
const validateUpdateInfo = (req, res, next) => {
  const { name, email } = req.body;
  if (!name || !email) {
    console.log('Validación fallida: Falta nombre o email');
    return res.status(400).json({ error: 'Nombre y email son requeridos.' });
  }
  console.log('Validación exitosa: Datos de actualización recibidos', { name, email });
  next();
};

const validatePasswordUpdate = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword || newPassword.length < 6) {
    console.log('Validación fallida: Contraseña inválida');
    return res.status(400).json({ error: 'Se requiere contraseña antigua y nueva con al menos 6 caracteres.' });
  }
  console.log('Validación exitosa: Contraseña válida');
  next();
};

// Ruta para obtener el perfil del usuario
router.get('/get-profile', verifyToken, (req, res, next) => {
  console.log('Solicitud para obtener el perfil del usuario');
  next();
}, getUserProfile);

// Ruta para actualizar la imagen de perfil
router.put('/update-profile', verifyToken, upload.single('us_foto'), (req, res, next) => {
  console.log('Solicitud para actualizar la imagen de perfil');
  console.log('Archivo recibido:', req.file ? req.file.filename : 'No se recibió archivo');
  next();
}, updateProfile);

// Ruta para actualizar la información del postulante
router.put('/update-info', verifyToken, validateUpdateInfo, (req, res, next) => {
  console.log('Solicitud para actualizar la información del perfil:', req.body);
  next();
}, updateProfileInfo);

// Ruta para actualizar la contraseña
router.put('/update-password', verifyToken, validatePasswordUpdate, (req, res, next) => {
  console.log('Solicitud para actualizar la contraseña');
  next();
}, updatePassword);

module.exports = router;
