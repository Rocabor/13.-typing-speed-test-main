// Variables globales
let currentText = "";
let startTime = null;
let timerInterval = null;
let isTestActive = false;
let userInput = "";
let currentIndex = 0;
let correctCount = 0;
let incorrectCount = 0;
let currentDifficulty = "easy";
let currentMode = "Timed (60s)";
let isTestComplete = false;
let personalBest = localStorage.getItem("typingPB") ? parseInt(localStorage.getItem("typingPB")) : 0;

// Elementos DOM
const textInputEl = document.getElementById("text-input");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const goAgainBtn = document.getElementById("go-again-btn");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const timeEl = document.getElementById("time");
const wpmCompleteEl = document.getElementById("wpm-complete");
const accuracyCompleteEl = document.getElementById("accuracy-complete");
const correctEl = document.getElementById("Correct");
const incorrectEl = document.getElementById("Incorrect");
const pbScoreEl = document.getElementById("pb-score");
const mainContent = document.querySelector(".main-content");
const testCompleteSection = document.querySelector(".test-complete");

// Elementos de dropdown
const difficultyMobileBtn = document.getElementById("difficulty-mobile-btn");
const modeMobileBtn = document.getElementById("mode-mobile-btn");
const dropdownDifficulty = document.querySelector(".dropdown-difficulty");
const dropdownMode = document.querySelector(".dropdown-mode");
const difficultyOptions = dropdownDifficulty.querySelectorAll(".select");
const modeOptions = dropdownMode.querySelectorAll(".select");

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  // Configurar record personal
  updatePersonalBestDisplay();

  // Configurar dropdowns
  setupDropdowns();

});

function updatePersonalBestDisplay() {
  pbScoreEl.textContent = `${personalBest} WPM`;
}

function setupDropdowns() {
  const toggleDropdown = (btn, dropdown) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      // Invertir el estado de aria-expanded
      const isExpanded = btn.getAttribute("aria-expanded") === "true";
      const newState = !isExpanded;

      btn.setAttribute("aria-expanded", newState);

      // Rotar flecha
      const arrow = btn.querySelector(".arrow");
      if (arrow) {
        arrow.style.transition = "transform 0.2s ease";
        arrow.style.transform = newState ? "rotate(180deg)" : "rotate(0deg)";
      }

      // Mostrar/ocultar dropdown
      dropdown.style.display = newState ? "flex" : "none";
    });
  };

  // Aplicar a cada par de elementos
  toggleDropdown(difficultyMobileBtn, dropdownDifficulty);
  toggleDropdown(modeMobileBtn, dropdownMode);

  // Cerrar al hacer clic fuera
  document.addEventListener("click", () => {
    [difficultyMobileBtn, modeMobileBtn].forEach((btn) => btn.setAttribute("aria-expanded", "false"));
    [dropdownDifficulty, dropdownMode].forEach((dw) => (dw.style.display = "none"));
    document.querySelectorAll(".arrow").forEach((arr) => (arr.style.transform = "rotate(0deg)"));
  });
}



