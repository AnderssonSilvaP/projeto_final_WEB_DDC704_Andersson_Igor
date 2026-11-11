# 🐳 Guia de Execução com Docker • OdontoCheck

Este documento contém todas as orientações para rodar o **OdontoCheck** utilizando **Docker e Docker Compose**. Com essa abordagem, quem receber o projeto **não precisa instalar Node.js, MongoDB ou configurar variáveis de ambiente manualmente**: tudo sobe com **apenas 1 comando**.

---

## ⚡ Como Rodar em 1 Minuto (Qualquer Sistema Operacional)

### 📋 Pré-requisito
Ter o **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** instalado e em execução (seja no Windows, macOS ou Linux).

---

### 💻 Passo a Passo

1. **Abra o terminal** na pasta raiz do projeto (`projeto_final`).
2. **Execute o comando:**
   ```bash
   docker compose up --build
   ```
   *(Ou `docker compose up --build -d` para rodar em segundo plano)*.

3. **Pronto! Acesse no navegador:**
   - 🌐 **Portal & Sistema Completo:** [http://localhost:3000](http://localhost:3000)
   - 📡 **Backend API RESTful:** [http://localhost:5000/api](http://localhost:5000/api)
   - 💾 **MongoDB:** Porta `27017`

---

## 🚀 Scripts de Inicialização com 1 Clique

Para facilitar ainda mais a avaliação:

- **No Linux ou macOS:**
  ```bash
  chmod +x docker-start.sh
  ./docker-start.sh
  ```
- **No Windows:**
  Dê dois cliques no arquivo `docker-start.bat`.

---

## 🏗️ Como a Arquitetura Docker Funciona

O ambiente é orquestrado via [`docker-compose.yml`](./docker-compose.yml) em 3 contêineres interligados por rede interna privada:

```
                  ┌─────────────────────────────────────────┐
                  │          Navegador Web do Usuário       │
                  │           http://localhost:3000         │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │    Contêiner 1: odontochess_client      │
                  │   (Nginx Alpine + React 18 SPA Vite)    │
                  │                Porta 80                 │
                  └────────────┬──────────────┬─────────────┘
                               │              │
                   /api/ proxy │              │ arquivos estáticos
                               ▼              ▼ (index.html, JS, CSS)
                  ┌─────────────────────────────────────────┐
                  │    Contêiner 2: odontochess_server      │
                  │      (Node.js 20 Alpine + Express)      │
                  │       Auto-Seed Automático Inicial      │
                  │               Porta 5000                │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼ Conexão Mongoose
                  ┌─────────────────────────────────────────┐
                  │    Contêiner 3: odontochess_db          │
                  │           (MongoDB 7.0 NoSQL)           │
                  │              Volume Persistente         │
                  │               Porta 27017               │
                  └─────────────────────────────────────────┘
```

1. **`mongodb` (MongoDB 7.0):**
   - Imagem oficial com healthcheck integrado.
   - Os dados são salvos no volume `mongo_data`, persistindo mesmo ao desligar os contêineres.

2. **`server` (Backend Node.js 20):**
   - Espera o MongoDB estar 100% pronto antes de inicializar.
   - **Auto-Seed Inteligente:** Na primeira inicialização, executa automaticamente o script de seed (`seed.js`), populando o banco com médicos, consultas, odontograma, prontuários e insumos para demonstração imediata.

3. **`client` (Frontend React + Nginx):**
   - Multi-stage build: compila o código com Vite e serve via Nginx ultra-leve.
   - **Proxy Reverso Integrado:** O Nginx redireciona requisições `/api/` diretamente para o contêiner do backend, eliminando problemas de CORS e portas cruzadas.

---

## 👥 Credenciais Pré-Carregadas (Demo 1-Click)

O sistema possui botões de acesso rápido com 1 clique na tela de login ([`/login`](http://localhost:3000/login)):

| Perfil | Nome no Sistema | E-mail | Senha |
| :--- | :--- | :--- | :--- |
| 👑 **Diretor Clínico (Admin)** | Dr. Roberto Silveira | `admin@odontochess.com` | `admin123` |
| 🦷 **Cirurgiã-Dentista** | Dra. Mariana Costa | `dentista@odontochess.com` | `dentista123` |
| 📋 **Recepção** | Camila Alencar | `recepcao@odontochess.com` | `recepcao123` |
| 👤 **Paciente** | Carlos Eduardo Silva | `paciente@odontochess.com` | `paciente123` |

---

## 🛠️ Comandos Úteis

### Ver logs de todos os contêineres em tempo real:
```bash
docker compose logs -f
```

### Ver logs apenas do backend:
```bash
docker compose logs -f server
```

### Parar os contêineres:
```bash
docker compose down
```

### Parar e apagar os volumes de dados (limpar banco):
```bash
docker compose down -v
```

### Re-executar o seed de demonstração a qualquer momento:
```bash
docker compose exec server npm run seed
```
