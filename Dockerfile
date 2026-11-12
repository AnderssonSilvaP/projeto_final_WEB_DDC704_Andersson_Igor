FROM node:20-alpine AS client-build
WORKDIR /build/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./
COPY --from=client-build /build/client/dist ./public
RUN node --check src/server.js \
  && node --check src/scripts/seed.js \
  && chmod +x docker-entrypoint.sh
ENV PORT=5000
ENV NODE_ENV=production
ENV AUTO_SEED=true
EXPOSE 5000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "src/server.js"]
