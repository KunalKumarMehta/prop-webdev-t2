import { clamp } from "./utils.js";

export const TICK_RATE = 2000; // Decay every 2 seconds implies 2ms? No, 2000ms.
// Blueprint says "Every 1–3 seconds". Let's go with 3 seconds (3000ms) for a chill pace or 2000ms.

const INITIAL_STATE = {
  petName: "",
  isAlive: true,
  age: 0, // in ticks
  stats: {
    hunger: 100, // 0 = Starving
    fun: 100, // 0 = Depressed
    energy: 100, // 0 = Passed out
  },
  history: [], // Array of log strings
  gameStarted: false,
  gameOver: false,
  lastTick: Date.now(),
};

let gameState = { ...INITIAL_STATE };

// Deep Copy Helper if we needed it, but simple spread is ok for now unless nested objects get complex.
// Actually stats is nested, so spread on INITIAL_STATE is shallow for stats.

function resetState() {
  gameState = {
    ...INITIAL_STATE,
    stats: { ...INITIAL_STATE.stats },
    history: [],
  };
}

// Load from local storage
export function loadState() {
  const saved = localStorage.getItem("cyberPetState");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Merge checks could be here, but for now trust the save
      if (parsed.isAlive) {
        gameState = parsed;
        return true;
      }
    } catch (e) {
      console.error("Failed to load save", e);
    }
  }
  return false;
}

export function saveState() {
  localStorage.setItem("cyberPetState", JSON.stringify(gameState));
}

export function getState() {
  return gameState;
}

export function startGame(name) {
  resetState();
  gameState.petName = name;
  gameState.gameStarted = true;
  gameState.isAlive = true;
  gameState.gameOver = false;
  addToHistory(`You hatched ${name}!`);
  saveState();
}

export function tick() {
  if (!gameState.isAlive || !gameState.gameStarted || gameState.gameOver)
    return;

  gameState.age++;

  // Decay stats
  gameState.stats.hunger = clamp(gameState.stats.hunger - 2, 0, 100);
  gameState.stats.fun = clamp(gameState.stats.fun - 2, 0, 100);
  gameState.stats.energy = clamp(gameState.stats.energy - 1, 0, 100);

  // Check Death Condition (Hunger 0)
  if (gameState.stats.hunger <= 0) {
    handleGameOver("hunger");
  }

  // Auto-game over if others hit 0? Project says "Hunger hits 0 -> System stops loop".
  // "0 = Passed out" for energy might just prevent playing?
  // Let's stick to Hunger = Death for now based on "Hunger hits 0" scenario in blueprint.

  saveState();
}

function handleGameOver(reason) {
  gameState.isAlive = false;
  gameState.gameOver = true;
  if (reason === "hunger") {
    addToHistory(`${gameState.petName} starved to death...`);
  }
  saveState();
}

export function interact(action) {
  if (!gameState.isAlive || gameState.gameOver) return;

  switch (action) {
    case "feed":
      if (gameState.stats.hunger >= 100) {
        addToHistory(`${gameState.petName} is too full to eat.`);
        return false;
      }
      gameState.stats.hunger = clamp(gameState.stats.hunger + 20, 0, 100);
      gameState.stats.energy = clamp(gameState.stats.energy - 5, 0, 100);
      addToHistory(`Fed ${gameState.petName}. Yummy!`);
      break;
    case "play":
      if (gameState.stats.energy <= 10) {
        addToHistory(`${gameState.petName} is too tired to play.`);
        return false;
      }
      gameState.stats.fun = clamp(gameState.stats.fun + 20, 0, 100);
      gameState.stats.energy = clamp(gameState.stats.energy - 10, 0, 100); // Playing is tiring
      gameState.stats.hunger = clamp(gameState.stats.hunger - 5, 0, 100); // Playing makes you hungry
      addToHistory(`Played with ${gameState.petName}. So fun!`);
      break;
    case "sleep":
      gameState.stats.energy = clamp(gameState.stats.energy + 40, 0, 100);
      gameState.stats.hunger = clamp(gameState.stats.hunger - 10, 0, 100); // Sleeping digests food
      addToHistory(`${gameState.petName} took a nap.`);
      break;
  }
  saveState();
  return true;
}

export function addToHistory(msg) {
  gameState.history.unshift(msg);
  if (gameState.history.length > 10) {
    gameState.history.pop();
  }
}
