const db = require('../db'); // Asegúrate de que esta conexión está configurada

const getCategorias = async (req, res) => {
  try {
    const [categorias] = await db.promise().query('SELECT id_categoria, cat_nombre FROM categoriavacante');
    res.status(200).json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ message: 'Error al obtener las categorías', error: error.message });
  }
};

module.exports = { getCategorias };

// Controlador para obtener todas las vacantes
exports.getAllVacantes = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM vacante"); // Consulta la tabla vacante
    res.status(200).json(rows); // Devuelve los resultados como JSON
  } catch (error) {
    console.error("Error al obtener vacantes:", error);
    res.status(500).json({ message: "Error al obtener las vacantes" });
  }
};
