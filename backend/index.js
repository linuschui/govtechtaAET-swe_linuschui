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
const io = new Server(server, { cors: { origin: "http://localhost:3000" } });
io.on('connection', socket => {
    console.log(`User connected: ${socket.id}`);
    // join game
    socket.on('joinGame', ({ sessionId, player }) => {
        socket.join(sessionId);
        io.to(sessionId).emit('message', `${player} has joined the game!`);
    });
    // make move
    socket.on('makeMove', ({ sessionId, move }) => {
       // to implement
        io.to(sessionId).emit('moveMade', move);
    });
    // disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
// DEFAULT ENDPOINT
app.get("/", async (req, res) => {
    res.json({
      message: "200 OK",
    });
});