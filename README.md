# 🦷 OdontoCheck • Sistema Full Stack de Gestão Odontológica

> **Projeto Final de Arquitetura Web: "O Sistema Full Stack" — Universidade Federal de Roraima (UFRR)**  
> **Tema:** Gestão Clínica Odontológica Integrada  
> **Design Language:** Inspirado na ergonomia, minimalismo elegante e paleta sofisticada do **Chess.com**

---

## 🎯 Sobre o Projeto

O **OdontoCheck** é uma plataforma clínica e gerencial completa para consultórios e clínicas odontológicas modernas. Unindo a robustez de uma arquitetura Full Stack em camadas (MVC) ao consagrado estilo visual do **Chess.com** (tons escuros acolhedores, botões 3D com relevo tátil, modo claro clínico, e efeitos sonoros sutis de interface via Web Audio API).

O sistema cobre **todas as necessidades operacionais e clínicas de um consultório odontológico**, integrando prontuário eletrônico (PEP), arcada dentária interativa (Odontograma 2D/3D com 5 faces anatômicas), gestão de agenda por cadeiras clínicas, fluxo financeiro com repasse de comissões aos dentistas, controle de estoque de insumos e ordens de serviço protéticas.

---

## 🐳 Execução Rápida via Docker (Recomendado para Avaliação)

A forma mais simples de rodar este projeto em qualquer máquina (Windows, Mac ou Linux) sem precisar instalar Node.js ou MongoDB:

```bash
docker compose up --build
```

