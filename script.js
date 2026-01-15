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
const startBtn = document.querySelectorAll("#start-btn, #typing-area");
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
const messageTitle = document.getElementById("h1");
const messageText = document.getElementById("text");
const logo = document.getElementById("logo");
const hiddenInput = document.getElementById('hidden-input'); // NUEVO: Para móviles

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

  // Configurar eventos
  setupEventListeners();

  // reset record personal en localStorage
  // localStorage.removeItem("typingPB");
});

// Configurar record personal
function updatePersonalBestDisplay() {
  pbScoreEl.textContent = `${personalBest} WPM`;
}

// Configurar dropdowns
function setupDropdowns() {
  // Función para manejar la lógica de dropdowns
  const handleDropdown = (btn, dropdown, options, callback) => {
    // Cerrar otros dropdowns cuando se abre uno
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      // Obtener el otro dropdown
      const otherBtn = btn === difficultyMobileBtn ? modeMobileBtn : difficultyMobileBtn;
      const otherDropdown = btn === difficultyMobileBtn ? dropdownMode : dropdownDifficulty;

      // Cerrar el otro dropdown
      otherBtn.setAttribute("aria-expanded", "false");
      otherDropdown.style.display = "none";
      otherBtn.querySelector(".arrow").style.transform = "rotate(0deg)";

      // Alternar el dropdown actual
      const isExpanded = btn.getAttribute("aria-expanded") === "true";
      const newState = !isExpanded;

      btn.setAttribute("aria-expanded", newState);
      dropdown.style.display = newState ? "flex" : "none";

      // Rotar flecha
      const arrow = btn.querySelector(".arrow");
      arrow.style.transform = newState ? "rotate(180deg)" : "rotate(0deg)";
      arrow.style.transition = "transform 0.3s";
    });

    // Manejar selección de opciones
    options.forEach((option) => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        const value = option.getAttribute("data-value");

        // Actualizar selección visual
        options.forEach((opt) => {
          opt.classList.remove("active");
          opt.setAttribute("aria-selected", "false");
        });
        option.classList.add("active");
        option.setAttribute("aria-selected", "true");

        // Actualizar texto del botón
        btn.querySelector(".btn-text").textContent = value;

        // Cerrar dropdown
        btn.setAttribute("aria-expanded", "false");
        dropdown.style.display = "none";
        btn.querySelector(".arrow").style.transform = "rotate(0deg)";

        // Ejecutar callback con el valor seleccionado
        if (callback) callback(value);
      });
    });
  };

  // Configurar dropdown de dificultad
  handleDropdown(difficultyMobileBtn, dropdownDifficulty, difficultyOptions, (value) => {
    currentDifficulty = value.toLowerCase();
    if (!isTestActive && !isTestComplete) {
      loadTextForDifficulty(currentDifficulty);
    }
  });

  // Configurar dropdown de modo
  handleDropdown(modeMobileBtn, dropdownMode, modeOptions, (value) => {
    currentMode = value;
  });

  // Cerrar dropdowns al hacer clic fuera
  document.addEventListener("click", () => {
    [difficultyMobileBtn, modeMobileBtn].forEach((btn) => {
      btn.setAttribute("aria-expanded", "false");
      btn.querySelector(".arrow").style.transform = "rotate(0deg)";
    });
    [dropdownDifficulty, dropdownMode].forEach((dw) => {
      dw.style.display = "none";
    });
  });
}

