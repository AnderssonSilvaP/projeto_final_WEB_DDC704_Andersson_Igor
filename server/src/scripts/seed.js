const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Odontogram = require('../models/Odontogram');
const MedicalRecord = require('../models/MedicalRecord');
const TreatmentPlan = require('../models/TreatmentPlan');
const FinancialTransaction = require('../models/FinancialTransaction');
const Supply = require('../models/Supply');
const LabOrder = require('../models/LabOrder');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/odontochess';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🦷 [Seed] Conectado ao MongoDB. Limpando dados anteriores...');

    // Limpar coleções
    await User.deleteMany();
    await Patient.deleteMany();
    await Appointment.deleteMany();
    await Odontogram.deleteMany();
    await MedicalRecord.deleteMany();
    await TreatmentPlan.deleteMany();
    await FinancialTransaction.deleteMany();
    await Supply.deleteMany();
    await LabOrder.deleteMany();

    console.log('🦷 [Seed] Criando profissionais da equipe odontológica...');

    // 1. Criar Usuários com nomes profissionais reais
    const admin = await User.create({
      name: 'Dr. Roberto Silveira',
      email: 'admin@odontochess.com',
      password: 'admin123',
      role: 'admin',
      cro: 'CRO-RR 4521',
      specialty: 'Implantodontia & Reabilitação Oral',
      phone: '(95) 99123-4567',
      rating: 98, // Score de Desempenho Clínico
      chessTitle: 'DIRETOR',
      commissionRate: 60,
    });

    const dentista = await User.create({
      name: 'Dra. Mariana Costa',
      email: 'dentista@odontochess.com',
      password: 'dentista123',
      role: 'dentista',
      cro: 'CRO-RR 5892',
      specialty: 'Ortodontia & Harmonização Facial',
      phone: '(95) 98412-7890',
      rating: 95,
      chessTitle: 'ESPECIALISTA',
      commissionRate: 50,
    });

    const recepcao = await User.create({
      name: 'Camila Alencar',
      email: 'recepcao@odontochess.com',
      password: 'recepcao123',
      role: 'recepcao',
      phone: '(95) 98100-3344',
      rating: 92,
      chessTitle: 'RECEPÇÃO',
      specialty: 'Coordenação e Atendimento ao Paciente',
    });

    const pacienteUser = await User.create({
      name: 'Carlos Eduardo Silva',
      email: 'paciente@odontochess.com',
      password: 'paciente123',
      role: 'paciente',
      phone: '(95) 99234-8899',
      rating: 85,
      chessTitle: 'PACIENTE',
      specialty: 'Paciente Cadastrado',
    });

    console.log('🦷 [Seed] Criando pacientes da clínica...');

    // 2. Criar Pacientes
    const patient1 = await Patient.create({
      name: 'Carlos Eduardo Silva',
      cpf: '012.345.678-90',
      rg: '345678 SSP-RR',
      birthDate: new Date('1994-05-18'),
      gender: 'M',
      phone: '(95) 99234-8899',
      email: 'paciente@odontochess.com',
      address: {
        street: 'Avenida Capitão Ene Garcez',
        number: '1420',
        neighborhood: 'Aeroporto',
        city: 'Boa Vista',
        state: 'RR',
        zip: '69300-000',
      },
      healthInsurance: {
        planName: 'Particular',
        cardNumber: 'PART-2026',
      },
      emergencyContact: {
        name: 'Juliana Silva',
        phone: '(95) 99888-1122',
        relationship: 'Esposa',
      },
      bloodType: 'O+',
      allergies: ['Penicilina'],
      chronicConditions: ['Hipertensão Leve'],
      eloScore: 92,
      chessRank: 'Adesão Excelente',
      notes: 'Paciente relata sensibilidade no quadrante superior direito.',
      lastVisit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      nextRecallDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
    });

    const patient2 = await Patient.create({
      name: 'Larissa Montenegro',
      cpf: '234.567.890-12',
      birthDate: new Date('1998-11-24'),
      gender: 'F',
      phone: '(95) 98112-9988',
      email: 'larissa.montenegro@email.com',
      address: {
        street: 'Rua Alfredo Cruz',
        number: '480',
        neighborhood: 'Centro',
        city: 'Boa Vista',
        state: 'RR',
      },
      healthInsurance: {
        planName: 'Uniodonto',
        cardNumber: 'UNI-884920',
      },
      bloodType: 'A+',
      allergies: [],
      chronicConditions: [],
      eloScore: 96,
      chessRank: 'Adesão Excelente',
      notes: 'Tratamento ortodôntico com alinhadores estéticos em andamento.',
    });

    const patient3 = await Patient.create({
      name: 'Lucas Vasconcelos',
      cpf: '345.678.901-23',
      birthDate: new Date('1986-07-10'),
      gender: 'M',
      phone: '(95) 99188-7766',
      email: 'lucas.vasconcelos@email.com',
      healthInsurance: { planName: 'Bradesco Dental', cardNumber: 'BRAD-47291' },
      bloodType: 'B+',
      allergies: ['Dipirona', 'Látex'],
      chronicConditions: ['Diabetes Tipo 2'],
      eloScore: 78,
      chessRank: 'Adesão Regular',
      notes: 'Diabético controlado. Utilizar anestésico sem vasoconstritor se necessário.',
    });

    const patient4 = await Patient.create({
      name: 'Beatriz Mendes',
      cpf: '456.789.012-34',
      birthDate: new Date('1997-02-27'),
      gender: 'F',
      phone: '(95) 98455-6677',
      email: 'beatriz.mendes@email.com',
      healthInsurance: { planName: 'Particular' },
      bloodType: 'AB+',
      eloScore: 98,
      chessRank: 'Adesão Exemplar',
      notes: 'Realizou profilaxia e clareamento dental. Retorno semestral programado.',
    });

    console.log('🦷 [Seed] Criando Odontogramas...');

    // 3. Criar Odontograma de Carlos Eduardo Silva
    const adultTeeth1 = [];
    const quadrants = [
      18, 17, 16, 15, 14, 13, 12, 11,
      21, 22, 23, 24, 25, 26, 27, 28,
      48, 47, 46, 45, 44, 43, 42, 41,
      31, 32, 33, 34, 35, 36, 37, 38
    ];

    quadrants.forEach((num) => {
      let cond = 'higido';
      let tactics = 'best';
      let price = 0;
      let proc = '';
      let surfaces = {
        vestibular: { condition: 'higido' },
        lingual: { condition: 'higido' },
        mesial: { condition: 'higido' },
        distal: { condition: 'higido' },
        oclusal: { condition: 'higido' },
      };

      if (num === 16) {
        cond = 'carie';
        tactics = 'blunder';
        proc = 'Restauração Resina Fotopolimerizável';
        price = 190;
        surfaces.oclusal = { condition: 'carie', notes: 'Lesão ativa de cárie em esmalte e dentina' };
      } else if (num === 26) {
        cond = 'restauracao';
        tactics = 'good';
        proc = 'Restauração Resina Composta';
        price = 180;
        surfaces.oclusal = { condition: 'restauracao', material: 'Filtek Z350 XT' };
      } else if (num === 36) {
        cond = 'canal';
        tactics = 'mistake';
        proc = 'Tratamento Endodôntico Molar';
        price = 750;
      } else if (num === 46) {
        cond = 'implante';
        tactics = 'brilliant';
        proc = 'Implante Cone Morse Straumann';
        price = 2400;
      }

      adultTeeth1.push({
        toothNumber: num,
        generalCondition: cond,
        surfaces,
        chessTactics: tactics,
        procedureName: proc,
        price,
        status: cond === 'higido' ? 'higido' : cond === 'carie' ? 'necessita_tratamento' : 'concluido',
      });
    });

    await Odontogram.create({
      patient: patient1._id,
      dentist: admin._id,
      archType: 'adulto',
      teeth: adultTeeth1,
      generalHealthScore: 82,
      tacticalSummary: {
        cariesCount: 1,
        restorationCount: 1,
        rootCanalCount: 1,
        implantCount: 1,
        missingCount: 0,
      },
      notes: 'Plano de tratamento focado em restauração do dente 16 e finalização do dente 36.',
    });

    // 4. Odontograma para Larissa Montenegro
    const adultTeeth2 = quadrants.map((num) => ({
      toothNumber: num,
      generalCondition: num === 11 || num === 21 ? 'ortodontia' : 'higido',
      surfaces: {
        vestibular: { condition: num === 11 || num === 21 ? 'ortodontia' : 'higido' },
        lingual: { condition: 'higido' },
        mesial: { condition: 'higido' },
        distal: { condition: 'higido' },
        oclusal: { condition: 'higido' },
      },
      chessTactics: 'best',
      procedureName: num === 11 || num === 21 ? 'Alinhadores Estéticos' : '',
      price: 0,
      status: 'higido',
    }));

    await Odontogram.create({
      patient: patient2._id,
      dentist: dentista._id,
      archType: 'adulto',
      teeth: adultTeeth2,
      generalHealthScore: 98,
      tacticalSummary: { cariesCount: 0, restorationCount: 0, rootCanalCount: 0, implantCount: 0, missingCount: 0 },
    });

    console.log('🦷 [Seed] Criando Prontuários Médicos (PEP)...');

    // 5. Medical Records (PEP)
    await MedicalRecord.create({
      patient: patient1._id,
      dentistInCharge: admin._id,
      anamnese: {
        mainComplaint: 'Dor e desconforto ao mastigar no lado superior direito.',
        historyOfPresentIllness: 'Paciente relata dor provocada por doces e frio há 3 semanas.',
        hypertension: true,
        diabetes: false,
        cardiacDisease: false,
        bleedingDisorder: false,
        isPregnant: false,
        isSmoker: false,
        allergiesDetails: 'Alergia grave à Penicilina (choque anafilático prévio). Usar Clindamicina se necessário.',
        medicationsInUse: 'Losartana Potássica 50mg pela manhã.',
        previousSurgeries: 'Apendicectomia aos 16 anos.',
      },
      clinicalEvolutions: [
        {
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          dentistName: admin.name,
          procedureDescription: 'Exame clínico e radiográfico periapical dos molares 16 e 36. Constatada cárie oclusal ativa no 16.',
          teethInvolved: [16, 36],
          anesthesiaUsed: 'Mepivacaína 3% sem vasoconstritor',
          patientEvolutionState: 'Excelente cicatrização',
          nextStep: 'Agendada restauração definitiva do elemento 16.',
        },
      ],
      prescriptions: [
        {
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          dentistName: admin.name,
          medications: [
            {
              name: 'Ibuprofeno 600mg',
              dosage: '1 comprimido',
              frequency: 'A cada 8 horas',
              duration: 'Por 3 dias',
              instructions: 'Tomar apenas se houver dor pós-operatória.',
            },
          ],
          generalInstructions: 'Evitar alimentos excessivamente quentes nas primeiras 24 horas.',
        },
      ],
      certificates: [
        {
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          dentistName: admin.name,
          daysOff: 1,
          cidCode: 'K02.1',
          cidDescription: 'Cárie da dentina / Intervenção restauradora',
          period: 'Repouso domiciliar pós-atendimento odontológico',
        },
      ],
      radiographs: [
        {
          title: 'Panorâmica Inicial de Controle',
          type: 'panoramica',
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800',
          findings: 'Presença de implante osteointegrado região dente 46. Crista óssea preservada.',
        },
      ],
    });

    console.log('🦷 [Seed] Criando Agenda e Consultas de Hoje...');

    // 6. Consultas de Hoje (Data atual no formato YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    await Appointment.create([
      {
        patient: patient1._id,
        dentist: admin._id,
        chairNumber: 1, // Sala Cirurgia / Implante
        date: today,
        timeSlot: '08:30',
        durationMinutes: 45,
        procedure: 'Restauração Estética em Resina Z350 (Dente 16)',
        category: 'clinica_geral',
        status: 'aguardando', // Na sala de espera!
        waitingRoomArrivedAt: new Date(Date.now() - 15 * 60 * 1000), // Chegou há 15 min
        price: 190,
        paid: false,
        notes: 'Atenção: Paciente alérgico a Penicilina!',
      },
      {
        patient: patient2._id,
        dentist: dentista._id,
        chairNumber: 2, // Sala Ortodontia
        date: today,
        timeSlot: '09:30',
        durationMinutes: 30,
        procedure: 'Manutenção Ortodôntica & Troca de Alinhadores',
        category: 'ortodontia',
        status: 'em_atendimento',
        serviceStartedAt: new Date(Date.now() - 10 * 60 * 1000),
        price: 220,
        paid: true,
        paymentMethod: 'pix',
      },
      {
        patient: patient3._id,
        dentist: admin._id,
        chairNumber: 1,
        date: today,
        timeSlot: '11:00',
        durationMinutes: 60,
        procedure: 'Instalação de Cicatrizador Implante 46',
        category: 'implantodontia',
        status: 'confirmado',
        price: 450,
        paid: false,
      },
      {
        patient: patient4._id,
        dentist: dentista._id,
        chairNumber: 2,
        date: today,
        timeSlot: '14:00',
        durationMinutes: 45,
        procedure: 'Profilaxia Ultrassônica e Aplicação de Flúor',
        category: 'periodontia',
        status: 'agendado',
        price: 180,
        paid: false,
      },
    ]);

    console.log('🦷 [Seed] Criando Orçamentos e Planos de Tratamento...');

    // 7. Treatment Plans
    await TreatmentPlan.create({
      patient: patient1._id,
      dentist: admin._id,
      title: 'Plano Integrado de Reabilitação Molar & Estética',
      items: [
        {
          toothNumber: 16,
          procedureName: 'Restauração Resina Nanoparticulada',
          category: 'Dentística',
          unitPrice: 190,
          quantity: 1,
          total: 190,
          status: 'em_andamento',
        },
        {
          toothNumber: 36,
          procedureName: 'Tratamento Endodôntico Automatizado',
          category: 'Endodontia',
          unitPrice: 750,
          quantity: 1,
          total: 750,
          status: 'a_fazer',
        },
        {
          toothNumber: 46,
          procedureName: 'Coroa Cerâmica Zircônia sobre Implante',
          category: 'Prótese',
          unitPrice: 1500,
          quantity: 1,
          total: 1500,
          status: 'a_fazer',
        },
      ],
      subtotal: 2440,
      discountPercentage: 10,
      discountAmount: 244,
      totalAmount: 2196,
      paymentMethod: 'cartao_credito',
      installments: 6,
      status: 'aprovado',
      approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      notes: 'Condição aprovada: Parcelamento em 6x sem juros no cartão de crédito.',
    });

    console.log('🦷 [Seed] Criando Transações Financeiras e Fluxo de Caixa...');

    // 8. Financial Transactions
    await FinancialTransaction.create([
      {
        type: 'receita',
        category: 'procedimento',
        description: 'Primeira Parcela Tratamento - Carlos Eduardo Silva',
        amount: 366,
        paymentMethod: 'cartao_credito',
        status: 'pago',
        patient: patient1._id,
        dentist: admin._id,
        commission: { dentist: admin._id, percentage: 60, amount: 219.6, isPaid: false },
        receiptNumber: 'REC-001091',
      },
      {
        type: 'receita',
        category: 'ortodontia_mensal',
        description: 'Manutenção Mensal Ortodôntica - Larissa Montenegro',
        amount: 220,
        paymentMethod: 'pix',
        status: 'pago',
        patient: patient2._id,
        dentist: dentista._id,
        commission: { dentist: dentista._id, percentage: 50, amount: 110, isPaid: false },
        receiptNumber: 'REC-001092',
      },
      {
        type: 'receita',
        category: 'implante',
        description: 'Cirurgia de Implante Dentário - Paciente Particular',
        amount: 2800,
        paymentMethod: 'pix',
        status: 'pago',
        dentist: admin._id,
        commission: { dentist: admin._id, percentage: 60, amount: 1680, isPaid: true },
        receiptNumber: 'REC-001085',
      },
      {
        type: 'despesa',
        category: 'material_dentario',
        description: 'Compra Reposição Resinas e Anestésicos - Dental Cremer',
        amount: 1250,
        paymentMethod: 'boleto',
        status: 'pago',
      },
      {
        type: 'despesa',
        category: 'laboratorio_protese',
        description: 'Fatura Mensal de Próteses - Laboratório Alpha Precision',
        amount: 890,
        paymentMethod: 'transferencia',
        status: 'pago',
      },
      {
        type: 'despesa',
        category: 'aluguel_clinica',
        description: 'Aluguel do Consultório e Condomínio Clínico',
        amount: 2200,
        paymentMethod: 'transferencia',
        status: 'pago',
      },
    ]);

    console.log('🦷 [Seed] Criando Estoque de Materiais Odontológicos...');

    // 9. Supplies
    await Supply.create([
      {
        name: 'Articaína 4% com Epinefrina 1:100.000 (DFL)',
        category: 'anestesico',
        currentStock: 4, // Alerta: abaixo do mínimo
        minStock: 10,
        unit: 'caixas (50 tubetes)',
        batchNumber: 'LOTE-ART-2026',
        expirationDate: new Date('2027-08-30'),
        unitCost: 145.0,
        supplier: 'Dental Cremer Distribuidora',
        location: 'Geladeira Odontológica - Prateleira 1',
      },
      {
        name: 'Resina Filtek Z350 XT Cor A2 Body (3M ESPE)',
        category: 'resina',
        currentStock: 2, // Alerta crítico
        minStock: 5,
        unit: 'seringas 4g',
        batchNumber: 'LT-3M-9921',
        expirationDate: new Date('2027-12-15'),
        unitCost: 189.9,
        supplier: 'Dental Surya',
        location: 'Armário A - Gaveta de Resinas 2',
      },
      {
        name: 'Luvas de Procedimento Nitrílicas Azuis Tam. M',
        category: 'biosseguranca',
        currentStock: 18,
        minStock: 8,
        unit: 'caixas com 100un',
        batchNumber: 'LT-NIT-550',
        expirationDate: new Date('2028-01-10'),
        unitCost: 42.0,
        supplier: 'Speed Dental',
        location: 'Almoxarifado Central',
      },
      {
        name: 'Agulha Gengival Curta 30G Descartável',
        category: 'descartavel',
        currentStock: 12,
        minStock: 5,
        unit: 'caixas com 100un',
        batchNumber: 'LT-AG-30G',
        expirationDate: new Date('2028-06-20'),
        unitCost: 55.0,
        supplier: 'Dental Cremer',
        location: 'Armário Esterilização',
      },
      {
        name: 'Fio de Sutura Seda Trançada 3-0 com Agulha',
        category: 'cirurgia',
        currentStock: 15,
        minStock: 6,
        unit: 'caixas com 24un',
        batchNumber: 'LT-SUT-2026',
        expirationDate: new Date('2027-09-01'),
        unitCost: 68.0,
        supplier: 'Dental Cremer',
        location: 'Gaveta de Cirurgia e Implantes',
      },
    ]);

    console.log('🦷 [Seed] Criando Ordens de Serviço do Laboratório de Prótese...');

    // 10. Lab Orders
    await LabOrder.create([
      {
        patient: patient1._id,
        dentist: admin._id,
        labName: 'Laboratório Protético Alpha Precision',
        itemDescription: 'Coroa Cerâmica Zircônia Prettau (Dente 46)',
        type: 'coroa',
        shade: 'A3 (Escala VITA)',
        teethNumbers: [46],
        dateSent: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        dateTryIn: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        dateExpected: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        cost: 420.0,
        status: 'em_producao',
        notes: 'Caprichar na caracterização oclusal e pontos de contato.',
      },
      {
        patient: patient2._id,
        dentist: dentista._id,
        labName: 'Lab Zircônia Roraima',
        itemDescription: 'Placa Miorrelaxante de Bruxismo em Acetato Rígido/Resina',
        type: 'placa_bruxismo',
        shade: 'Transparente Cristal',
        teethNumbers: [],
        dateSent: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        dateExpected: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        cost: 250.0,
        status: 'enviado',
        notes: 'Espessura 2mm com alívio canino.',
      },
    ]);

    console.log('\n🦷 ========================================================');
    console.log('✅ BANCO DE DADOS ODONTOLÓGICO POPULADO COM SUCESSO!');
    console.log('--------------------------------------------------------');
    console.log('👤 Usuários Disponíveis para Demonstração:');
    console.log('   1. ADMIN / DIRETOR CLÍNICO:');
    console.log('      Dr. Roberto Silveira  |  admin@odontochess.com  |  admin123');
    console.log('   2. CIRURGIÃ-DENTISTA:');
    console.log('      Dra. Mariana Costa   |  dentista@odontochess.com  |  dentista123');
    console.log('   3. RECEPÇÃO & ATENDIMENTO:');
    console.log('      Camila Alencar        |  recepcao@odontochess.com  |  recepcao123');
    console.log('   4. PORTAL DO PACIENTE:');
    console.log('      Carlos Eduardo Silva  |  paciente@odontochess.com  |  paciente123');
    console.log('🦷 ========================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro durante o seeding:', err);
    process.exit(1);
  }
};

seedDatabase();
