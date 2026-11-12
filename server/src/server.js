require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'online' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

const publicDir = path.join(__dirname, '..', 'public');
const clientDistDir = path.join(__dirname, '..', '..', 'client', 'dist');
const staticDir = fs.existsSync(path.join(publicDir, 'index.html'))
  ? publicDir
  : fs.existsSync(path.join(clientDistDir, 'index.html'))
    ? clientDistDir
    : null;

if (staticDir) {
  app.use(express.static(staticDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

app.use((req, res) => res.status(404).json({ success: false, message: 'Rota não encontrada.' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => app.listen(PORT, () => console.log(`API em http://localhost:${PORT}/api`)))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });

module.exports = app;
