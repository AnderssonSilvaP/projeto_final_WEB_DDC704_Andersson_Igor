# OdontoCheck

Sistema full stack de agendamento e gestão para clínica odontológica, desenvolvido como projeto final da disciplina de Arquitetura Web (UFRR). Permite o gerenciamento de pacientes, procedimentos odontológicos e agendamentos com verificação de conflito de horários e controle de acesso entre administradores e pacientes.

## Stack

- **Backend** (`server/`): Node.js, Express, MongoDB/Mongoose, JWT e bcrypt na arquitetura MVC.
- **Frontend** (`client/`): React 18, Vite, Tailwind CSS e React Router.

## Execução com Docker

```bash
docker compose up --build
```

Aplicação disponível em `http://localhost:3000` e API em `http://localhost:5000/api`. O banco é populado automaticamente na primeira execução.

## Execução local

Requisitos: Node.js 18+ e MongoDB em execução.

```bash
npm run install:all
cp server/.env.example server/.env
npm run seed
npm run dev
```

Variáveis de ambiente (`server/.env`):

| Variável     | Descrição                                      |
| ------------ | ---------------------------------------------- |
| `PORT`       | Porta da API (padrão `5000`)                   |
| `MONGO_URI`  | String de conexão do MongoDB                   |
| `JWT_SECRET` | Segredo para assinatura dos tokens JWT         |
| `CLIENT_URL` | Origem permitida no CORS (`http://localhost:3000`) |

## Contas de demonstração

| Perfil   | E-mail                      | Senha         | Permissões                                                  |
| -------- | --------------------------- | ------------- | ----------------------------------------------------------- |
| Admin    | `admin@odontocheck.com`     | `admin123`    | Acesso ao Dashboard, criação de procedimentos e exclusões   |
| Paciente | `paciente@odontocheck.com`  | `paciente123` | Agendamento de consultas, visualização e cadastro cadastral |

## Estrutura

```
server/src/
  config/       Conexão com MongoDB e configuração JWT
  models/       User, Patient, Service, Appointment
  controllers/  Regras de negócio e validações
  routes/       Rotas RESTful da API
  middleware/   Autenticação JWT (protect), RBAC (authorize) e tratamento de erros
  scripts/      Script de seed inicial

client/src/
  components/   Navbar, BookingSteps, Modal, FormField, Button, Badge, StatCard, Spinner
  context/      AuthContext (estado do usuário autenticado e perfil)
  pages/        LoginPage, AgendamentosPage, PacientesPage, ProcedimentosPage, DashboardPage
  services/     Cliente HTTP (fetch) com envio automático do token Bearer
```
