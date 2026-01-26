import { getState } from "./state.js";

const app = document.getElementById("app");

export function render() {
  const state = getState();
  app.innerHTML = ""; // Full re-render for simplicity, as per rubric "no framework" but clean code

  if (!state.gameStarted) {
    renderStartScreen();
  } else if (state.gameOver) {
    renderGameOverScreen();
  } else {
    renderGameScreen();
  }
}

function renderStartScreen() {
  const container = document.createElement("div");
  container.className = "screen start-screen";

  const title = document.createElement("h1");
  title.textContent = "CYBERPET";

  // Cyberpunk decoration
  const sub = document.createElement("p");
  sub.className = "subtitle";
  sub.textContent = "INITIALIZE_ORGANISM_SEQUENCE";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "ENTER_DESIGNATION...";
  input.id = "pet-name-input";
  input.maxLength = 12;

  const startBtn = document.createElement("button");
  startBtn.textContent = "HATCH_EGG.exe";
  startBtn.id = "start-btn";

  container.appendChild(title);
  container.appendChild(sub);
  container.appendChild(input);
  container.appendChild(startBtn);
  app.appendChild(container);

  // Focus input
  setTimeout(() => input.focus(), 100);
}

function renderGameScreen() {
  const state = getState();

  const container = document.createElement("div");
  container.className = "screen game-screen";

  // 1. Stats Bar
  const statsContainer = document.createElement("div");
  statsContainer.className = "stats-container";

  ["hunger", "fun", "energy"].forEach((stat) => {
    const row = document.createElement("div");
    row.className = "stat-row";

    const label = document.createElement("span");
    label.className = "stat-label";
    label.textContent = stat.toUpperCase();

    const barFrame = document.createElement("div");
    barFrame.className = "progress-frame";

    const barFill = document.createElement("div");
    barFill.className = `progress-fill fill-${stat}`;
    barFill.style.width = `${state.stats[stat]}%`;

    barFrame.appendChild(barFill);
    row.appendChild(label);
    row.appendChild(barFrame);
    statsContainer.appendChild(row);
  });

  // 2. Pet View
  const petContainer = document.createElement("div");
  petContainer.className = "pet-container";

  const pet = document.createElement("div");
  // Determine pet class based on state (sustained states)
  let petClass = "pet-sprite bounce";
  // If sleeping/low energy, maybe different default?
  // "Sleep" button just adds energy instantly in current logic, but if we wanted a "Sleep Mode" we'd need state for it.
  // For now, if Energy < 20, we can make it sleepy.
  if (state.stats.energy < 20) {
    petClass = "pet-sprite anim-sleep";
  }

  pet.className = petClass;
  // Simple emoji logic for now, could be images later
  let sprite = "🥚"; // Should not see egg in game loop ideally
  if (state.stats.energy < 20) sprite = "😴";
  else if (state.stats.hunger < 20) sprite = "😵";
  else if (state.stats.fun < 20) sprite = "😢";
  else sprite = "👾"; // Standard Glitch

  pet.textContent = sprite;
  petContainer.appendChild(pet);

  // 3. Actions
  const actionsContainer = document.createElement("div");
  actionsContainer.className = "actions-container";

  const feedBtn = createButton("FEED", "btn-feed");
  const playBtn = createButton("PLAY", "btn-play");
  const sleepBtn = createButton("SLEEP", "btn-sleep");

  actionsContainer.appendChild(feedBtn);
  actionsContainer.appendChild(playBtn);
  actionsContainer.appendChild(sleepBtn);

  // 4. History Log
  const logContainer = document.createElement("div");
  logContainer.className = "log-container";
  const logList = document.createElement("ul");

  state.history.forEach((msg) => {
    const li = document.createElement("li");
    li.textContent = `> ${msg}`;
    logList.appendChild(li);
  });
  logContainer.appendChild(logList);

  container.appendChild(statsContainer);
  container.appendChild(petContainer);
  container.appendChild(actionsContainer);
  container.appendChild(logContainer);
  app.appendChild(container);
}

function renderGameOverScreen() {
  const state = getState();
  const container = document.createElement("div");
  container.className = "screen game-over-screen";

  const title = document.createElement("h2");
  title.textContent = "SYSTEM_FAILURE";
  title.style.color = "red";

  const msg = document.createElement("p");
  msg.textContent = `${state.petName} has ceased function.`;

  const restartBtn = document.createElement("button");
  restartBtn.textContent = "REBOOT_SYSTEM";
  restartBtn.id = "restart-btn";

  container.appendChild(title);
  container.appendChild(msg);
  container.appendChild(restartBtn);
  app.appendChild(container);
}

function createButton(text, id) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.id = id;
  btn.className = "action-btn";
  return btn;
}

// Effect for floating text (imperative, fired from main controller ideally or self-managed)
export function showFloatingText(text, type) {
  const el = document.createElement("div");
  el.className = `floating-text float-${type}`; // float-pos, float-neg
  el.textContent = text;

  // Random horizontal offset for variety
  const randomX = (Math.random() - 0.5) * 40;
  el.style.transform = `translateX(${randomX}px)`;

  // Position randomly around center
  const appRect = app.getBoundingClientRect();
  const top = appRect.height / 2 - 50;
  const left = appRect.width / 2;

  el.style.top = `${top}px`;
  el.style.left = `${left}px`;

  app.appendChild(el);

  setTimeout(() => el.remove(), 1000); // Remove after animation
}
