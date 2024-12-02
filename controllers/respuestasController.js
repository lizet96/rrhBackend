const db = require('../db'); // Asegúrate de importar la conexión a la base de datos

const guardarRespuestas = (req, res) => {
  const { id_formulario, respuestas } = req.body;

  if (!id_formulario || !Array.isArray(respuestas) || respuestas.length === 0) {
    return res.status(400).json({ message: 'Faltan datos o respuestas' });
  }

  // Itera sobre las respuestas y guarda cada una en la base de datos
  respuestas.forEach((respuesta) => {
    const { id_pregunta, id_respuesta } = respuesta;
    
    const query = 'INSERT INTO respuestas_usuario (id_formulario, id_pregunta, id_respuesta) VALUES (?, ?, ?)';
    
    db.query(query, [id_formulario, id_pregunta, id_respuesta], (err, result) => {
      if (err) {
        console.error('Error al guardar la respuesta:', err);
        return res.status(500).json({ message: 'Error al guardar las respuestas' });
      }
    });
  });

  res.status(200).json({ message: 'Respuestas guardadas con éxito' });
};

module.exports = { guardarRespuestas };
