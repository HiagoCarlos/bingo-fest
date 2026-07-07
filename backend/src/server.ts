import path from 'path';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { CardService } from './services/CardService';
import { RoomController } from './controllers/RoomController';
import { PlayerController } from './controllers/PlayerController';
import { setupGameSockets } from './sockets/gameSocket';
import { AdminController } from './controllers/AdminController';

dotenv.config();

const app = express();
const port = process.env.PORT || 3333;

const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});


app.use(cors());
app.use(express.json());

app.get('/api/status', (req, res) => {
  res.json({ status: 'Servidor do Bingo rodando perfeitamente!' });
});
app.post('/api/admin/login', AdminController.login);
app.get('/api/admin/dashboard', AdminController.getDashboardData);


app.post('/api/rooms', RoomController.create);
app.post('/api/players/join', PlayerController.join);
app.get('/api/rooms/:id', RoomController.getRoom);       
app.delete('/api/rooms/:id', RoomController.deleteRoom);

app.get('/api/test-card', (req, res) => {
  const card = CardService.generateCard();
  res.json({ card });
});

setupGameSockets(io); 

server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

if (process.env.NODE_ENV === 'production') {
  // 1. Aponta para a pasta onde o Vite gerou o build do Frontend
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  
  // 2. Diz pro Express liberar o acesso aos arquivos (css, imagens, js)
  app.use(express.static(frontendPath));

  // 3. Qualquer link que o usuário digitar, o Express manda a tela do React (Home)
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}