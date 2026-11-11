# OdontoCheck

Sistema full stack de gestão de clínica odontológica, desenvolvido como projeto final de Arquitetura Web (UFRR). Reúne cadastro de pacientes, agenda por cadeira com bloqueio de conflitos, odontograma, prontuário eletrônico, orçamentos, financeiro, estoque e ordens de laboratório, com acesso por perfil (admin, dentista, recepção e paciente).

## Stack

- **API** (`server/`): Node.js, Express, MongoDB/Mongoose, JWT, bcrypt. Arquitetura MVC (models, controllers, routes) com respostas em JSON.
- **Cliente** (`client/`): React 18, Vite, Tailwind CSS, React Router.

## Execução com Docker

```bash
docker compose up --build
```

Aplicação em http://localhost:3000 e API em http://localhost:5000/api. O banco é populado com dados de demonstração na primeira inicialização. Para definir o segredo do JWT: `JWT_SECRET=... docker compose up --build`.

## Execução local

Requisitos: Node.js 18+ e MongoDB em execução.

```bash
npm run install:all
cp server/.env.example server/.env   # ajuste MONGO_URI e JWT_SECRET
npm run seed
npm run dev
```

Variáveis de ambiente do servidor (`server/.env`):

| Variável     | Descrição                                        |
| ------------ | ------------------------------------------------ |
| `PORT`       | Porta da API (padrão 5000)                       |
| `MONGO_URI`  | String de conexão do MongoDB                     |
| `JWT_SECRET` | Segredo de assinatura dos tokens (obrigatório)   |
| `CLIENT_URL` | Origem permitida no CORS                         |

O Vite encaminha `/api` para `localhost:5000` em desenvolvimento.

## Contas de demonstração

| Perfil    | E-mail                      | Senha          |
| --------- | --------------------------- | -------------- |
| Admin     | admin@odontocheck.com       | `admin123`     |
| Dentista  | dentista@odontocheck.com    | `dentista123`  |
| Recepção  | recepcao@odontocheck.com    | `recepcao123`  |
| Paciente  | paciente@odontocheck.com    | `paciente123`  |

Apenas administradores podem excluir registros. O cadastro público (`/api/auth/register`) cria sempre usuários com perfil `paciente`.

## Estrutura

```
server/src/  config, middleware, models, controllers, routes, scripts/seed.js
client/src/  components, pages, context (auth, tema, áudio), services/api.js
```
