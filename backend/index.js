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
app.use(cors({
    origin: 'https://govtechtaaet-swe-linuschui.onrender.com/',
    methods: ['GET', 'POST'],
    credentials: true,
}));
// SERVER
const { Server } = require("socket.io")
const http = require('http');
const server = http.createServer(app);
const allowedOrigins = [
    "https://govtechtaaet-swe-linuschui.onrender.com",
    "http://localhost:3000",
];
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST"]
    }
});

// STORE SESSIONS
const games = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

	// HANDLE NEW PLAYERS
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
				io.to(gameId).emit('gameStart', { message: `Game start!\n${game.players[0].name} (Symbol : X) vs ${game.players[1].name} (Symbol : O).\nCurrent Turn: ${game.currentTurn}, Player's Turn : ${game.players[0].name} `, game });
			} else { 
				io.to(gameId).emit('waiting', { message: "LOOKING FOR ANOTHER PLAYER TO JOIN!" });
			}
		} else {
			socket.emit('gameFull', { message: "Game is already full." });
		}
		socket.emit('playerSymbol', { symbol: game.players[game.players.length - 1].symbol });
	});

	// HANDLE PLAYER MOVES
	socket.on('makeMove', ({ gameId, index }) => {
     	 const game = games[gameId];

		// Check if game and players exist
		if (game && game.players) {
          	const player = game.players.find(p => p.id === socket.id);
          
          	if (player && game.board[index] === null && game.currentTurn === player.symbol) {
				// Make the move and update the board
				game.board[index] = player.symbol;
				game.currentTurn = game.currentTurn === 'X' ? 'O' : 'X';

				// screen reader
				const position = getPositionFromIndex(index);
				const currentState = game.board.map((value, idx) => {
					const pos = getPositionFromIndex(idx);
					return `${pos}: ${value === null ? "empty" : value}`;
				}).join(', ');
	
				const moveMessage = `Player ${player.name} made a move at ${position}.\nCurrent state of the board is \n${currentState}}.`;

				io.to(gameId).emit('gameState', game);
				io.to(gameId).emit('customMessage', { message: moveMessage });

				// check for win or tie
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

  	// HANDLE DISCONNECT
  	socket.on('disconnect', () => {
    	console.log(`User disconnected: ${socket.id}`);
		for (const gameId in games) {
            const game = games[gameId];
            const player = game.players.find(p => p.id === socket.id);
            if (player) {
                game.players = game.players.filter(p => p.id !== socket.id);
                if (game.players.length === 1) {
                    io.to(gameId).emit('opponentDisconnect', { message: "Your opponent has disconnected. Click on the button to start a new game" });
					delete games[gameId];
				}
            }
        }
  	});
});

// HELPER FUNCTION TO CHECK FOR WINNER
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

// HELPER FUNCTION TO GET READABLE POSITIONS 
const getPositionFromIndex = (index) => {
    const positions = [
        "top left", "top middle", "top right",
        "middle left", "middle middle", "middle right",
        "bottom left", "bottom middle", "bottom right"
    ];
    return positions[index];
};

// START SERVER
server.listen(port, () => {
  	console.log(`Server running on http://localhost:${port}`);
});