// Cargar archivo data.json, segun la seleccion de dificultad, muestra el texto
async function loadTextForDifficulty(difficulty) {
  try {
    const response = await fetch("data.json");
    const data = await response.json();
    const texts = data[difficulty];

    if (texts && texts.length > 0) {
      const randomIndex = Math.floor(Math.random() * texts.length);
      currentText = texts[randomIndex].text;
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

  textInputEl.innerHTML = "";

  for (let i = 0; i < currentText.length; i++) {
    const charSpan = document.createElement("span");
    charSpan.textContent = currentText[i];
    charSpan.className = "char";
    charSpan.id = `char-${i}`;
    textInputEl.appendChild(charSpan);
  }

  updateCursor();

  if (!isTestActive) {
    textInputEl.style.filter = "blur(16px)";
  } else {
    textInputEl.style.filter = "none";
  }
}

function updateCursor() {
  document.querySelectorAll(".cursor").forEach((el) => el.classList.remove("cursor"));
  const currentCharEl = document.getElementById(`char-${currentIndex}`);
  if (currentCharEl) {
    currentCharEl.classList.add("cursor");
  }
}

// Actualizar tiempo en pantalla
function updateTimeDisplay(time) {
  if (currentMode.startsWith("Timed")) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timeEl.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  } else {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timeEl.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}

// Inicio del test - MODIFICADO PARA MÓVILES
function startTest() {
  if (isTestActive || isTestComplete) return;

  isTestActive = true;
  isTestComplete = false;
  startTime = new Date();
  currentIndex = 0;
  correctCount = 0;
  incorrectCount = 0;
  userInput = "";

  textInputEl.style.filter = "none";

  // Para móviles: activar el textarea oculto
  if (isMobile() && hiddenInput) {
    hiddenInput.classList.add('active');
    setTimeout(() => {
      hiddenInput.focus();
      hiddenInput.value = '';
    }, 100);
  } else {
    // Para desktop: enfocar el área de texto normal
    textInputEl.focus();
  }

  document.querySelector(".test-controls").style.display = "none";
  document.querySelector(".btn-restart-cont").style.display = "flex";

  let timeLimit = null;
  if (currentMode === "Timed (30s)") {
    timeLimit = 30;
  } else if (currentMode === "Timed (60s)") {
    timeLimit = 60;
  }

  startTimer(timeLimit);
  updateStats();
}

// Inicio de contador de tiempo
function startTimer(timeLimit) {
  if (timerInterval) clearInterval(timerInterval);

  let timeLeft = timeLimit;
  let elapsedTime = 0;

  if (timeLimit !== null) {
    updateTimeDisplay(timeLeft);
  } else {
    updateTimeDisplay(0);
  }

  timerInterval = setInterval(() => {
    if (timeLimit !== null) {
      timeLeft--;
      elapsedTime++;
      updateTimeDisplay(timeLeft);

      if (timeLeft <= 0) {
        endTest();
        return;
      }
    } else {
      elapsedTime++;
      updateTimeDisplay(elapsedTime);
    }

    if (currentMode === "Passage" && currentIndex >= currentText.length) {
      endTest();
    }
  }, 1000);
}

// Detectar si es móvil
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function setupEventListeners() {
  // Botón de inicio
  startBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      startTest();
    });
  });

  // Botón de reinicio
  restartBtn.addEventListener("click", (e) => {
    e.preventDefault();
    restartTest();
  });

  // Botón de "ir de nuevo"
  goAgainBtn.addEventListener("click", (e) => {
    e.preventDefault();
    testCompleteSection.style.display = "none";
    mainContent.style.display = "flex";
    restartTest();
  });

  // Hacer clic en el texto para iniciar
  textInputEl.addEventListener("click", (e) => {
    e.preventDefault();
    if (!isTestActive && !isTestComplete) {
      startTest();
    } else if (isTestActive && isMobile() && hiddenInput) {
      hiddenInput.focus();
    }
  });

  // Permitir que el área de texto reciba foco
  textInputEl.setAttribute("tabindex", "0");

  // Eventos de teclado para desktop
  if (!isMobile()) {
    textInputEl.addEventListener("keydown", handleKeyDown);
    textInputEl.addEventListener("keyup", handleKeyUp);
  }

  // Evento para el textarea oculto (móviles)
  if (hiddenInput && isMobile()) {
    hiddenInput.addEventListener('input', handleMobileInput);
    
    hiddenInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    });
  }
}

