const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Gestion des salles (rooms)
const rooms = {}; // { roomCode: { players: [], game: null } }

io.on('connection', (socket) => {
  console.log('Joueur connecté :', socket.id);

  // Créer une salle
  socket.on('create-room', () => {
    const roomCode = generateRoomCode();
    rooms[roomCode] = {
      players: [socket.id],
      game: null
    };
    socket.join(roomCode);
    socket.emit('room-created', { roomCode });
    console.log(`Salle créée : ${roomCode}`);
  });

  // Rejoindre une salle
  socket.on('join-room', (roomCode) => {
    const room = rooms[roomCode];
    if (!room) {
      socket.emit('error', { message: 'Salle introuvable' });
      return;
    }
    if (room.players.length >= 2) {
      socket.emit('error', { message: 'Salle pleine' });
      return;
    }

    room.players.push(socket.id);
    socket.join(roomCode);
    socket.emit('room-joined', { roomCode });
    io.to(roomCode).emit('player-joined', { playersCount: room.players.length });

    // Les 2 joueurs sont là → on peut démarrer
    if (room.players.length === 2) {
      io.to(roomCode).emit('ready-to-play');
    }
  });

  // Quitter / déconnexion
  socket.on('disconnect', () => {
    console.log('Joueur déconnecté :', socket.id);
    for (const [code, room] of Object.entries(rooms)) {
      const index = room.players.indexOf(socket.id);
      if (index !== -1) {
        room.players.splice(index, 1);
        io.to(code).emit('player-left');
        if (room.players.length === 0) {
          delete rooms[code];
        }
        break;
      }
    }
  });
});

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
