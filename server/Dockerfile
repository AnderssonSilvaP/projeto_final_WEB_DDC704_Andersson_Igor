# Imagem base leve com Node.js 20 LTS Alpine
FROM node:20-alpine

WORKDIR /app

# Instalar dependências de produção
COPY package*.json ./
RUN npm ci --only=production || npm install --production

# Copiar código-fonte da aplicação
COPY . .

# Permissão de execução para o script de entrada
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production
ENV AUTO_SEED=true

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "src/server.js"]
