// Financial Words List
const financialWords = [
    "ASSET", "LIABILITY", "EQUITY", "DIVIDEND", "CAPITAL", "INTEREST", 
    "MORTGAGE", "INFLATION", "REVENUE", "PROFIT", "BUDGET", "CREDIT", 
    "DEBIT", "DEPOSIT", "WITHDRAWAL", "INVESTMENT", "PORTFOLIO", "STOCKS", 
    "BONDS", "FUTURES", "OPTIONS", "MARGIN", "COLLATERAL", "LIQUIDITY", 
    "INSOLVENCY", "BANKRUPTCY", "AMORTIZATION", "DEPRECIATION", "AUDIT", 
    "TAXATION", "DEDUCTION", "EXEMPTION", "CURRENCY", "EXCHANGE", "TREASURY", 
    "YIELD", "MATURITY", "ANNUITY", "PREMIUM", "DEDUCTIBLE", "INSURANCE", 
    "ACTUARY", "FIDUCIARY", "ESCROW", "PRINCIPAL", "DISCOUNT", "VALUATION", 
    "ARBITRAGE", "VOLATILITY", "RECESSION", "DEPRESSION", "DEFLATION", 
    "STAGFLATION", "DERIVATIVE", "HEDGE", "LEVERAGE", "DIVERSIFICATION", 
    "ALLOCATION", "REBALANCING", "COMPOUNDING"
];

const monsters = ["👹", "👺", "👻", "👽", "👾", "🤖", "🎃", "☠️"];

// --- State Management ---
const initialState = {
    screen: 'start', // 'start', 'game', 'gameover'
    score: 0,
    debt: 1000,
    highScore: localStorage.getItem('debtDungeonHighScore') || 0,
    currentWord: '',
    typedChars: '',
    currentMonster: '',
    timer: null,
    interestInterval: null,
    gameStartTime: 0,
    shake: false,
    monsterDying: false
};

// Create a reactive state using Proxy
// Simplification: We will just have a state object and call render() explicitly after changes.
// Using a full Proxy might be overkill but good for learning. Let's stick to explicit updates for clarity given the constraints.
let state = { ...initialState };

// --- Logic Agent ---

function initGame() {
    state = { ...initialState, screen: 'game', gameStartTime: Date.now() };
    state.highScore = localStorage.getItem('debtDungeonHighScore') || 0;
    spawnNewMonster();
    startInterestTimer();
    render();
}

function spawnNewMonster() {
    state.currentWord = financialWords[Math.floor(Math.random() * financialWords.length)];
    state.currentMonster = monsters[Math.floor(Math.random() * monsters.length)];
    state.typedChars = '';
    state.monsterDying = false;
    state.shake = false;
}

function handleTyping(e) {
    if (state.screen !== 'game' || state.monsterDying) return;

    const char = e.key.toUpperCase();
    const targetChar = state.currentWord[state.typedChars.length];

    // Only accept letters
    if (!/^[A-Z]$/.test(char)) return;

    if (char === targetChar) {
        state.typedChars += char;
        if (state.typedChars === state.currentWord) {
            // Word Completed
            handleWordComplete();
        }
    } else {
        // Mistake
        triggerShake();
        state.debt += 50; // Penalty
    }
    render();
}

function handleWordComplete() {
    state.monsterDying = true;
    state.score += 100;
    state.debt = Math.max(0, state.debt - 100); // Pay off debt
    
    // Slight delay to show death animation
    render();
    setTimeout(() => {
        spawnNewMonster();
        render();
    }, 500);

    if (state.debt <= 0) {
        // Win Condition? Or just infinite?
        // Let's make it infinite survival, lower debt is better?
        // Actually "The Debt Dungeon" implies escaping debt.
        // Let's say if Debt reaches 0, you get a huge bonus or level up.
        // For simplicity: Debt increases over time due to "interest".
        // If debt reaches 2000, Game Over.
    }
}

function triggerShake() {
    state.shake = true;
    render();
    setTimeout(() => {
        state.shake = false;
        render(); // clear class
    }, 300);
}

