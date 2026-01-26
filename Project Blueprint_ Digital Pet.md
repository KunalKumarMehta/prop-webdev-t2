# **🐾 Project Blueprint: "CyberPet" (Vanilla JS Edition)**

## **1\. Concept Overview**

A browser-based simulation game where users care for a digital creature. The pet has needs (Hunger, Happiness, Energy) that decay over time. The user must interact with the DOM to keep the pet alive.

**Core Challenge:** Managing a real-time state loop while efficiently updating the DOM without a framework.

## **2\. Technical Architecture (Rubric Aligned)**

### **A. The State (Single Source of Truth)**

Instead of relying on the DOM to store data (e.g., reading values from HTML elements), we use a centralized JavaScript object.

const gameState \= {  
    petName: "Glitch",  
    isAlive: true,  
    age: 0, // in 'ticks'  
    stats: {  
        hunger: 100,    // 0 \= Starving  
        fun: 100,       // 0 \= Depressed  
        energy: 100     // 0 \= Passed out  
    },  
    history: \[\] // Array of strings: \["Fed Glitch", "Played catch"\]  
};

### **B. The Logic Layer (The "Brain")**

1. **The Decay Loop (setInterval):** Every 1–3 seconds, a function runs that decreases stats slightly.  
   * *Logic:* state.stats.hunger \-= 2;  
   * *Check:* If any stat \<= 0, trigger gameOver().  
2. **The Interaction Handler:** When a user clicks a button:  
   * Validate input (Can't feed if full).  
   * Update State.  
   * Trigger Animation flag.

### **C. The View Layer (Dynamic DOM Strategy)**

To maximize "DOM Manipulation" marks, **do not hardcode** the dashboard in HTML.

* **Status Bars:** Generate the 3 progress bars using document.createElement().  
* **Log/History:** As the user performs actions, dynamically prepend \<li\> items to a history list. Remove old items if the list \> 10 (showing DOM removal logic).  
* **Pet Sprite:** Change the innerHTML or class of the pet container based on state (e.g., if fun \< 30, render a "sad" emoji or sprite).

## **3\. User Flow & Experience**

### **Phase 1: Onboarding (The Setup)**

1. **Screen:** Simple centered card with an input field and "Hatch Egg" button.  
2. **Action:** User types name \-\> Clicks "Hatch".  
3. **System:**  
   * Validates name length.  
   * Initializes gameState.  
   * Hides "Onboarding" div, generates and shows "Game" div.

### **Phase 2: The Core Loop (gameplay)**

1. **Visuals:**  
   * Pet sits in the center (bouncing animation).  
   * Three colored bars (Red/Hunger, Yellow/Fun, Blue/Energy) sit above.  
   * Action buttons (Feed, Play, Sleep) sit below.  
2. **Action:** User clicks "Feed".  
3. **Reaction:**  
   * **Math:** Hunger \+20 (max 100), Energy \-5 (eating takes effort).  
   * **Visual:** Pet transforms to "Eating" state for 2 seconds.  
   * **Feedback:** A floating "+20" text appears and fades out (created via JS, removed after animation).

### **Phase 3: The End State (Persistence)**

1. **Scenario:** User forgets to feed pet. Hunger hits 0\.  
2. **System:**  
   * Stops the setInterval loop.  
   * Changes Pet UI to "Ghost" or "Tombstone".  
   * Disables action buttons.  
   * Shows "Restart" button.  
3. **Persistence:** Throughout the game, save gameState to localStorage every 5 seconds. On reload, check if a pet exists.

## **4\. Key Rubric Checkpoints**

| Feature | Implementation | Rubric Category |
| :---- | :---- | :---- |
| **Status Bars** | Created via array.forEach() loop inside render(). | **DOM Creation (25%)** |
| **Button Clicks** | One event listener on the parent container (Event Delegation). | **Event Handling (20%)** |
| **Pet Evolution** | If age \> 100, DOM changes image source dynamically. | **Logic & State (20%)** |
| **Save Game** | JSON.stringify(state) to LocalStorage. | **Persistence** |

## **5\. Directory Structure (Clean Code)**

/project-root  
  ├── index.html       (Empty containers: \#app, \#modal-layer)  
  ├── styles.css       (Animations, basic layout)  
  └── src/  
      ├── state.js     (The data object and modification functions)  
      ├── ui.js        (Functions to create/update DOM elements)  
      ├── utils.js     (Helpers like random number generators)  
      └── main.js      (The glue: Event listeners and Game Loop)  
