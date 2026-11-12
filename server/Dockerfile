FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN node --check src/server.js \
  && node --check src/scripts/seed.js \
  && node --check src/controllers/authController.js \
  && node --check src/controllers/patientController.js \
  && node --check src/controllers/appointmentController.js \
  && chmod +x docker-entrypoint.sh
ENV PORT=5000
ENV NODE_ENV=production
ENV AUTO_SEED=true
EXPOSE 5000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "src/server.js"]
