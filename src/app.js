const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rutas de prueba
app.get('/test', (req, res) => {
  res.json({ mensaje: 'El servidor funciona', success: true });
});

// Rutas API
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Servidor funcionando' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada: ' + req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ success: false, message: 'Error interno' });
});

module.exports = app;
