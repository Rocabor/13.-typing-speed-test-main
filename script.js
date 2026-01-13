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
let currentMode = "Timed (30s)";
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

  // Cargar texto inicial
  loadTextForDifficulty(currentDifficulty);
});

// Configurar record personal
function updatePersonalBestDisplay() {
  pbScoreEl.textContent = `${personalBest} WPM`;
}

// Configurar dropdowns
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

// control de dificultad y modo de tiempo
function setupDropdown(options, button, dropdown, updateCallback) {
    options.forEach((option) => {
        option.addEventListener("click", () => {
            const value = option.getAttribute("data-value");
            
            // Actualizar selección visual (Clases y ARIA)
            options.forEach(opt => {
                opt.classList.remove("active");
                opt.setAttribute("aria-selected", "false");
            });
            option.classList.add("active");
            option.setAttribute("aria-selected", "true");

            // Actualizar UI del botón y cerrar dropdown
            button.querySelector(".btn-text").textContent = value;
            button.setAttribute("aria-expanded", "false");
            button.querySelector(".arrow").style.transform = "rotate(0deg)";
            dropdown.style.display = "none";

            // Ejecutar lógica específica
            updateCallback(value.toLowerCase());
        });
    });
}

// Uso para Dificultad
setupDropdown(difficultyOptions, difficultyMobileBtn, dropdownDifficulty, (value) => {
    currentDifficulty = value;
    if (!isTestActive && !isTestComplete) {
        loadTextForDifficulty(currentDifficulty);
    }
});

// Uso para Modo
setupDropdown(modeOptions, modeMobileBtn, dropdownMode, (value) => {
    currentMode = value;
});


// Cargar archivo data.json, segun la seleccion de dificultad, muestra el texto
async function loadTextForDifficulty(difficulty) {
  try {
    const response = await fetch("data.json");
    const data = await response.json();
    const texts = data[difficulty];

    if (texts && texts.length > 0) {
      // Seleccionar texto aleatorio
      const randomIndex = Math.floor(Math.random() * texts.length);
      currentText = texts[randomIndex].text;

      // Mostrar texto
      displayText();
    }
  } catch (error) {
    console.error("Error loading text:", error);
    currentText = "Error loading text. Please try again.";
    displayText();
  }
}

function displayText() {
  if (!textInputEl) return;

  // Limpiar contenido
  textInputEl.innerHTML = "";

  // Crear elementos para cada carácter
  for (let i = 0; i < currentText.length; i++) {
    const charSpan = document.createElement("span");
    charSpan.textContent = currentText[i];
    charSpan.className = "char";
    charSpan.id = `char-${i}`;
    textInputEl.appendChild(charSpan);
  }

  // Establecer cursor inicial
  updateCursor();

  // Si el test no está activo, aplicar blur
  if (!isTestActive) {
    textInputEl.style.filter = "blur(16px)";
  } else {
    textInputEl.style.filter = "none";
  }
}

function updateCursor() {
  // Remover cursor anterior
  document.querySelectorAll(".cursor").forEach((el) => el.classList.remove("cursor"));

  // Agregar cursor en la posición actual
  const currentCharEl = document.getElementById(`char-${currentIndex}`);
  if (currentCharEl) {
    currentCharEl.classList.add("cursor");
  }
}