- 🌐 **Aplicação Web / Portal do Paciente:** [http://localhost:3000](http://localhost:3000)
- 📡 **API RESTful Backend:** [http://localhost:5000/api](http://localhost:5000/api)
- 💾 **Banco de Dados MongoDB:** `localhost:27017`

> 💡 *O banco de dados é populado automaticamente com dados de demonstração na inicialização.*  
> Para detalhes e comandos avançados, consulte o [**Guia Completo do Docker (DOCKER.md)**](./DOCKER.md).

---

## 🏆 Alinhamento com os Requisitos Acadêmicos (UFRR)

| Requisito do Edital | Implementação no OdontoCheck |
| :--- | :--- |
| **Arquitetura Backend (30%)** | Padrão MVC em Node.js + Express + Mongoose + MongoDB, com entrega de dados em JSON RESTful e separação estrita de Models, Controllers, Middlewares e Routes. |
| **Arquitetura Frontend (30%)** | SPA moderno em React 18 + Vite + Tailwind CSS + React Router DOM v6, modularizado em componentes reutilizáveis e consumo de API centralizado. |
| **Persistência de Dados NoSQL** | MongoDB com 9 coleções interligadas (`User`, `Patient`, `Appointment`, `Odontogram`, `MedicalRecord`, `TreatmentPlan`, `FinancialTransaction`, `Supply`, `LabOrder`). |
| **Segurança & AuthN (20%)** | Autenticação via JSON Web Token (JWT) com expiração de 30 dias e hash criptográfico de senhas utilizando `bcryptjs` (salt de 10 rounds). |
| **Controle de Acesso & AuthZ** | RBAC com 4 papéis: `admin` (Diretor Clínico), `dentista` (Cirurgiã-Dentista), `recepcao` (Secretária/Atendimento) e `paciente`. Rotas e ações sensíveis protegidas no backend e frontend. |
| **Validação de Entrada** | Schemas rigorosos do Mongoose com tipos, enums, regex de e-mail e validação de conflito de cadeiras e horários no agendamento. |
| **UX/UI & Usabilidade (10%)** | Design refinado baseado no estilo do Chess.com, Modo Claro & Escuro, 5 temas visuais, botões com relevo tátil, feedback sonoro e feedback de erro e carregamento em todas as ações. |
| **Diferenciais & Bônus** | **Odontograma Interativo 2D/3D** com 5 faces por dente e gerador automático de orçamento a partir do diagnóstico; emissor de receitas e atestados com CID-10; cronômetro de sala de espera ao vivo; 1-Click Demo Switcher para apresentação em banca. |

---

## 🎨 Design System: Inspiração Estética do Chess.com

O sistema adota os pontos fortes de ergonomia e usabilidade do Chess.com de forma balanceada e 100% voltada à odontologia:
- **Paleta de Cores & Superfícies:** Fundo Dark `#262522`, painéis `#312e2b`, linhas de corte `#3d3a34`, botões 3D verdes `#81b64c` com chanfro inferior `#45752b`, e detalhes dourados elegantes.
- **Sistema de Temas e Modo Claro / Escuro:**
  - ☀️ **Modo Claro:** Interface clínica alva e sofisticada (`#f4f5f8`, `#ffffff`, bordas `#e2e8f0` e texto `#0f172a`), ideal para consultórios bem iluminados.
  - 🌙 **Modo Escuro:** Visual noturno acolhedor e focado (`#262522`), reduz a fadiga ocular.
  - 🎨 **5 Paletas de Cores:**
    1. *Verde Clássico (Chess.com)* — O tradicional verde equilibrado.
    2. *Madeira Elegante (Nogueira)* — Tons aconchegantes de madeira e âmbar.
    3. *Mármore Clínico (Ciano)* — Visual cirúrgico odontológico contemporâneo.
    4. *Safira Real (Azul Cobalto)* — Alta precisão e elegância tecnológica.
    5. *Menta Preventiva (Esmeralda)* — Verde profilático e fresco.
- **Indicador de Eficiência Clínica:** Barra visual inspirada na barra de avaliação que mede a performance da clínica (-5.0 a +10.0) com base na taxa de conclusão de consultas, rentabilidade do mês e ausência de rupturas de estoque.
- **Odontograma Digital Padronizado:** Mapeamento anatômico com símbolos odontológicos padrão (C para Cárie, R para Restauração, E para Endodontia, P para Prótese, I para Implante, X para Extração, O para Ortodontia, T para Tártaro/Profilaxia e ✓ para Hígido).
- **Web Audio API:** Síntese nativa de cliques suaves nos botões e nas seleções de dentes, além de chimes ao emitir receitas e concluir atendimentos (com botão liga/desliga no cabeçalho).

---

## 🦷 Módulos e Funcionalidades da Clínica

### 1. 🌟 Portal do Paciente, Apresentação & Recepção Virtual Interativa (`/portal`)
- **Apresentação Institucional da Clínica:**
  - Métricas de excelência (+12.500 pacientes, 99.4% de satisfação, 15 anos de tradição, fluxo 100% digital 3D).
  - Canais de emergência e plantão 24h com botão direto de ligação e WhatsApp.
- **Corpo Clínico & Médicos Especialistas:**
  - **Dr. Roberto Silveira (CRO-RR 4521):** Diretor Clínico e Cirurgião Bucomaxilofacial, especialista em implantodontia de carga imediata e cirurgia guiada 3D.
  - **Dra. Mariana Costa (CRO-RR 5892):** Ortodontista, Invisalign Top Doctor Platinum e especialista em harmonização facial.
  - **Dr. Carlos Fontes (CRO-RR 3910):** Especialista em endodontia microscópica com microscópio cirúrgico Carl Zeiss.
  - **Dra. Beatriz Mendes (CRO-RR 6204):** Odontopediatria humanizada, periodontia e sedação consciente com óxido nitroso.
- **Tipos de Exames & Diagnóstico 3D no Local:**
  - Tomografia Computadorizada Cone Beam 3D (80% menos radiação).
  - Escaneamento Intraoral 3D Colorido em 3 minutos (dispensa massa de moldagem).
  - Radiografia Panorâmica Digital HD em 12 segundos.
  - Check-up preventivo com Câmera Intraoral HD com ampliação de 60x.
- **Cirurgias & Procedimentos Avançados:**
  - Implantes de Carga Imediata (dente provisório em 24-48h).
  - Cirurgia de Sisos Inclusos Guiada por Computador.
  - Enxertos Ósseos e Levantamento de Seio Maxilar.
  - Alinhadores Invisíveis Transparentes.
  - Facetas e Lentes em Porcelana Pura E-Max.
  - Tratamento de Canal Mecanizado em Sessão Única.
- **Fila de Atendimento em Tempo Real:**
  - Painel de chamada com última senha chamada, próxima senha, pacientes na sala de espera e estimativa de tempo restante.
- **Mini-Mapa Interativo 2D da Clínica:**
  - Planta baixa dinâmica com visualização dos setores: Recepção & Lounge com avatares de pacientes aguardando, Consultório 1 (Cadeira Titânio - Cirurgia), Consultório 2 (Cadeira Ouro - Ortodontia), Consultório 3 (Cadeira Esmeralda - Clínica Geral), Centro de Tomografia 3D e Central de Esterilização Biossegura.
  - Status em tempo real de ocupação e tempo estimado de atendimento em cada setor.
- **Recepção Virtual Interativa com Avatar "Sofia":**
  - Concierge virtual conversacional com síntese de voz (Web Speech API) e som tátil.
  - Triagem de queixa principal, alergias conhecidas (penicilina, dipirona, anestésicos, látex), histórico familiar/médico (hipertensão, diabetes, cardiopatias, coagulopatias) e medicamentos em uso contínuo.
  - Check-in integrado via backend `POST /api/patients/interactive-checkin` com criação automática de PEP e agendamento instantâneo na fila da recepção.

### 2. ♟️ Dashboard Tático & Sala de Espera
- Barra de Avaliação da Clínica em tempo real.
- KPIs essenciais: Consultas hoje, receita mensal, pacientes ativos e insumos em alerta.
- **Sala de Espera ao Vivo:** Monitoramento de pacientes aguardando com botão de chamada para atendimento.
- Agenda do dia com status rápidos (Confirmar, Chamar, Finalizar).

### 3. 🦷 Odontograma Interativo 2D/3D
- Alternância entre **Arcada Adulta (32 dentes)** e **Arcada Decídua Infantil (20 dentes)**.
- Seleção anatômica por dente ou pelas 5 faces: *Vestibular, Lingual/Palatina, Mesial, Distal e Oclusal/Incisal*.
- Classificação de condições: Hígido, Cárie, Restauração em Resina, Canal (Endodontia), Coroa/Prótese, Implante Dentário, Exodontia, Aparelho Ortodôntico e Profilaxia/Tártaro.
- **Gerador Automático de Orçamento:** Converte todos os dentes diagnosticados em um Plano de Tratamento com valores calculados com apenas 1 clique.

### 4. 📅 Agenda & Multi-Consultórios (Cadeiras 1, 2 e 3)
- Gestão de múltiplos consultórios: Cadeira 1 (Cirurgia/Implante), Cadeira 2 (Ortodontia/Estética) e Cadeira 3 (Clínica Geral).
- Bloqueio inteligente contra conflitos de horário para o mesmo dentista ou mesma cadeira.
- Fluxo de status: *Agendado ➔ Confirmado ➔ Aguardando (Sala de Espera) ➔ Em Atendimento ➔ Concluído*.
- **Simulador de Lembrete WhatsApp:** Geração de mensagem formatada para confirmação prévia com o paciente.

### 5. 📋 Prontuário Eletrônico do Paciente (PEP)
- **Ficha de Anamnese:** Alertas médicos destacados (Hipertensão, Diabetes, Alergias graves à Penicilina/Látex, Gestação).
- **Evoluções Clínicas:** Histórico cronológico com descrição do procedimento, dentes envolvidos, anestésico e assinatura do profissional.
- **Receituário Odontológico Digital:** Modelos rápidos (Amoxicilina, Ibuprofeno, Dipirona, Clorexidina) prontos para impressão.
- **Atestados Odontológicos:** Emissão formal com dias de repouso e código de diagnóstico **CID-10** (ex: K02.1, K04.0).
- **Galeria Radiológica:** Armazenamento e laudo de radiografias panorâmicas e periapicais.

### 6. 👥 Pacientes & CRM Odontológico
- Busca instantânea por Nome, CPF ou Telefone.
- Filtro por plano de saúde (Particular, Uniodonto, Bradesco Dental, Amil).
- **Score / Elo Bucal do Paciente:** Gamificação de 1200 a 2500 pontos baseada em assiduidade e prevenção.
- Atalhos rápidos de contato direto via WhatsApp.

### 7. 💰 Planos de Tratamento & Orçamentos
- Criação de propostas comerciais detalhadas por procedimento e elemento dentário.
- Simulação de descontos e formas de pagamento (Pix à vista, Cartão de Crédito em até 12x, Boleto, Convênio).
- Fluxo de aprovação: Pendente ➔ Aprovado ➔ Em Execução ➔ Concluído.

### 8. 💳 Fluxo Financeiro & Comissões
- Balanço de receitas e despesas com margem de lucro líquido.
- **Cálculo Automático de Comissão dos Dentistas:** Divisão percentual contratual (ex: 60% clínica / 40% profissional) gerada na conclusão da consulta.
- Extrato com filtros por categoria e data.

### 9. 📦 Estoque de Insumos Odontológicos
- Monitoramento de anestésicos, resinas compostas, luvas de procedimento, agulhas gengivais e fios de sutura.
- Alertas visuais automáticos de estoque crítico e vencimento de lotes.
- Ajuste rápido de estoque com botões de incremento/decremento (+ / -).

### 10. 🔬 Laboratório de Prótese (O.S.)
- Acompanhamento de trabalhos protéticos enviados: Coroas cerâmicas, facetas, placas de bruxismo e próteses totais.
- Escalas de cores VITA (A1, A2, A3, BL2), dentes envolvidos e custos laboratoriais.
- Rastreamento por etapas: *Enviado ➔ Em Produção ➔ Prova Agendada ➔ Peça Pronta ➔ Instalado*.

---

## 👥 Credenciais de Acesso (Demonstração em Sala de Aula)

Para facilitar a apresentação perante a banca avaliadora, o sistema conta com o **Demo 1-Click Switcher** tanto na tela de Login quanto no menu lateral da aplicação:

| Perfil | Nome do Profissional | E-mail de Teste | Senha | Permissões / Visualização |
| :--- | :--- | :--- | :--- | :--- |
| **Admin / Diretor Clínico** | Dr. Roberto Silveira (Implantodontia) | `admin@odontochess.com` | `admin123` | Acesso irrestrito a todos os módulos, financeiro total, exclusões e relatórios. |
| **Cirurgiã-Dentista** | Dra. Mariana Costa (Ortodontia) | `dentista@odontochess.com` | `dentista123` | Agenda, prontuário, odontograma, emissão de receitas, orçamentos e suas comissões. |
| **Recepção & Atendimento** | Camila Alencar | `recepcao@odontochess.com` | `recepcao123` | Agenda das 3 cadeiras, sala de espera, cadastro de pacientes, pagamentos e estoque. |
| **Portal do Paciente** | Carlos Eduardo Silva | `paciente@odontochess.com` | `paciente123` | Visualização de seus orçamentos e consultas agendadas. |

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** v18+ ou superior instalado.
- **MongoDB** rodando localmente na porta padrão `27017` (ou string de conexão no arquivo `server/.env`).

### Passo 1: Clonar e Instalar Dependências
Na raiz do projeto (`/home/andersson/Desktop/web/projeto_final`):
```bash
# Instala as dependências do Backend (/server) e Frontend (/client)
npm run install:all
```

### Passo 2: Popular o Banco de Dados (Seed Inicial)
Popule o banco MongoDB com pacientes, odontogramas, consultas de hoje, prontuários, transações e estoque:
```bash
npm run seed
```

### Passo 3: Iniciar o Sistema Full Stack
Inicie simultaneamente o Backend e o Frontend com logs formatados:
```bash
npm start
```

Os serviços estarão disponíveis em:
- 💻 **Frontend Web (SPA):** [http://localhost:3000](http://localhost:3000)
- 📡 **Backend API REST:** [http://localhost:5000/api](http://localhost:5000/api)
- 🏥 **Healthcheck da API:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📁 Estrutura de Diretórios

```
projeto_final/
├── package.json              # Orquestrador de scripts npm do projeto
├── start-dev.js              # Script concorrente de inicialização Full Stack
├── README.md                 # Documentação oficial do projeto
├── server/                   # BACKEND (Node.js + Express + MongoDB Mongoose)
│   ├── .env                  # Variáveis de ambiente (Porta 5000, JWT Secret, Mongo URI)
│   ├── package.json          # Dependências do servidor
│   └── src/
│       ├── config/db.js      # Conexão com MongoDB
│       ├── models/           # Schemas Mongoose (User, Patient, Appointment, Odontogram, PEP, etc.)
│       ├── controllers/      # Controladores MVC com as regras de negócio
│       ├── routes/           # Rotas da API RESTful (/api/*)
│       ├── middleware/       # Autenticação JWT, verificação RBAC e tratamento de erros
│       ├── scripts/seed.js   # Script gerador de dados clínicos realistas
│       └── server.js         # Entry point do Express
└── client/                   # FRONTEND (React 18 + Vite + Tailwind CSS)
    ├── package.json          # Dependências do cliente
    ├── vite.config.js        # Configuração do Vite com proxy reverso para a API
    ├── tailwind.config.js    # Paleta de cores Chess.com e utilitários 3D
    ├── index.html            # Ponto de entrada HTML
    └── src/
        ├── components/       # OdontogramaView, Sidebar, Header, EvaluationBar, Modal
        ├── context/          # AuthContext (JWT e Demo Switcher) e AudioContext (Web Audio API)
        ├── pages/            # Dashboard, Agenda, Odontograma, Prontuario, Pacientes, Orcamentos, Financeiro, Estoque, Proteses, Login
        ├── services/api.js   # Wrapper HTTP fetch com injeção automática de Bearer token
        ├── utils/audio.js    # Sintetizador sonoro Web Audio API de xadrez
        ├── App.jsx           # Roteamento SPA e rotas protegidas
        └── main.jsx          # Bootstrap do React
```

---

## 📑 Principais Endpoints da API REST

### Autenticação & Equipe
- `POST /api/auth/login` — Autenticação e emissão de token JWT.
- `POST /api/auth/register` — Cadastro de novo usuário.
- `GET /api/auth/me` — Obtenção dos dados do usuário logado.
- `GET /api/auth/users` — Listagem de dentistas e colaboradores da clínica.

### Pacientes (CRUD)
- `GET /api/patients` — Listagem com filtros de busca textual e convênio.
- `GET /api/patients/:id` — Dados cadastrais detalhados do paciente.
- `POST /api/patients` — Novo paciente (inicializa odontograma e PEP automaticamente).
- `PUT /api/patients/:id` — Atualização cadastral.
- `DELETE /api/patients/:id` — Inativação de paciente (restrito a Admin).

### Agenda & Consultórios
- `GET /api/appointments` — Consultas filtradas por data, cadeira e profissional.
- `GET /api/appointments/today` — Consultas do dia corrente.
- `POST /api/appointments` — Agendamento com detecção anti-conflito.
- `PATCH /api/appointments/:id/status` — Transição de estado clínico e sala de espera.

### Odontograma Digital
- `GET /api/odontogram/patient/:patientId` — Odontograma completo do paciente.
- `PUT /api/odontogram/patient/:patientId/tooth/:toothNumber` — Diagnóstico e procedimentos por elemento e faces.
- `POST /api/odontogram/patient/:patientId/generate-budget` — Geração automática de plano de tratamento a partir do odontograma.

### Prontuário Eletrônico (PEP)
- `GET /api/medical-records/patient/:patientId` — Prontuário, anamnese e evoluções.
- `PUT /api/medical-records/patient/:patientId/anamnese` — Atualização de histórico médico e alergias.
- `POST /api/medical-records/patient/:patientId/evolutions` — Registro de nova evolução clínica.
- `POST /api/medical-records/patient/:patientId/prescriptions` — Emissão de receita odontológica.
- `POST /api/medical-records/patient/:patientId/certificates` — Emissão de atestado com CID-10.
- `POST /api/medical-records/patient/:patientId/radiographs` — Anexo de exame radiográfico.

### Orçamentos & Finanças
- `GET /api/treatment-plans` — Planos de tratamento e orçamentos.
- `POST /api/treatment-plans` — Criação de orçamento com parcelamento.
- `PATCH /api/treatment-plans/:id/status` — Aprovação ou recusa de orçamento.
- `GET /api/financial/summary` — DRE simplificado, receitas, despesas e saldo líquido.
- `GET /api/financial/transactions` — Extrato de movimentações e comissões.

### Insumos & Próteses
- `GET /api/supplies` — Materiais em estoque e alertas de validade/quantidade.
- `PATCH /api/supplies/:id/adjust` — Incremento e decremento rápido de estoque.
- `GET /api/lab-orders` — Ordens de serviço do laboratório de prótese.
- `PATCH /api/lab-orders/:id/status` — Rastreamento de confecção e prova de peças protéticas.

---

## 👨‍💻 Apresentação e Demonstração Recomendada (3 a 5 min)

1. **Login & RBAC:** Na tela de Login (`/login`), mostre o design tático de xadrez e utilize os botões de 1-Click Demo para demonstrar o acesso do Administrador (Dr. Roberto Kasparov - GM) e em seguida alterne para a Cirurgiã-Dentista ou Recepção.
2. **Dashboard & Avaliação Stockfish:** Apresente a barra de avaliação clínica Stockfish (`+4.8`), o cronômetro da sala de espera ao vivo e os indicadores das 3 cadeiras odontológicas.
3. **Odontograma Interativo:** Acesse `/odontograma`, selecione um paciente, clique no elemento `16` ou `26`, selecione a face `Oclusal`, defina o procedimento (ex: *Cárie - Blunder*) e clique em **"Gerar Orçamento do Odontograma"**.
4. **Orçamentos & Aprovação:** Mostre a conversão direta dos achados do dente no orçamento gerado, simule as parcelas e clique em **"Aprovar Tratamento"**.
5. **Agenda & Anti-conflito:** Acesse `/agenda`, visualize as Cadeiras 1, 2 e 3 e demonstre a transição de status de um paciente da sala de espera para a cadeira odontológica.
6. **Prontuário & PEP:** Mostre os alertas de risco (Alergia a Penicilina, Hipertensão), a evolução clínica e a emissão de receita digital odontológica pronta para impressão.
7. **Estoque e Prótese:** Demonstre os alertas de anestésicos com estoque baixo e o rastreamento das etapas da coroa de zircônia enviada ao protético.
