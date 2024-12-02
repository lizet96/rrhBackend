const db = require('../db');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

// Función para actualizar el perfil del usuario, incluyendo la imagen
const updateProfile = async (req, res) => {
  const id_usuario = req.body.id_usuario;  // se obtiene el id
  const profileImage = req.file;    // Aquí se está obteniendo la imagen del archivo subido

  console.log("Datos recibidos del frontend:", req.body);

  // Valida si los parámetros esenciales existen
  if (!id_usuario || !profileImage) {
    console.error("Faltan parámetros necesarios: id_usuario o profileImage");
    return res.status(400).json({ error: 'Faltan parámetros necesarios (id_usuario o profileImage)' });
  }

  console.log("Parametros para la consulta SQL:", { id_usuario, profileImage });

  try {
    // Aquí ejecutamos la consulta para actualizar el perfil
    const result = await db.execute(
      'UPDATE usuario SET us_foto = ? WHERE id_usuario = ?',
      [profileImage.path, id_usuario]  // Usamos profileImage.path ya que es un objeto de archivo, no solo la imagen
    );
    console.log("Resultado de la consulta:", result);

    res.status(200).json({ message: 'Perfil actualizado correctamente' });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};

const updateProfileInfo = async (req, res) => {
  const { id_usuario, us_nombre, us_apellido, us_correo, telefono } = req.body;

  // Valida si los parámetros esenciales existen
  if (!id_usuario || !us_nombre || !us_apellido || !us_correo) {
    return res.status(400).json({ error: 'Faltan parámetros necesarios' });
  }

  try {
    // Ejecuta la consulta para actualizar los datos de perfil
    const [result] = await db.promise().execute(
      'UPDATE usuario SET us_nombre = ?, us_apellido = ?, us_correo = ? WHERE id_usuario = ?',
      [us_nombre, us_apellido, us_correo, id_usuario]
    );

    // Si el usuario también es candidato, actualizamos el teléfono en la tabla de candidatos
    if (telefono) {
      await db.promise().execute(
        'UPDATE candidatos SET telefono = ? WHERE id_usuario = ?',
        [telefono, id_usuario]
      );
    }

    res.status(200).json({ message: 'Perfil actualizado correctamente' });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Función para obtener la información del perfil del usuario
const getUserProfile = async (req, res) => {
  const id_usuario = req.user.id_usuario;  // Se obtiene el id del usuario desde el JWT (token)

  try {
    // Realiza una consulta JOIN entre las tablas `usuario` y `candidato`
    const [rows] = await db.promise().query(
      `SELECT u.us_nombre, u.us_apellido, u.us_correo, u.us_foto, c.telefono
       FROM usuario AS u
       LEFT JOIN candidatos AS c ON u.id_usuario = c.id_usuario
       WHERE u.id_usuario = ?`,
      [id_usuario]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    
    // Extrae los datos del usuario y la imagen
    const user = rows[0];
    const profileImageUrl = user.us_foto ? `http://localhost:5000/uploads/${path.basename(user.us_foto)}` : null;

    // Devolvemos la información del perfil junto con el teléfono del candidato
    res.status(200).json({
      us_nombre: user.us_nombre,
      us_apellido: user.us_apellido,
      us_correo: user.us_correo,
      us_foto: profileImageUrl,  // Aquí devolvemos la URL de la imagen
      telefono: user.telefono    // Incluye el teléfono del candidato
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
};

const updatePassword = async (req, res) => {
  const { id_usuario, contrasena_actual, nueva_contrasena, confirmacion_contrasena } = req.body;

  // Valida si todos los parámetros necesarios están presentes
  if (!id_usuario || !contrasena_actual || !nueva_contrasena || !confirmacion_contrasena) {
    return res.status(400).json({ error: 'Faltan parámetros necesarios' });
  }

  // Verifica que la nueva contraseña coincida con la confirmación
  if (nueva_contrasena !== confirmacion_contrasena) {
    return res.status(400).json({ error: 'Las contraseñas no coinciden' });
  }

  try {
    // Consulta la contraseña actual del usuario desde la base de datos
    const [rows] = await db.promise().query('SELECT us_contrasena FROM usuario WHERE id_usuario = ?', [id_usuario]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const storedPassword = rows[0].us_contrasena;

    // Verifica si la contraseña actual ingresada coincide con la almacenada
    const isMatch = await bcrypt.compare(contrasena_actual, storedPassword);

    if (!isMatch) {
      return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
    }

    // Encripta la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nueva_contrasena, salt);

    // Actualiza la contraseña en la base de datos
    await db.promise().execute('UPDATE usuario SET us_contrasena = ? WHERE id_usuario = ?', [hashedPassword, id_usuario]);

    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { updateProfile, getUserProfile, updateProfileInfo, updatePassword };
