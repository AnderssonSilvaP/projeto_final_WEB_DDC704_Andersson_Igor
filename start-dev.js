const { spawn } = require('child_process');
const path = require('path');

const ROOT_DIR = __dirname;
const SERVER_DIR = path.join(ROOT_DIR, 'server');
const CLIENT_DIR = path.join(ROOT_DIR, 'client');

console.log('\n🦷 ========================================================');
console.log('🦷 INICIANDO ODONTOCHECK - SISTEMA ODONTOLÓGICO FULL STACK');
console.log('✨ Design moderno inspirado na paleta e ergonomia do Chess.com');
console.log('--------------------------------------------------------');
console.log('📡 Backend API : http://localhost:5000/api');
console.log('💻 Frontend Web: http://localhost:3000');
console.log('🦷 ========================================================\n');

// Iniciar Backend
const server = spawn('npm run dev', {
  cwd: SERVER_DIR,
  shell: true,
  stdio: 'pipe',
  env: process.env,
});

server.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[34m[SERVER]\x1b[0m ${data}`);
});

server.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[SERVER ERR]\x1b[0m ${data}`);
});

// Iniciar Frontend
const client = spawn('npm run dev', {
  cwd: CLIENT_DIR,
  shell: true,
  stdio: 'pipe',
  env: process.env,
});

client.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[32m[CLIENT]\x1b[0m ${data}`);
});

client.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[33m[CLIENT WARN/ERR]\x1b[0m ${data}`);
});

function cleanup() {
  console.log('\n🛑 Encerrando servidores OdontoChess...');
  server.kill();
  client.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
