require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');

async function seed() {
  await connectDB();

  const force =
    process.argv.includes('--force') ||
    process.argv.includes('--reset') ||
    process.env.FORCE_SEED === 'true';
  const hasAdmin = await User.exists({ email: 'admin@odontocheck.com' });
  const hasMedico = await User.exists({ email: 'medico@odontocheck.com' });
  const hasServices = (await Service.countDocuments()) > 0;

  if (hasAdmin && hasMedico && hasServices && !force) {
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

  const users = await User.create([
    {
      name: 'Helena Vasconcelos',
      email: 'admin@odontocheck.com',
      password: 'admin123',
      role: 'admin',
      phone: '(95) 99110-1000',
    },
    {
      name: 'Dr. Roberto Silveira',
      email: 'medico@odontocheck.com',
      password: 'medico123',
      role: 'medico',
      phone: '(95) 99112-3400',
      specialty: 'Implantodontia e Clínica Geral',
      cro: 'CRO-RR 1420',
    },
    {
      name: 'Dra. Mariana Costa',
      email: 'mariana@odontocheck.com',
      password: 'medico123',
      role: 'medico',
      phone: '(95) 99115-8800',
      specialty: 'Ortodontia e Estética',
      cro: 'CRO-RR 1895',
    },
    {
      name: 'Dr. Carlos Fontes',
      email: 'carlos@odontocheck.com',
      password: 'medico123',
      role: 'medico',
      phone: '(95) 99118-4200',
      specialty: 'Endodontia e Cirurgia',
      cro: 'CRO-RR 2110',
    },
    {
      name: 'Carlos Eduardo Silva',
      email: 'paciente@odontocheck.com',
      password: 'paciente123',
      role: 'paciente',
      phone: '(95) 99123-4567',
    },
  ]);

  const pacienteUser = users.find((u) => u.email === 'paciente@odontocheck.com');

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
      user: pacienteUser._id,
      name: 'Carlos Eduardo Silva',
      cpf: '412.890.123-44',
      phone: '(95) 99123-4567',
      emergencyContact: '(95) 99110-9988',
      email: 'paciente@odontocheck.com',
      birthDate: new Date('1992-05-14'),
      gender: 'Masculino',
      cep: '69301-000',
      address: 'Av. Ville Roy, 1420 - Centro',
      city: 'Boa Vista',
      state: 'RR',
      healthInsurance: 'Uniodonto',
      insuranceNumber: '4589 1023 8841 0012',
      allergies: 'Dipirona sódica',
      notes: 'Paciente em acompanhamento semestral de profilaxia. Boa higiene bucal.',
    },
    {
      name: 'Fernanda Oliveira Lima',
      cpf: '528.341.902-10',
      phone: '(95) 98114-2290',
      email: 'fernanda.lima@email.com',
      birthDate: new Date('1988-11-23'),
      healthInsurance: 'Particular',
      allergies: 'Nenhuma alergia relatada',
      notes: 'Sensibilidade dentinária em pré-molares superiores.',
    },
    {
      name: 'Gabriel Souza Nascimento',
      cpf: '701.239.845-09',
      phone: '(95) 99145-8821',
      email: 'gabriel.souza@email.com',
      birthDate: new Date('1999-02-08'),
      healthInsurance: 'Bradesco Dental',
      allergies: 'Látex (usar luvas nitrílicas)',
      notes: 'Acompanhamento de aparelho ortodôntico autoligado.',
    },
    {
      name: 'Juliana Martins Rocha',
      cpf: '319.402.771-62',
      phone: '(95) 99177-3012',
      email: 'juliana.rocha@email.com',
      birthDate: new Date('1985-08-30'),
      healthInsurance: 'Amil Dental',
      allergies: 'Penicilina / Amoxicilina',
      notes: 'Histórico de clareamento dental realizado sem intercorrências.',
    },
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const pastDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  await Appointment.insertMany([
    {
      patient: patients[0]._id,
      service: services[0]._id,
      dentistName: 'Dr. Roberto Silveira',
      date: pastDate,
      timeSlot: '08:00',
      status: 'concluido',
      notes: 'Check-up inicial.',
      clinicalNotes: 'Exame clínico e radiográfico periapical sem cáries ativas. Leve cálculo supragengival em incisivos inferiores.',
      recommendations: 'Utilizar escova de cerdas macias, fio dental diariamente e retornar para profilaxia com ultrassom.',
    },
    {
      patient: patients[0]._id,
      service: services[1]._id,
      dentistName: 'Dr. Roberto Silveira',
      date: today,
      timeSlot: '09:00',
      status: 'confirmado',
      notes: 'Profilaxia semestral.',
      clinicalNotes: '',
      recommendations: '',
    },
    {
      patient: patients[1]._id,
      service: services[0]._id,
      dentistName: 'Dr. Roberto Silveira',
      date: today,
      timeSlot: '10:00',
      status: 'agendado',
      notes: 'Primeira avaliação e queixa de sensibilidade.',
      clinicalNotes: '',
      recommendations: '',
    },
    {
      patient: patients[2]._id,
      service: services[3]._id,
      dentistName: 'Dra. Mariana Costa',
      date: today,
      timeSlot: '14:00',
      status: 'confirmado',
      notes: 'Manutenção mensal.',
      clinicalNotes: '',
      recommendations: '',
    },
    {
      patient: patients[3]._id,
      service: services[2]._id,
      dentistName: 'Dra. Mariana Costa',
      date: today,
      timeSlot: '16:00',
      status: 'concluido',
      notes: 'Primeira sessão realizada.',
      clinicalNotes: 'Aplicação de barreira gengival fotopolimerizável e 2 sessões de 15 min de peróxido de hidrogênio 35%.',
      recommendations: 'Evitar alimentos e bebidas com corantes fortes (café, vinho, açaí) pelas próximas 48 horas. Usar creme dental dessensibilizante.',
    },
  ]);

  console.log('Seed concluído com sucesso.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Erro no seed:', err.message);
  process.exit(1);
});
