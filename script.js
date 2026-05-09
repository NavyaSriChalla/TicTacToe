const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const btnPvp = document.getElementById('btn-pvp');
const btnPva = document.getElementById('btn-pva');
const scoreXElement = document.getElementById('score-x');
const scoreOElement = document.getElementById('score-o');
const labelOElement = document.getElementById('label-o');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let mode = 'pvp'; // 'pvp' or 'pva'
let scores = { X: 0, O: 0 };

const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

function initializeGame() {
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    restartBtn.addEventListener('click', restartGame);
    btnPvp.addEventListener('click', () => setMode('pvp'));
    btnPva.addEventListener('click', () => setMode('pva'));
    updateStatus();
}

function setMode(newMode) {
    if (mode === newMode) return;
    mode = newMode;
    
    // Update UI for mode
    btnPvp.classList.toggle('active', mode === 'pvp');
    btnPva.classList.toggle('active', mode === 'pva');
    labelOElement.textContent = mode === 'pva' ? 'AI (O)' : 'Player O';
    
    // Reset scores when switching modes
    scores = { X: 0, O: 0 };
    updateScoreUI();
    restartGame();
}

function handleCellClick(e) {
    const cell = e.target;
    const cellIndex = parseInt(cell.getAttribute('data-index'));

    if (board[cellIndex] !== '' || !gameActive) {
        return;
    }

    updateCell(cell, cellIndex, currentPlayer);
    checkResult();

    if (gameActive && mode === 'pva' && currentPlayer === 'O') {
        // Delay AI move slightly for better UX
        setTimeout(makeAIMove, 400);
    }
}

function updateCell(cell, index, player) {
    board[index] = player;
    cell.classList.add(player.toLowerCase());
}

function changePlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();
}

function updateStatus() {
    if (!gameActive) return;
    statusText.textContent = `${currentPlayer === 'X' ? "Player X" : (mode === 'pva' ? "AI" : "Player O")}'s Turn`;
    statusText.style.color = currentPlayer === 'X' ? '#0ff' : '#f0f';
    statusText.style.textShadow = `0 0 5px ${currentPlayer === 'X' ? '#0ff' : '#f0f'}`;
}

function checkResult() {
    let roundWon = false;
    let winningLine = [];

    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            winningLine = [a, b, c];
            break;
        }
    }

    if (roundWon) {
        statusText.textContent = `${currentPlayer === 'X' ? "Player X" : (mode === 'pva' && currentPlayer === 'O' ? "AI" : "Player O")} Wins!`;
        gameActive = false;
        scores[currentPlayer]++;
        updateScoreUI();
        
        // Highlight winning cells
        winningLine.forEach(index => {
            cells[index].classList.add('winning-cell');
        });
        return;
    }

    if (!board.includes('')) {
        statusText.textContent = 'Draw!';
        statusText.style.color = '#fff';
        statusText.style.textShadow = '0 0 5px #fff';
        gameActive = false;
        return;
    }

    changePlayer();
}

function updateScoreUI() {
    scoreXElement.textContent = scores.X;
    scoreOElement.textContent = scores.O;
}

function restartGame() {
    currentPlayer = 'X';
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    updateStatus();
    cells.forEach(cell => {
        cell.classList.remove('x', 'o', 'winning-cell');
    });
}

// Basic AI (Minimax algorithm for an unbeatable AI)
function makeAIMove() {
    if (!gameActive) return;
    
    let bestScore = -Infinity;
    let move;
    
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    
    const cell = cells[move];
    updateCell(cell, move, 'O');
    checkResult();
}

const scoresMap = {
    'O': 10,
    'X': -10,
    'tie': 0
};

function checkWinnerForMinimax(boardState) {
    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            return boardState[a];
        }
    }
    if (!boardState.includes('')) return 'tie';
    return null;
}

function minimax(boardState, depth, isMaximizing) {
    let result = checkWinnerForMinimax(boardState);
    if (result !== null) {
        return scoresMap[result] - depth; // Subtract depth to favor faster wins
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i] === '') {
                boardState[i] = 'O';
                let score = minimax(boardState, depth + 1, false);
                boardState[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i] === '') {
                boardState[i] = 'X';
                let score = minimax(boardState, depth + 1, true);
                boardState[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Start game
initializeGame();