// Manejar entrada en móviles
function handleMobileInput(e) {
  if (!isTestActive || isTestComplete) return;
  
  const value = hiddenInput.value;
  
  // Backspace
  if (e.inputType === 'deleteContentBackward') {
    if (currentIndex > 0) {
      currentIndex--;
      userInput = userInput.slice(0, -1);
      
      const prevCharEl = document.getElementById(`char-${currentIndex}`);
      if (prevCharEl) {
        prevCharEl.className = "char";
        if (prevCharEl.classList.contains("incorrect")) {
          incorrectCount--;
        } else if (prevCharEl.classList.contains("correct")) {
          correctCount--;
        }
      }
      
      hiddenInput.value = userInput;
      updateCursor();
      updateStats();
    }
    return;
  }

  // Nuevo carácter
  if (value.length > userInput.length) {
    const newChar = value[value.length - 1];
    processCharacter(newChar);
    hiddenInput.value = userInput;
  }
}

// Manejar teclado en desktop
function handleKeyDown(e) {
  if (!isTestActive || isTestComplete) return;

  if (e.key === "Backspace" || e.key === " ") {
    e.preventDefault();
    return;
  }

  if (e.key === "Escape" || e.key === "Enter" || e.key === "Tab") {
    e.preventDefault();
    return;
  }

  if (e.key.length === 1) {
    e.preventDefault();
  }
}

// Manejar teclado en desktop
function handleKeyUp(e) {
  if (!isTestActive || isTestComplete) return;

  if (e.key.length > 1 && e.key !== " " && e.key !== "Backspace") return;

  if (e.key === "Backspace") {
    handleBackspace();
    return;
  }

  if (currentIndex >= currentText.length) {
    if (currentMode === "Passage") {
      endTest();
    }
    return;
  }

  const currentChar = currentText[currentIndex];
  const typedChar = e.key;
  userInput += typedChar;

  const charEl = document.getElementById(`char-${currentIndex}`);
  if (!charEl) return;

  const isCorrect = typedChar === currentChar;
  charEl.className = "char " + (isCorrect ? "correct" : "incorrect");

  if (isCorrect) {
    correctCount++;
  } else {
    incorrectCount++;
  }

  currentIndex++;
  updateCursor();
  updateStats();

  if (currentMode === "Passage" && currentIndex >= currentText.length) {
    endTest();
  }
}

// Función auxiliar para backspace
function handleBackspace() {
  if (currentIndex > 0) {
    currentIndex--;
    userInput = userInput.slice(0, -1);
    
    const prevCharEl = document.getElementById(`char-${currentIndex}`);
    if (prevCharEl) {
      prevCharEl.className = "char";
      if (prevCharEl.classList.contains("incorrect")) {
        incorrectCount--;
      } else if (prevCharEl.classList.contains("correct")) {
        correctCount--;
      }
    }
    
    updateCursor();
    updateStats();
  }
}

// Función para procesar caracteres (compartida)
function processCharacter(typedChar) {
  if (currentIndex >= currentText.length) {
    if (currentMode === "Passage") {
      endTest();
    }
    return;
  }
  
  const currentChar = currentText[currentIndex];
  userInput += typedChar;
  
  const charEl = document.getElementById(`char-${currentIndex}`);
  if (!charEl) return;
  
  const isCorrect = typedChar === currentChar;
  charEl.className = "char " + (isCorrect ? "correct" : "incorrect");
  
  if (isCorrect) {
    correctCount++;
  } else {
    incorrectCount++;
  }
  
  currentIndex++;
  updateCursor();
  updateStats();
  
  if (currentMode === "Passage" && currentIndex >= currentText.length) {
    endTest();
  }
}

