import readline from 'readline';
import { state, incrementCounter } from '../src/state.js';
import http from 'http';

// Создаём интерактивную консоль
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askName() {
  rl.question('Введите ваше имя: ', (answer) => {
    state.username = answer;
    console.log(`Привет, ${state.username}!`);
    incrementCounter();
    console.log(`Счётчик: ${state.counter}`);
    rl.close();

    // После ввода запускаем локальный сервер для визуализации
    startServer();
  });
}

function startServer() {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <html>
        <body>
          <h1>Привет, ${state.username}!</h1>
          <p>Счётчик: ${state.counter}</p>
        </body>
      </html>
    `);
  });

  server.listen(3000, () => {
    console.log('Откройте http://localhost:3000 в браузере, чтобы увидеть визуализацию');
  });
}

// Запуск
askName();