import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

import "./App.css"
import ReactLoading from "react-loading";

const socket = io('http://localhost:3500');

const App = () => {
    const [gameId, setGameId] = useState("1");
    const [playerName, setPlayerName] = useState("");
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [board, setBoard] = useState(Array(9).fill(null));
    const [message, setMessage] = useState("");
    const [isWaiting, setIsWaiting] = useState(false);
	const [playerSymbol, setPlayerSymbol] = useState("");
	// announce winner
	const [winner, setWinner] = useState(null);

    useEffect(() => {
        socket.on('waiting', (data) => {
            setMessage(data.message);
            setIsWaiting(true);
        });

		socket.on('playerSymbol', (data) => {
            setPlayerSymbol(data.symbol);
        });

        socket.on('gameStart', (data) => {
            setMessage(data.message);
            setIsGameStarted(true);
            setIsWaiting(false);
			setWinner(null); 
        });

        socket.on('gameState', (game) => {
            setBoard(game.board);
            setMessage(`Turn: ${game.currentTurn}`);
        });

        socket.on('gameEnd', ({ winner }) => {
			setWinner(winner)
            setMessage(winner ? `Winner: ${winner}` : "It's a Tie!");
        });

        return () => {
            socket.off('waiting');
            socket.off('gameStart');
            socket.off('gameState');
            socket.off('gameEnd');
        };
    }, []);

    const joinGame = () => {
        socket.emit('joinGame', { gameId, playerName });
    };

    const makeMove = (index) => {
        if (isGameStarted) {
            socket.emit('makeMove', { gameId, index });
        }
    };

	const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsGameStarted(false);
        setMessage("");
		setWinner(null); 
    };

    return (
        <div className="app-container">
            <h1>tic tac toe</h1>
            {!isGameStarted && (
                <div className="app-body">
					{isWaiting ? (
						<div className="app-waiting">
							<div className="app-details-1">
								<h3>{playerName}</h3>
							</div>
							<div className="app-details-2">
								<h3>Game ID : {gameId}</h3>
							</div>
							<p>hello {playerName}!</p>
							<p>{message}</p>
							<div className="app-loading">
								<ReactLoading type="bars" color="black" height={'20%'} width={'20%'} />
								<ReactLoading type="bars" color="black" height={'20%'} width={'20%'} />
								<ReactLoading type="bars" color="black" height={'20%'} width={'20%'} />
								<ReactLoading type="bars" color="black" height={'20%'} width={'20%'} />
								<ReactLoading type="bars" color="black" height={'20%'} width={'20%'} />
								<ReactLoading type="bars" color="black" height={'20%'} width={'20%'} />
							</div>
						</div>
					) : (
						<div className="app-input">
							<div className="app-input-container">
								<div className="app-input-header-1">
									ENTER YOUR NAME
								</div>
								<div className="app-input-header-2">
									ENTER GAME ID
								</div>
								<input
									type="text"
									placeholder="name"
									value={playerName}
									onChange={(e) => setPlayerName(e.target.value)}
								/>
								<input
									type="text"
									placeholder="game id"
									value={gameId}
									onChange={(e) => setGameId(e.target.value)}
								/>
							</div>
							<button className="app-button" onClick={joinGame} disabled={!playerName}>
								Join Game
							</button>
						</div>
					)}
                </div>
            )}
            {isGameStarted && (
                <div className="app-game-container">
					<div className="app-details-1">
						<h3>{playerName}</h3>
					</div>
					<div className="app-details-2">
						<h3>Game ID : {gameId}</h3>
						<h3>Your Symbol: {playerSymbol}</h3>
					</div>
                    <h4>{message}</h4>
                    <div className="app-game">
                        {board.map((value, index) => (
                            <button className="app-game-button"
                                key={index}
                                onClick={() => makeMove(index)}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>
            )}
			{winner && (
                <div className="reset-button-container">
                    <button  className="reset-button" onClick={resetGame}>
                        Start New Game
                    </button>
                </div>
            )}
        </div>
    );
};

export default App;
