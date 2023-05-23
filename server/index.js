const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const SYMBOLS = {
  PLAYER_X: 'X',
  PLAYER_O: 'O',
};

let grid = [
  ['', '', ''],
  ['', '', ''],
  ['', '', ''],
];

let currentPlayer = SYMBOLS.PLAYER_X;

function sendGridToClients() {
  io.emit('grid', grid);
}

function checkGameEnd() {
  for (let i = 0; i < 3; i++) {
    if (
      grid[i][0] !== '' &&
      grid[i][0] === grid[i][1] &&
      grid[i][0] === grid[i][2]
    ) {
      return true;
    }
  }

  for (let j = 0; j < 3; j++) {
    if (
      grid[0][j] !== '' &&
      grid[0][j] === grid[1][j] &&
      grid[0][j] === grid[2][j]
    ) {
      return true;
    }
  }

  if (
    grid[0][0] !== '' &&
    grid[0][0] === grid[1][1] &&
    grid[0][0] === grid[2][2]
  ) {
    return true;
  }

  if (
    grid[0][2] !== '' &&
    grid[0][2] === grid[1][1] &&
    grid[0][2] === grid[2][0]
  ) {
    return true;
  }

  let isDraw = true;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i][j] === '') {
        isDraw = false;
        break;
      }
    }
    if (!isDraw) {
      break;
    }
  }
  return isDraw;
}

io.on('connection', socket => {
  sendGridToClients();

socket.emit('currentPlayer', currentPlayer);
socket.on('placeSymbol', ({ row, col }) => {
  if (
    row >= 0 && row < 3 &&
    col >= 0 && col < 3 &&
    grid[row][col] === ''
  ) {
    grid[row][col] = currentPlayer;

    if (checkGameEnd()) {
      io.emit('grid', grid);
      io.emit('currentPlayer', '');

      setTimeout(() => {
        io.emit('gameEnd', currentPlayer);
        grid = [
          ['', '', ''],
          ['', '', ''],
          ['', '', ''],
        ];
      }, 200);
    } else {
      currentPlayer =
        currentPlayer === SYMBOLS.PLAYER_X
          ? SYMBOLS.PLAYER_O
          : SYMBOLS.PLAYER_X;

      io.emit('currentPlayer', currentPlayer);
    }

    sendGridToClients();
  }
});
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

server.listen(3000, () => {
  console.log('Serveur Express démarré sur le port 3000');
});
