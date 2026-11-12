require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');

async function seed() {
  await connectDB();

  const force = process.argv.includes('--force') || process.argv.includes('--reset');
  const hasAdmin = await User.exists({ email: 'admin@odontocheck.com' });
  const hasServices = (await Service.countDocuments()) > 0;

  if (hasAdmin && hasServices && !force) {
    console.log('Seed já aplicado. Use --force para recriar.');
    await mongoose.disconnect();
    return;
  }

  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    Service.deleteMany({}),
    Appointment.deleteMany({}),
  ]);

  await User.create([
    {
      name: 'Dr. Roberto Silveira',
      email: 'admin@odontocheck.com',
      password: 'admin123',
      role: 'admin',
      phone: '(95) 99112-3400',
    },
    {
      name: 'Carlos Eduardo Silva',
      email: 'paciente@odontocheck.com',
      password: 'paciente123',
      role: 'paciente',
      phone: '(95) 99123-4567',
    },
  ]);

  const services = await Service.insertMany([
    {
      name: 'Avaliação Odontológica Geral',
      category: 'Avaliação',
      description: 'Check-up clínico completo e plano de tratamento.',
      durationMinutes: 30,
      price: 120,
    },
    {
      name: 'Limpeza e Profilaxia',
      category: 'Prevenção',
      description: 'Remoção de tártaro com ultrassom, jato de bicarbonato e aplicação de flúor.',
      durationMinutes: 45,
      price: 180,
    },
    {
      name: 'Clareamento Dental a Laser',
      category: 'Estética',
      description: 'Sessão de clareamento em consultório com gel dessensibilizante.',
      durationMinutes: 60,
      price: 650,
    },
    {
      name: 'Manutenção Ortodôntica',
      category: 'Ortodontia',
      description: 'Ajuste mensal de aparelho fixo ou alinhadores transparentes.',
      durationMinutes: 30,
      price: 160,
    },
    {
      name: 'Tratamento de Canal (Endodontia)',
      category: 'Endodontia',
      description: 'Descontaminação e obturação mecanizada dos canais radiculares.',
      durationMinutes: 60,
      price: 780,
    },
    {
      name: 'Implante Dentário Unitário',
      category: 'Implantes',
      description: 'Instalação cirúrgica de pino de titânio com guia digital.',
      durationMinutes: 90,
      price: 1850,
    },
  ]);

  const patients = await Patient.insertMany([
    {
      name: 'Carlos Eduardo Silva',
      cpf: '412.890.123-44',
      phone: '(95) 99123-4567',
      email: 'paciente@odontocheck.com',
      birthDate: new Date('1992-05-14'),
      healthInsurance: 'Uniodonto',
      notes: 'Revisão semestral.',
    },
    {
      name: 'Fernanda Oliveira Lima',
      cpf: '528.341.902-10',
      phone: '(95) 98114-2290',
      email: 'fernanda.lima@email.com',
      birthDate: new Date('1988-11-23'),
      healthInsurance: 'Particular',
      notes: 'Sensibilidade a bebidas geladas.',
    },
    {
      name: 'Gabriel Souza Nascimento',
      cpf: '701.239.845-09',
      phone: '(95) 99145-8821',
      email: 'gabriel.souza@email.com',
      birthDate: new Date('1999-02-08'),
      healthInsurance: 'Bradesco Dental',
      notes: 'Acompanhamento de aparelho ortodôntico.',
    },
    {
      name: 'Juliana Martins Rocha',
      cpf: '319.402.771-62',
      phone: '(95) 99177-3012',
      email: 'juliana.rocha@email.com',
      birthDate: new Date('1985-08-30'),
      healthInsurance: 'Amil Dental',
      notes: '',
    },
  ]);

  const today = new Date().toISOString().slice(0, 10);

  await Appointment.insertMany([
    {
      patient: patients[0]._id,
      service: services[1]._id,
      dentistName: 'Dr. Roberto Silveira',
      date: today,
      timeSlot: '09:00',
      status: 'confirmado',
      notes: 'Profilaxia semestral.',
    },
    {
      patient: patients[1]._id,
      service: services[0]._id,
      dentistName: 'Dr. Roberto Silveira',
      date: today,
      timeSlot: '10:00',
      status: 'agendado',
      notes: 'Primeira avaliação.',
    },
    {
      patient: patients[2]._id,
      service: services[3]._id,
      dentistName: 'Dra. Mariana Costa',
      date: today,
      timeSlot: '14:00',
      status: 'confirmado',
      notes: 'Manutenção mensal.',
    },
    {
      patient: patients[3]._id,
      service: services[2]._id,
      dentistName: 'Dra. Mariana Costa',
      date: today,
      timeSlot: '16:00',
      status: 'concluido',
      notes: 'Primeira sessão realizada.',
    },
  ]);

  console.log('Seed concluído com sucesso.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Erro no seed:', err.message);
  process.exit(1);
});
