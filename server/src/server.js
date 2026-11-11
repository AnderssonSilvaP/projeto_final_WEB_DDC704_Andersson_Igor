const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Carregar variáveis de ambiente
dotenv.config();

// Conectar ao banco de dados MongoDB
connectDB();

const app = express();

// Middlewares essenciais
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rota de Healthcheck e Boas-Vindas
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'OdontoChess API',
    theme: 'Odontologia de Alta Performance - Chess.com Design',
    timestamp: new Date().toISOString(),
  });
});

// Montagem das Rotas da API MVC
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

// Middleware de tratamento de erros
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n♟️ ========================================================`);
  console.log(`🦷 OdontoChess API rodando na porta ${PORT}`);
  console.log(`📡 URL Base: http://localhost:${PORT}/api`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`♟️ ========================================================\n`);
});

// Tratamento para unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Erro não tratado: ${err.message}`);
  // server.close(() => process.exit(1));
});

module.exports = app;
