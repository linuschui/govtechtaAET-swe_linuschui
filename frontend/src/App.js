import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import "./App.css"
import ReactLoading from "react-loading";
const socket = io('http://localhost:3500');

const App = () => {
	// PLAYER DETAILS
    const [gameId, setGameId] = useState("1");
    const [playerName, setPlayerName] = useState("");
	// GAME DETAILS
    const [isGameStarted, setIsGameStarted] = useState(false);
	const [isWaiting, setIsWaiting] = useState(false);
    const [board, setBoard] = useState(Array(9).fill(null));
	const [playerSymbol, setPlayerSymbol] = useState("");
	const [currentSymbol, setCurrentSymbol] = useState("X");
	const [winner, setWinner] = useState(null);
	const [disconnect, setDisconnect] = useState(false);
	const positions = [
		"top left", "top middle", "top right",
		"middle left", "middle middle", "middle right",
		"bottom left", "bottom middle", "bottom right"
	];
	// GAME MESSAGES
    const [message, setMessage] = useState("");
	const [helperMessage, setHelperMessage] = useState("");

	// COMMUNICATE WITH BACKEND
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
			announceHelperMessage(data.message);
            setIsGameStarted(true);
            setIsWaiting(false);
			setWinner(null); 
        });

        socket.on('gameState', (game) => {
            setBoard(game.board);
			setCurrentSymbol(game.currentTurn);
            setMessage(`Turn: ${game.currentTurn}`);
        });

		socket.on('customMessage', (data) => {
			setHelperMessage(data.message);
			announceHelperMessage(data.message);
		});

		socket.on('opponentDisconnect', (data) => {
			setHelperMessage(data.message);
			announceHelperMessage(data.message);
			setDisconnect(true);
		})

        socket.on('gameEnd', ({ winner }) => {
			const endMessage = winner ? `Player ${winner} has won! Congratulations!` : "No one won, it's a tie!";
			setWinner(winner);
			setMessage(endMessage);
			announceHelperMessage(endMessage);
        });

		socket.on('invalidGame', (data) => {
			setMessage("Invalid game ID. Please try again.");
			announceHelperMessage("Invalid game ID. Please try again.");
		});
	
		socket.on('gameFull', (data) => {
			setMessage("Game is already full. Unable to join.");
			announceHelperMessage("Game is already full. Unable to join. Please select another game id");
			setIsGameStarted(false);
		});

        return () => {
            socket.off('waiting');
            socket.off('gameStart');
            socket.off('gameState');
            socket.off('gameEnd');
        };
    }, []);

	// JOIN GAME
    const joinGame = () => {
        socket.emit('joinGame', { gameId, playerName });
    };
	// MAKE MOVE
    const makeMove = (index, board) => {
        if (isGameStarted) {
			announceMoveMade(index, board)
            socket.emit('makeMove', { gameId, index });
        }
    };
	// RESET GAME
	const resetGame = () => {
		// PLAYER DETAILS
		setGameId("1");
		setPlayerName(playerName);
		// GAME DETAILS
		setIsGameStarted(false);
		setIsWaiting(false);
		setBoard(Array(9).fill(null));
		setPlayerSymbol("");
		setCurrentSymbol("X");
		setWinner(null);
		setDisconnect(false);
        setMessage("");
		setHelperMessage("");
    };

	// HELPER FUNCTIONS FOR SCREEN READER
	const announceCellState = (cellIndex, board) => {
		speechSynthesis.cancel();
		const position = positions[cellIndex];
		const state = board[cellIndex] === null ? "empty" : `occupied by ${board[cellIndex]}`;
		const message = `This cell is ${position} and is currently ${state}.`;
		const speech = new SpeechSynthesisUtterance(message);
		speechSynthesis.speak(speech);
	};

	const announceMoveMade = (cellIndex, board) => {
		speechSynthesis.cancel();
		if (playerSymbol === currentSymbol) {
			const speech = new SpeechSynthesisUtterance(`You selected ${positions[cellIndex]}.`);
			speechSynthesis.speak(speech);
		} else {
			const speech = new SpeechSynthesisUtterance("It is not your turn, please wait");
			speechSynthesis.speak(speech);
		}
	};

	const announceHelperMessage = (message) => {
		speechSynthesis.cancel();
		const speech = new SpeechSynthesisUtterance(message);
		speechSynthesis.speak(speech);
	}

    return (
        <div className="app-container">
            <h1>tic tac toe</h1>
			{/* GAME HAS NOT STARTED */}
            {!isGameStarted ? (
                <div className="content-container">
					{isWaiting ? (
						<div className="waiting-container">
							<div className="waiting-header">
								<h5>{playerName}</h5>
							</div>
							<div className="waiting-subheader">
								<h5>Game ID : {gameId}</h5>
							</div>
							<p>hello {playerName}!</p>
							<p>{message}</p>
							<div className="waiting-load">
								<ReactLoading type="bars" color="black" height={'20%'} width={'20%'} />
								<ReactLoading type="bars" color="black" height={'20%'} width={'20%'} />
								<ReactLoading type="bars" color="black" height={'20%'} width={'20%'} />
								<ReactLoading type="bars" color="black" height={'20%'} width={'20%'} />
								<ReactLoading type="bars" color="black" height={'20%'} width={'20%'} />
								<ReactLoading type="bars" color="black" height={'20%'} width={'20%'} />
							</div>
						</div>
					) : (
						<div className="input-container">
							<div className="input-grid-container">
								<div className="input-header-left">
									ENTER YOUR NAME
								</div>
								<div className="input-header-right">
									ENTER GAME ID
								</div>
								{/* screen reader */}
								<input
									type="text"
									placeholder="name"
									value={playerName}
									onChange={(e) => setPlayerName(e.target.value)}
									aria-required="true"
								/>
								<input
									type="text"
									placeholder="game id"
									value={gameId}
									onChange={(e) => setGameId(e.target.value)}
									aria-required="true"
								/>
							</div>
							<button className="join-button" onClick={joinGame} disabled={!playerName} aria-label="Join Game">
								Join Game
							</button>
						</div>
					)}
                </div>
			// GAME STARTED, OPPONENT ONLINE
            ) : !disconnect ? (
                <div className="game-container">
					<div className="waiting-header">
						<h5>Playing As : {playerName}</h5>
					</div>
					<div className="waiting-subheader">
						<h5>Game ID : {gameId}</h5>
						<h5>Your Symbol: {playerSymbol}</h5>
					</div>
					<div className="app-helper-message-container">
						<h4>{message}</h4>
					</div>
					<div className="app-helper-message-container">
						<h4>{helperMessage}</h4>
					</div>
                    <div className="board-container">
                        {board.map((value, index) => (
                            <button className="board-button"
                                key={index}
								// screen reader
                                onClick={() => makeMove(index, board)}
								onFocus={() => announceCellState(index, board)}
								onMouseEnter={() => announceCellState(index, board)}		
								aria-label={`Make move in position ${positions[index]}`}
								role="gridcell"
								tabIndex={0}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>
			// GAME STARTED, OPPONENT DISCONNECTED
            ) : (
				<div className="reset-container">
					<div className="app-helper-message-container">
						<h4>{helperMessage}</h4>
					</div>
                    <button  className="reset-button" onClick={resetGame} aria-label="Start New Game">
                        Start New Game
                    </button>
                </div>
			)}
			{/* GAME ENDED */}
			{winner && (
                <div className="reset-container">
                    <button  className="reset-button" onClick={resetGame} aria-label="Start New Game">
                        Start New Game
                    </button>
                </div>
            )}
        </div>
    );
};

export default App;
