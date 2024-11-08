# govtechtaAET-swe_linuschui

## 1	Setting Up

Step 1 : Create a new folder and open VSCode in that folder

Step 2 : Open terminal in VSCode (windows : control + J, macOS, command + J)

Step 3 : Run this command in terminal `git clone https://github.com/linuschui/govtechtaAET-swe_linuschui.git`

Step 4 : Navigate to the frontend and backend folders (`cd frontend` / `cd backend`)

Step 5 : Run command `npm i` to install node modules in both frontend and backend folders

## 2	Running The Application

### 2.1	Backend

Run command `npm run start` to start backend

Code is hosted on localhost:3500

### 2.2	Frontend

Run command `npm start` to start frontend

Code is hosted on localhost:3000

### 2.3 Notes

You will need to commment out the line 6 and uncomment line 5 in `/frontend/src/App.js` to  run the application locally
![Edits](./editing.png)

## 3	Playing The Game

Visit https://govtechtaaet-swe-linuschui.onrender.com/ on 2 different devices (preferably) or on the same device

Enter your name and game ID, ensure game ID used is the same for both devices

The first user will be in the waiting screen, and the game will start once the second user connects

The game rules follow the standard tic-tac-toe rules

The first player to connect will always start first (X) and the second player will be assigned (O)

When the game ends, press "Start New Game" to find a new game

## 4	Design Considerations

I installed NVDA on my device to test out the speech to text functionality.

### 4.1	Design and Infrastructure Decisions

The application leverages a ReactJS frontend with a MySQL backend to store game data efficiently, ensuring a responsive and reliable user experience. Socket.IO is utilized for real-time communication, allowing players to engage seamlessly during game sessions.

### 4.2	Accessibility Considerations

Accessibility was a primary focus throughout the development process. To cater to screen reader users, visual feedback mechanisms were implemented, using the SpeechSynthesisUtterance library to read out player moves. Additionally, keyboard navigation was implemented to enable users who cannot use a mouse to interact with the game effectively.

## 5	Game Features

Key Feature 1 : When a player makes a move, the move will be read out, followed by the updated state of the board

Key Feature 2 : When it is not the player's turn to make a move, a voice message will be read to inform the user

Key Feature 3 : Player can use the "Tab" key to choose a cell or use his cursor to hover over the cell and a voice message will read the selected cell as well as the state (occupied by X/O or empty)

Key Feature 4 : Player can use the "Enter" button on click on the cell to select the cell on his/her turn

### 6   Architecture Diagram

![Architecture Diagram](./architecture_diagram.png)

### 7   Walkthrough Video

https://drive.google.com/file/d/1tiMBgITeXf4iF8zvbnxkkZ0XeEGNhjFc/view?usp=sharing