function startInterestTimer() {
    if (state.interestInterval) clearInterval(state.interestInterval);
    state.interestInterval = setInterval(() => {
        if (state.screen !== 'game') return;
        
        // Compound interest!
        const interest = Math.floor(state.debt * 0.05) + 10;
        state.debt += interest;

        if (state.debt >= 2000) {
            endGame();
        }
        render();
    }, 3000); // Every 3 seconds
}

function endGame() {
    clearInterval(state.interestInterval);
    state.screen = 'gameover';
    if (state.score > state.highScore) {
        state.highScore = state.score;
        localStorage.setItem('debtDungeonHighScore', state.highScore);
    }
    render();
}

// --- UI Agent ---

const app = document.getElementById('app');

function render() {
    app.innerHTML = ''; // Clear container

    if (state.screen === 'start') {
        renderStartScreen();
    } else if (state.screen === 'game') {
        renderGameScreen();
    } else if (state.screen === 'gameover') {
        renderGameOverScreen();
    }
}

function renderStartScreen() {
    const container = document.createElement('div');
    container.className = 'screen start-screen';

    const title = document.createElement('h1');
    title.textContent = 'THE DEBT DUNGEON';
    
    const instruct = document.createElement('p');
    instruct.textContent = 'Type the financial words to slay monsters and pay off your debt. Beware of compound interest!';
    
    const startBtn = document.createElement('button');
    startBtn.textContent = 'ENTER DUNGEON';
    startBtn.onclick = initGame;

    container.appendChild(title);
    container.appendChild(instruct);
    container.appendChild(startBtn);
    app.appendChild(container);
}

function renderGameScreen() {
    const container = document.createElement('div');
    container.className = 'screen game-screen';

    // Header (Stats)
    const header = document.createElement('div');
    header.className = 'game-header';

    const debtBox = document.createElement('div');
    debtBox.className = 'stat-box';
    debtBox.innerHTML = `<span class="stat-label">DEBT</span><span class="stat-value" style="color:red">$${state.debt}</span>`;

    const scoreBox = document.createElement('div');
    scoreBox.className = 'stat-box';
    scoreBox.innerHTML = `<span class="stat-label">SCORE</span><span class="stat-value">${state.score}</span>`;
    
    const limitBox = document.createElement('div');
    limitBox.className = 'stat-box';
    limitBox.innerHTML = `<span class="stat-label">LIMIT</span><span class="stat-value">$2000</span>`;

    header.appendChild(scoreBox);
    header.appendChild(debtBox);
    header.appendChild(limitBox);

    // Monster
    const monsterDiv = document.createElement('div');
    monsterDiv.className = 'monster-container';
    const monsterSpan = document.createElement('span');
    monsterSpan.className = `monster ${state.monsterDying ? 'die' : ''}`;
    monsterSpan.textContent = state.currentMonster;
    monsterDiv.appendChild(monsterSpan);

    // Word Display
    const wordDiv = document.createElement('div');
    wordDiv.className = `word-display ${state.shake ? 'shake' : ''}`;
    
    renderWord(wordDiv);

    container.appendChild(header);
    container.appendChild(monsterDiv);
    container.appendChild(wordDiv);
    app.appendChild(container);
}

function renderWord(container) {
    const word = state.currentWord;
    const typed = state.typedChars;

    for (let i = 0; i < word.length; i++) {
        const span = document.createElement('span');
        span.textContent = word[i];
        
        if (i < typed.length) {
            span.className = 'char-correct';
        } else {
            span.className = 'char-default';
        }
        
        if (i === typed.length) {
            span.classList.add('char-active');
        }

        container.appendChild(span);
    }
}

function renderGameOverScreen() {
    const container = document.createElement('div');
    container.className = 'screen game-over-screen';

    const title = document.createElement('h2');
    title.textContent = 'BANKRUPTCY!';

    const result = document.createElement('div');
    result.className = 'result';
    result.innerHTML = `Final Score: ${state.score}<br>High Score: ${state.highScore}`;

    const restartBtn = document.createElement('button');
    restartBtn.textContent = 'TRY AGAIN';
    restartBtn.onclick = initGame;

    container.appendChild(title);
    container.appendChild(result);
    container.appendChild(restartBtn);
    app.appendChild(container);
}

// Global Event Listener
window.addEventListener('keydown', handleTyping);

// Initial Render
render();