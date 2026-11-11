# ========================================================
# Estágio 1: Build da Aplicação React com Vite
# ========================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci || npm install

# Copiar código-fonte e compilar o bundle de produção
COPY . .
RUN npm run build

# ========================================================
# Estágio 2: Servidor Nginx Ultra-Leve em Produção
# ========================================================
FROM nginx:alpine

# Configuração personalizada do Nginx com proxy reverso para /api
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar os arquivos estáticos compilados pelo Vite
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
