import {
  startGame,
  tick,
  interact,
  getState,
  loadState,
  TICK_RATE,
} from "./state.js";
import { render, showFloatingText } from "./ui.js";

// --- Audio System ---
let audioCtx;
const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
};

function playTone(freq, type, duration) {
  if (!audioCtx) initAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.00001,
    audioCtx.currentTime + duration,
  );
  osc.stop(audioCtx.currentTime + duration);
}

function triggerAnim(cls) {
  const pet = document.querySelector(".pet-sprite");
  if (pet) {
    pet.classList.remove("bounce");
    void pet.offsetWidth; // Reflow
    pet.classList.add(cls);
    // Remove class after anim to return to bounce (optional, but good for cleanup)
    setTimeout(() => {
      if (pet) {
        pet.classList.remove(cls);
        pet.classList.add("bounce");
      }
    }, 1000);
  }
}

// --- Initialization ---

function init() {
  // Attempt to load save
  const loaded = loadState();
  // If loaded and alive, we are in game state, render will handle it.
  // Logic loop needs to start regardless if we are in game.

  // Initial Render
  render();

  // Global Event Listener (Event Delegation)
  document.getElementById("app").addEventListener("click", handleGlobalClick);

  // Start Game Loop
  setInterval(gameLoop, TICK_RATE);
}

// --- Game Loop ---

function gameLoop() {
  const state = getState();
  if (state.gameStarted && state.isAlive && !state.gameOver) {
    tick();
    render(); // Re-render on tick updates
  }
}

// --- Input Handling ---

function handleGlobalClick(e) {
  const target = e.target;
  const state = getState();

  // Start Button
  if (target.id === "start-btn") {
    initAudio(); // Initialize audio context on first user interaction
    const input = document.getElementById("pet-name-input");
    const name = input.value.trim();
    if (name.length > 0 && name.length <= 12) {
      playSound("start");
      startGame(name);
      render();
    } else {
      playSound("error");
      alert("INVALID_NAME_PROTOCOL: Must be 1-12 chars.");
    }
    return;
  }

  // Restart Button
  if (target.id === "restart-btn") {
    // Just reload page or reset state + render start
    // Resetting state in state.js sets gameStarted false
    startGame(""); // Resetting
    // actually startGame expects a name, let's fix this flow.
    // We want to go back to start screen or just restart with new pet?
    // Let's reload page for 'System Reboot' feel or just clear state.
    location.reload();
    return;
  }

  // Game Actions
  if (!state.gameOver && state.gameStarted) {
    if (target.id === "btn-feed") {
      const success = interact("feed");
      if (success) {
        showFloatingText("+20 HUNGER", "pos");
        playSound("happy");
        render();
        triggerAnim("anim-jump");
      } else {
        playSound("refuse");
        render();
        triggerAnim("anim-shake");
      }
    }
    if (target.id === "btn-play") {
      const success = interact("play");
      if (success) {
        showFloatingText("+20 FUN", "pos");
        playSound("happy");
        render();
        triggerAnim("anim-jump");
      } else {
        playSound("refuse");
        render();
        triggerAnim("anim-shake");
      }
    }
    if (target.id === "btn-sleep") {
      const success = interact("sleep");
      if (success) {
        showFloatingText("+40 ENERGY", "pos");
        playSound("sleep");
        render();
        triggerAnim("anim-sleep");
      }
    }
  }
}

// SFX Map
function playSound(key) {
  if (!audioCtx) initAudio();
  switch (key) {
    case "start":
      playTone(440, "square", 0.1);
      setTimeout(() => playTone(880, "square", 0.2), 100);
      break;
    case "happy":
      playTone(523.25, "sine", 0.1); // C5
      setTimeout(() => playTone(659.25, "sine", 0.2), 100); // E5
      break;
    case "refuse":
      playTone(150, "sawtooth", 0.3);
      break;
    case "sleep":
      playTone(300, "triangle", 0.5);
      break;
    case "error":
      playTone(100, "sawtooth", 0.3);
      break;
  }
}

// Boot up
init();
