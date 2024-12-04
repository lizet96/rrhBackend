require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protectedRoutes');
const vacanteRoutes = require('./routes/vacanteRoutes');
const vacanteHabilidadRoutes = require('./routes/vacanteHabilidadRoutes');
const profileRoutes = require('./routes/profileRoutes');
const formularios = require("./routes/formularios");
const preguntas = require("./routes/preguntas");
const respuestasRoutes = require('./routes/respuestas');
const resultadosRoutes = require('./routes/resultadosRoutes');
const postulante = require ('./routes/Postulantes.js')
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Importa la conexión de la base de datos desde db.js
const db = require('./db'); // Aquí importamos la conexión a la base de datos

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*', // Permite conexiones desde el frontend desplegado
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Agrega más métodos si son necesarios
    allowedHeaders: ['Content-Type', 'Authorization'], // Asegúrate de incluir Authorization si usas JWT
  })
);

app.use(bodyParser.json());

// Conectar a la base de datos (esto ya está configurado en db.js, no es necesario volver a hacerlo)
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1); // Termina la aplicación si no puede conectarse
  }
  console.log('Conexión exitosa a la base de datos');
  connection.release();
});

// Rutas
app.get('/api/empresas', (req, res) => {
  const query = 'SELECT id_empresa, emp_nombre FROM empresas';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error al obtener las empresas:', err);
      return res.status(500).send('Error al obtener las empresas');
    }
    res.json(result);
  });
});

app.get('/api/categorias', (req, res) => {
  const query = 'SELECT id_categoria, cat_nombre FROM categoriavacante';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error al obtener las categorías:', err);
      return res.status(500).send('Error al obtener las categorías');
    }
    res.json(result);
  });
});

// Controlador para obtener todas las vacantes
app.get('/api/vacantes', (req, res) => {
  const query = 'SELECT id_vacante, vac_nombre, vac_descripcion, fecha_inicio, fecha_fin, sueldoMensual FROM vacante'; // Modifica según las columnas de tu tabla vacante
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error al obtener las vacantes:', err);
      return res.status(500).send('Error al obtener las vacantes');
    }
    res.json(result);  // Devuelve los resultados como JSON
  });
});

app.get('/api/habilidades', (req, res) => {
  const query = 'SELECT id_habilidad, hab_nombre FROM habilidad';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error al obtener las habilidades:', err);
      return res.status(500).send('Error al obtener las habilidades');
    }
    res.json(result);
  });
});

// Montar las rutas
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/vacante', vacanteRoutes);
app.use('/api/vacantehabilidad', vacanteHabilidadRoutes);
app.use('/api/profile', profileRoutes);
app.use("/api", formularios); // Agrega las rutas de formularios
app.use("/api", preguntas); // Agrega las rutas de formularios
app.use('/api', respuestasRoutes);
app.use(resultadosRoutes);
app.use('/api', postulante)
// Rutas estáticas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT} or ${process.env.RENDER_EXTERNAL_URL}`);

});