const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve files from the 'public' folder
app.use(express.static('public'));

let rooms = {};

// --- GAME LOGIC (Server Side) ---
function calculateStrikerResult(secret, guess) {
    let strikes = 0;
    let balls = 0;
    
    // Check Strikes (Correct Number, Correct Place)
    for (let i = 0; i < 3; i++) {
        if (guess[i] === secret[i]) {
            strikes++;
        }
    }

    // Check Balls (Correct Number, Wrong Place)
    for (let i = 0; i < 3; i++) {
        // If the guess digit exists in secret AND is not a strike at this position
        if (secret.includes(guess[i]) && guess[i] !== secret[i]) {
            balls++;
        }
    }

    if (strikes === 0 && balls === 0) return { text: "3 OUT!", strikes: 0 };
    return { text: `${strikes}S ${balls}B`, strikes: strikes };
}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('createGame', (roomCode) => {
        if (rooms[roomCode]) {
            socket.emit('errorMsg', 'Room already exists!');
            return;
        }
        socket.join(roomCode);
        rooms[roomCode] = { players: [socket.id], secrets: {}, turnIndex: 0 };
        socket.emit('gameCreated', roomCode);
    });

    socket.on('joinGame', (roomCode) => {
        const room = rooms[roomCode];
        if (!room || room.players.length >= 2) {
            socket.emit('errorMsg', 'Room full or invalid!');
            return;
        }
        socket.join(roomCode);
        room.players.push(socket.id);
        io.to(roomCode).emit('startGame');
    });

    socket.on('submitSecret', ({ roomCode, secret }) => {
        const room = rooms[roomCode];
        if (!room) return;
        
        room.secrets[socket.id] = secret;

        // If both players have submitted secrets
        if (Object.keys(room.secrets).length === 2) {
            io.to(roomCode).emit('bothSecretsReady');
            // Player 1 starts
            io.to(roomCode).emit('turnChange', room.players[0]);
        }
    });

    socket.on('makeGuess', ({ roomCode, guess }) => {
        const room = rooms[roomCode];
        if (!room) return;

        // Identify Opponent
        const opponentId = room.players.find(id => id !== socket.id);
        const opponentSecret = room.secrets[opponentId];

        const result = calculateStrikerResult(opponentSecret, guess);

        // Broadcast result to both
        io.to(roomCode).emit('guessResult', {
            guesser: socket.id,
            guess: guess,
            result: result
        });

        if (result.strikes === 3) {
            io.to(roomCode).emit('gameOver', { winner: socket.id });
            delete rooms[roomCode];
        } else {
            // Switch Turn
            io.to(roomCode).emit('turnChange', opponentId);
        }
    });

    socket.on('disconnect', () => {
        // Cleanup if a player leaves
        for (const code in rooms) {
            if (rooms[code].players.includes(socket.id)) {
                io.to(code).emit('errorMsg', 'Opponent disconnected.');
                delete rooms[code];
            }
        }
    });
});

// Use the port Render provides, or 3000 locally
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});