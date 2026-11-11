require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'online' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/odontogram', require('./routes/odontogramRoutes'));
app.use('/api/medical-records', require('./routes/medicalRecordRoutes'));
app.use('/api/treatment-plans', require('./routes/treatmentPlanRoutes'));
app.use('/api/financial', require('./routes/financialRoutes'));
app.use('/api/supplies', require('./routes/supplyRoutes'));
app.use('/api/lab-orders', require('./routes/labOrderRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

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
