const socket = io();

const btnCreate = document.getElementById('btn-create');
const btnJoin = document.getElementById('btn-join');
const roomCodeInput = document.getElementById('room-code');
const roomInfo = document.getElementById('room-info');
const displayCode = document.getElementById('display-code');
const statusEl = document.getElementById('status');
const gamesSection = document.getElementById('games-section');

let currentRoom = null;

// Créer une salle
btnCreate.addEventListener('click', () => {
  socket.emit('create-room');
});

// Rejoindre une salle
btnJoin.addEventListener('click', () => {
  const code = roomCodeInput.value.trim().toUpperCase();
  if (code.length < 4) {
    alert('Entre un code valide');
    return;
  }
  socket.emit('join-room', code);
});

// Événements Socket.io
socket.on('room-created', ({ roomCode }) => {
  currentRoom = roomCode;
  displayCode.textContent = roomCode;
  roomInfo.classList.remove('hidden');
  statusEl.textContent = 'En attente du 2ème joueur...';
  btnCreate.disabled = true;
  btnJoin.disabled = true;
  roomCodeInput.disabled = true;
});

socket.on('room-joined', ({ roomCode }) => {
  currentRoom = roomCode;
  displayCode.textContent = roomCode;
  roomInfo.classList.remove('hidden');
  statusEl.textContent = 'Tu as rejoint la salle !';
  btnCreate.disabled = true;
  btnJoin.disabled = true;
  roomCodeInput.disabled = true;
});

socket.on('player-joined', ({ playersCount }) => {
  if (playersCount === 2) {
    statusEl.textContent = 'Les 2 joueurs sont là ! 🎉';
  }
});

socket.on('ready-to-play', () => {
  statusEl.textContent = 'Prêt à jouer ! Choisis un jeu ↓';
  gamesSection.classList.remove('hidden');
});

socket.on('player-left', () => {
  statusEl.textContent = 'L\'autre joueur a quitté...';
  gamesSection.classList.add('hidden');
});

socket.on('error', ({ message }) => {
  alert(message);
});

// Clic sur un jeu (pour plus tard)
document.querySelectorAll('.game-card:not(.coming-soon)').forEach(card => {
  card.addEventListener('click', () => {
    const game = card.dataset.game;
    alert(`Le jeu "${game}" sera disponible bientôt !\n(On l'implémente juste après)`);
  });
});
