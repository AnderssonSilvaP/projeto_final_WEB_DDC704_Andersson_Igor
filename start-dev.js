const { spawn } = require('child_process');
const path = require('path');

const run = (name, dir) => {
  const child = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, dir),
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const prefix = (stream) => (data) =>
    data.toString().trimEnd().split('\n').forEach((line) => stream.write(`[${name}] ${line}\n`));
  child.stdout.on('data', prefix(process.stdout));
  child.stderr.on('data', prefix(process.stderr));
  return child;
};

const children = [run('server', 'server'), run('client', 'client')];

const stop = () => {
  children.forEach((c) => c.kill());
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