// Finalizar test
function endTest() {
  isTestActive = false;
  isTestComplete = true;

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Desactivar textarea en móviles
  if (hiddenInput && isMobile()) {
    hiddenInput.classList.remove('active');
    hiddenInput.blur();
  }

  const elapsedSeconds = (new Date() - startTime) / 1000;
  const elapsedMinutes = elapsedSeconds / 60;
  const wordsTyped = correctCount / 5;
  const finalWPM = elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0;
  const totalTyped = correctCount + incorrectCount;
  const finalAccuracy = totalTyped > 0 ? Math.round((correctCount / totalTyped) * 100) : 0;

  wpmCompleteEl.textContent = finalWPM;
  accuracyCompleteEl.textContent = `${finalAccuracy}%`;
  correctEl.textContent = correctCount;
  incorrectEl.textContent = incorrectCount;

  const isFirstTime = personalBest === 0;

  if (isFirstTime || finalWPM > personalBest) {
    personalBest = finalWPM;
    localStorage.setItem("typingPB", personalBest.toString());
    updatePersonalBestDisplay();

    const pbIcon = document.getElementById("complete-icon");
    const mainElement = document.querySelector(".main");

    testCompleteSection.classList.remove("no-stars", "with-stars");
    mainElement.classList.remove("confetti");

    if (isFirstTime) {
      messageTitle.textContent = "Baseline Established!";
      messageText.textContent = "You've set the bar. Now the real challenge begins—time to beat it.";
      pbIcon.src = "assets/images/icon-completed.svg";
      pbIcon.classList.remove("new-pb-icon");
      pbIcon.classList.add("complete-icon");
      testCompleteSection.classList.add("with-stars");
    } else {
      messageTitle.textContent = "High Score Smashed!";
      messageText.textContent = "You're getting faster. That was incredible typing.";
      pbIcon.src = "assets/images/icon-new-pb.svg";
      pbIcon.classList.remove("complete-icon");
      pbIcon.classList.add("new-pb-icon");
      testCompleteSection.classList.add("no-stars");
      mainElement.classList.add("confetti");
    }
  } else {
    messageTitle.textContent = "Test Complete!";
    messageText.textContent = "Solid run. Keep pushing to beat your high score.";
    const pbIcon = document.getElementById("complete-icon");
    pbIcon.src = "assets/images/icon-completed.svg";
    pbIcon.classList.remove("new-pb-icon");
    pbIcon.classList.add("complete-icon");
    testCompleteSection.classList.remove("no-stars");
    testCompleteSection.classList.add("with-stars");
    document.querySelector(".main").classList.remove("confetti");
  }

  mainContent.style.display = "none";
  testCompleteSection.style.display = "flex";
}

// Actualizar estadísticas
function updateStats() {
  if (!startTime) return;

  const elapsedTime = (new Date() - startTime) / 1000 / 60;
  const wordsTyped = correctCount / 5;
  const wpm = elapsedTime > 0 ? Math.round(wordsTyped / elapsedTime) : 0;
  wpmEl.textContent = wpm;

  const totalTyped = correctCount + incorrectCount;
  const accuracy = totalTyped > 0 ? Math.round((correctCount / totalTyped) * 100) : 0;
  accuracyEl.textContent = `${accuracy}%`;
}

// Reiniciar test - MODIFICADO PARA MÓVILES
function restartTest() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  isTestActive = false;
  isTestComplete = false;
  startTime = null;
  userInput = "";
  currentIndex = 0;
  correctCount = 0;
  incorrectCount = 0;

  // Desactivar textarea en móviles
  if (hiddenInput && isMobile()) {
    hiddenInput.classList.remove('active');
    hiddenInput.value = '';
    hiddenInput.blur();
  }

  wpmEl.textContent = "---";
  accuracyEl.textContent = "---%";

  if (currentMode === "Timed (30s)") {
    timeEl.textContent = "0:30";
  } else if (currentMode === "Timed (60s)") {
    timeEl.textContent = "1:00";
  } else {
    timeEl.textContent = "0:00";
  }

  document.querySelector(".test-controls").style.display = "flex";
  document.querySelector(".btn-restart-cont").style.display = "none";
  loadTextForDifficulty(currentDifficulty);
  textInputEl.style.filter = "blur(16px)";
}