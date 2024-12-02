const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const nodemailer = require('nodemailer');
require('dotenv').config();  
const USER_TYPES = {
  ADMIN: 'admin',
  CLIENT: 'cliente',
};

// Configuración del transportador de Nodemailer con las credenciales de HostGator
const transporter = nodemailer.createTransport({
  host: 'smtp.titan.email',  // Servidor alternativo de HostGator
  port: 465,  // O 587 si prefieres STARTTLS
  secure: true,  // Usar SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Función para enviar el correo de verificación
const sendVerificationEmail = async (email, verificationToken) => {
  const url = `https://rrhbackend.onrender.com/api/auth/verify-email?token=${verificationToken}`;
  // Enviar el correo
  await transporter.sendMail({
    from: process.env.EMAIL_USER, // Usar la variable de entorno para el correo
    to: email, 
    subject: 'Verifica tu correo', 
    html: `<p>Haz clic en el siguiente enlace para verificar tu cuenta: <a href="${url}">Verificar correo</a></p>`,
  });
};
const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

const registerUser = async (req, res) => {
  const { name, email, password, fechaNacimiento, telefono } = req.body;

  if (!name || !email || !password || !fechaNacimiento || !telefono) {
    return res.status(400).json({ status: 'error', message: "Datos inválidos" });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      status: 'error',
      message: "La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un carácter especial."
    });
  }

  const connection = await db.promise().getConnection();
  try {
    const [existingUser] = await connection.execute('SELECT * FROM usuario WHERE us_correo = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ status: 'error', message: 'El correo electrónico ya está registrado, intente con otro' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.beginTransaction();
    try {
      const [userResult] = await connection.execute(
        'INSERT INTO usuario (us_nombre, us_correo, us_contrasena, rol) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, USER_TYPES.CLIENT]
      );

      const userId = userResult.insertId;
      console.log(userId);

      await connection.execute(
        'INSERT INTO candidatos (fechaNacimiento, telefono, id_usuario) VALUES (?, ?, ?)',
        [fechaNacimiento, telefono, userId]
      );

      const verificationToken = jwt.sign({ id_usuario: userId, role: USER_TYPES.CLIENT }, process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log(verificationToken, "Verification code access ok")
      // Actualizar el campo 'us_codigo_verificacion' con el token de verificación
      await connection.execute('UPDATE usuario SET us_codigo_verificacion = ? WHERE id_usuario = ?', [verificationToken, userId]);

      await sendVerificationEmail(email, verificationToken);
      console.log(sendVerificationEmail, "Servicio de send email verificatrion correcto")

      await connection.commit();
      res.status(201).json({ status: 'success', message: "Usuario registrado correctamente. Revisa tu correo para verificar tu cuenta." });
    } catch (error) {
      await connection.rollback();
      console.error("Error durante la transacción:", error);
      res.status(500).json({ status: 'error', message: "Error en la transacción", details: error.message });
    }
  } catch (error) {
    console.error("Error al verificar correo:", error);
    res.status(500).json({ status: 'error', message: "Error al verificar el correo", details: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// Verificar el correo
const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Token no proporcionado" });
  }

  const connection = await db.promise().getConnection();
  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Decodificar y verificar el token
    const userId = decoded.id_usuario;

    // Buscar el usuario con el id decodificado
    const [user] = await connection.execute('SELECT * FROM usuario WHERE id_usuario = ?', [userId]);

    if (user.length === 0) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    // Actualizar el estado de verificación del usuario
    await connection.execute('UPDATE usuario SET us_verificado = 1 WHERE id_usuario = ?', [userId]);

    res.status(200).json({ message: "Correo verificado correctamente. Ahora puedes iniciar sesión." });
  } catch (error) {
    console.error("Error al verificar correo:", error);
    res.status(500).json({ error: "Error al verificar el correo", details: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// Iniciar sesión
const loginUser = async (req, res) => {
  const { correo, password } = req.body;

  db.query('SELECT * FROM usuario WHERE us_correo = ?', [correo], async (error, results) => {
    if (error) {
      console.error("Error al buscar usuario:", error);
      return res.status(500).json({ error: "Error al buscar usuario" });
    }

    if (results.length === 0) {
      console.log("No se encontraron usuarios con este correo");
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const user = results[0];

    // Verificar si el correo está verificado
    if (!user.us_verificado) {
      return res.status(401).json({ error: "Por favor verifica tu correo electrónico antes de iniciar sesión." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.us_contrasena);

    if (!isPasswordValid) {
      console.log("Contraseña no válida");
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = jwt.sign({ id_usuario: user.id_usuario, role: user.rol }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: "Inicio de sesión exitoso", token });
  });
};

module.exports = { registerUser, loginUser, verifyEmail };
