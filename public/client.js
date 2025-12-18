const socket = io();

// State
let mode = ''; // 'computer' or 'online'
let mySecret = '';
let isMyTurn = false;
let roomCode = '';

// AI Globals
let computerCandidates = [];
let computerSecret = '';

// --- UI UTILS ---
function show(id) { document.getElementById(id).classList.remove('hidden'); }
function hide(id) { document.getElementById(id).classList.add('hidden'); }
function log(name, guess, resultText) {
    const div = document.createElement('div');
    div.className = 'log-entry';
    const cls = resultText === '3 OUT!' ? 'res-out' : 'res-hit';
    div.innerHTML = `<span>${name}: ${guess}</span> <span class="${cls}">${resultText}</span>`;
    document.getElementById('logs').prepend(div);
}

// --- VALIDATION ---
function isValid(seq) {
    if (!/^\d{3}$/.test(seq)) return false;
    return new Set(seq).size === 3; // Unique digits only
}

// --- SETUP ---
function startComputerMode() {
    mode = 'computer';
    hide('menu');
    show('setup');
    
    // Init AI candidates (All 720 unique permutations)
    computerCandidates = [];
    for (let i = 0; i < 1000; i++) {
        let s = i.toString().padStart(3, '0');
        if (isValid(s)) computerCandidates.push(s);
    }
}

function createRoom() {
    roomCode = document.getElementById('roomInput').value.trim();
    if (!roomCode) return alert("Enter a room name");
    mode = 'online';
    socket.emit('createGame', roomCode);
}

function joinRoom() {
    roomCode = document.getElementById('roomInput').value.trim();
    if (!roomCode) return alert("Enter a room name");
    mode = 'online';
    socket.emit('joinGame', roomCode);
}

function confirmSecret() {
    const val = document.getElementById('secretInput').value;
    if (!isValid(val)) return alert("Must be 3 UNIQUE digits!");
    
    mySecret = val;
    hide('setup');
    show('game');

    if (mode === 'online') {
        document.getElementById('statusMsg').innerText = "Waiting for opponent...";
        socket.emit('submitSecret', { roomCode, secret: mySecret });
    } else {
        // Computer Mode
        computerSecret = computerCandidates[Math.floor(Math.random() * computerCandidates.length)];
        document.getElementById('statusMsg').innerText = "Your Turn!";
        isMyTurn = true;
    }
}

function submitGuess() {
    if (!isMyTurn) return;
    const val = document.getElementById('guessInput').value;
    if (!isValid(val)) return alert("Invalid guess!");
    
    document.getElementById('guessInput').value = ''; // Clear input

    if (mode === 'online') {
        socket.emit('makeGuess', { roomCode, guess: val });
        isMyTurn = false;
        document.getElementById('statusMsg').innerText = "Opponent thinking...";
    } else {
        playComputerRound(val);
    }
}

// --- COMPUTER LOGIC ---
function playComputerRound(playerGuess) {
    // 1. Check Player
    const res = getResult(computerSecret, playerGuess);
    log('You', playerGuess, res.text);
    
    if (res.strikes === 3) {
        alert("YOU WIN!");
        location.reload();
        return;
    }

    isMyTurn = false;
    document.getElementById('statusMsg').innerText = "Computer thinking...";

    // 2. Computer Turn (Delay 1s)
    setTimeout(() => {
        const aiGuess = computerCandidates[Math.floor(Math.random() * computerCandidates.length)];
        const aiRes = getResult(mySecret, aiGuess);
        log('AI', aiGuess, aiRes.text);

        if (aiRes.strikes === 3) {
            alert(`AI WINS! (It had ${computerSecret})`);
            location.reload();
            return;
        }

        // 3. AI Filter (Pruning)
        computerCandidates = computerCandidates.filter(c => {
            const r = getResult(c, aiGuess);
            return r.strikes === aiRes.strikes && r.balls === aiRes.balls; // Must match observed result
        });

        isMyTurn = true;
        document.getElementById('statusMsg').innerText = "Your Turn!";
    }, 1000);
}

function getResult(secret, guess) {
    let s = 0, b = 0;
    for (let i = 0; i < 3; i++) {
        if (guess[i] === secret[i]) s++;
    }
    for (let i = 0; i < 3; i++) {
        if (secret.includes(guess[i]) && guess[i] !== secret[i]) b++;
    }
    if (s === 0 && b === 0) return { text: "3 OUT!", strikes: 0, balls: 0 };
    return { text: `${s}S ${b}B`, strikes: s, balls: b };
}

// --- SOCKET EVENTS ---
socket.on('gameCreated', () => { hide('menu'); show('setup'); });
socket.on('startGame', () => { hide('menu'); show('setup'); });
socket.on('errorMsg', (msg) => alert(msg));
socket.on('bothSecretsReady', () => { /* Wait for turn */ });

socket.on('turnChange', (id) => {
    isMyTurn = (id === socket.id);
    document.getElementById('statusMsg').innerText = isMyTurn ? "YOUR TURN!" : "Opponent's Turn";
    document.getElementById('inputArea').classList.toggle('my-turn', isMyTurn);
});

socket.on('guessResult', (data) => {
    const name = (data.guesser === socket.id) ? "You" : "Opponent";
    log(name, data.guess, data.result.text);
});

socket.on('gameOver', (data) => {
    setTimeout(() => {
        alert(data.winner === socket.id ? "YOU WIN!" : "YOU LOSE!");
        location.reload();
    }, 100);
});