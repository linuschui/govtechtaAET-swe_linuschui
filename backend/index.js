// DOTENV
require("dotenv").config();
// EXPRESS
const express = require("express");
const app = express();
const port = process.env.PORT || 3500;
app.use(express.json());
// MIDDLEWARE
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.json());
// CORS
const cors = require("cors");
app.use(cors());
// DB
const mysql = require("mysql2");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "t0023772d",
  database: "tic_tac_toe",
});
db.connect((err) => {
  if (err) {
    console.error(`Error Connecting To MySQL : ${err}`);
    return;
  }
  console.log("Connected to MySQL");
});
// SERVER
const { Server } = require("socket.io")
const http = require('http');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
  }
});

// STORE SESSIONS
const games = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for new players
  socket.on('joinGame', ({ gameId, playerName }) => {
      if (!games[gameId]) {
          games[gameId] = {
              board: Array(9).fill(null),
              players: [],
              currentTurn: 'X'
          };
      }

      const game = games[gameId];

      // Check for available slot for new player
      if (game.players.length < 2) {
          game.players.push({ 
            id: socket.id, 
            name: playerName, 
            symbol: game.players.length === 0 ? 'X' : 'O' 
          });
          socket.join(gameId);

          // Update game state to players
          io.to(gameId).emit('gameState', game);

          if (game.players.length === 2) {
              io.to(gameId).emit('gameStart', { message: `Game start! ${game.players[0].name} (X) vs ${game.players[1].name} (O). Turn: ${game.currentTurn}`, game });
          } else { 
              io.to(gameId).emit('waiting', { message: "LOOKING FOR ANOTHER PLAYER TO JOIN!" });
          }
      } else {
          socket.emit('gameFull', { message: "Game is already full." });
      }
      socket.emit('playerSymbol', { symbol: game.players[game.players.length - 1].symbol });
  });

  // Handle player moves
  socket.on('makeMove', ({ gameId, index }) => {
      const game = games[gameId];

      // Check if game and players exist
      if (game && game.players) {
          const player = game.players.find(p => p.id === socket.id);
          
          if (player && game.board[index] === null && game.currentTurn === player.symbol) {
              // Make the move and update the board
              game.board[index] = player.symbol;
              game.currentTurn = game.currentTurn === 'X' ? 'O' : 'X';

              io.to(gameId).emit('gameState', game);

              // Check for win or tie
              const winner = checkWinner(game.board);
              if (winner || !game.board.includes(null)) {
                  io.to(gameId).emit('gameEnd', { winner: winner ? player.name : null });
                  delete games[gameId]; // Clear game after end
              }
          }
      } else {
          socket.emit('invalidGame', { message: "Invalid game session. Please try joining again." });
      }
  });

  // // Release connection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const gameId in games) {
        const game = games[gameId];
        game.players = game.players.filter(p => p.id !== socket.id);
        if (game.players.length === 0) {
          delete games[gameId];
        }
    }
  });
});

// Helper function to check for winner
const checkWinner = (board) => {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (const [a, b, c] of winningCombinations) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
};

// START SERVER
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
