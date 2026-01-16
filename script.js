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
let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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
const messageTitle = document.getElementById("logro");
const messageText = document.getElementById("text");
const logo = document.getElementById("logo");
const mainElement = document.querySelector(".main");

// Elementos de dropdown
const difficultyMobileBtn = document.getElementById("difficulty-mobile-btn");
const modeMobileBtn = document.getElementById("mode-mobile-btn");
const dropdownDifficulty = document.querySelector(".dropdown-difficulty");
const dropdownMode = document.querySelector(".dropdown-mode");
const difficultyOptions = dropdownDifficulty.querySelectorAll(".select");
const modeOptions = dropdownMode.querySelectorAll(".select");

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  updatePersonalBestDisplay();
  setupDropdowns();
  loadTextForDifficulty(currentDifficulty);
  setupEventListeners();
  setupLogoEvents();
  setupMobileFunctionality();
  setDefaultDisplayValues();
});

// Valores por defecto en pantalla
function setDefaultDisplayValues() {
  wpmEl.textContent = "0";
  accuracyEl.textContent = "100%";
  timeEl.textContent = "0:30";
  
  const difficultyBtnText = difficultyMobileBtn.querySelector(".btn-text");
  difficultyBtnText.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
  
  const modeBtnText = modeMobileBtn.querySelector(".btn-text");
  modeBtnText.textContent = currentMode;  
}

// Configurar funcionalidad móvil
function setupMobileFunctionality() {
  if (!isMobile) return;

  const hintElement = document.querySelector(".hint");
  if (hintElement) {
    hintElement.textContent = "Tap the text and start typing";
  }

  const textBox = document.querySelector('.text-box');
  if (textBox) {
    textBox.style.maxHeight = '70vh';
    textBox.style.overflowY = 'auto';
    textBox.style.WebkitOverflowScrolling = 'touch';
    textBox.style.padding = '10px 0';
  }
}

// Configurar input de teclado para móviles - SOLUCIÓN SIMPLE
function setupMobileKeyboardInput() {
  if (!isMobile) return;
  
  // Crear un input REAL visible pero fuera de pantalla
  const mobileInput = document.createElement('input');
  mobileInput.type = 'text';
  mobileInput.id = 'mobile-keyboard-input';
  mobileInput.style.position = 'fixed';
  mobileInput.style.top = '10px';
  mobileInput.style.left = '10px';
  mobileInput.style.width = '50px';
  mobileInput.style.height = '40px';
  mobileInput.style.opacity = '0.01';
  mobileInput.style.fontSize = '16px';
  mobileInput.style.zIndex = '1000';
  mobileInput.autocapitalize = 'none';
  mobileInput.autocomplete = 'off';
  mobileInput.autocorrect = 'off';
  mobileInput.spellcheck = false;
  document.body.appendChild(mobileInput);
  
  // Cuando el usuario toque el área de texto, enfocar este input
  textInputEl.addEventListener('touchstart', function(e) {
    if (isTestActive) {
      e.preventDefault();
      // Enfocar el input visible
      setTimeout(() => {
        mobileInput.focus();
        mobileInput.value = '';
      }, 50);
    }
  }, { passive: false });
  
  // También con click
  textInputEl.addEventListener('click', function(e) {
    if (isTestActive && isMobile) {
      e.preventDefault();
      setTimeout(() => {
        mobileInput.focus();
        mobileInput.value = '';
      }, 50);
    }
  });
  
  // Capturar lo que escribe el usuario
  mobileInput.addEventListener('input', function(e) {
    if (!isTestActive || isTestComplete || !isMobile) return;
    
    const value = mobileInput.value;
    if (value.length === 0) return;
    
    // Tomar el último carácter
    const lastChar = value.charAt(value.length - 1);
    
    // Limpiar el input
    mobileInput.value = '';
    
    // Procesar el carácter
    processCharacter(lastChar);
  });
  
  // Manejar teclas especiales
  mobileInput.addEventListener('keydown', function(e) {
    if (!isTestActive || isTestComplete || !isMobile) return;
    
    if (e.key === 'Backspace' || e.key === ' ') {
      e.preventDefault();
      processCharacter(e.key);
      mobileInput.value = '';
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  });
}

// Configurar eventos
function setupEventListeners() {
  // Botón de inicio
  startBtn.forEach((btn) => {
    btn.addEventListener(isMobile ? 'touchstart' : 'click', (e) => {
      if (isMobile) e.preventDefault();
      startTest();
    });
  });

  // Botón de reinicio
  restartBtn.addEventListener(isMobile ? 'touchstart' : 'click', (e) => {
    if (isMobile) e.preventDefault();
    restartTest();
  });

  // Botón de "ir de nuevo"
  goAgainBtn.addEventListener(isMobile ? 'touchstart' : 'click', (e) => {
    if (isMobile) e.preventDefault();
    testCompleteSection.style.display = "none";
    mainContent.style.display = "flex";
    restartTest();
  });

  // Eventos de teclado (solo desktop)
  if (!isMobile) {
    textInputEl.addEventListener("keydown", handleKeyDown);
    textInputEl.addEventListener("keyup", handleKeyUp);
  }
  
  // Configurar teclado móvil SIEMPRE
  if (isMobile) {
    setupMobileKeyboardInput();
  }

  // Hacer clic en el texto para iniciar
  textInputEl.addEventListener(isMobile ? 'touchstart' : 'click', (e) => {
    if (isMobile) e.preventDefault();
    if (!isTestActive && !isTestComplete) {
      startTest();
    }
  });
}

// Configurar eventos del logo
function setupLogoEvents() {
  logo.addEventListener("click", () => {
    if (confirm("¿Quieres reiniciar tu récord personal?")) {
      resetPersonalBest();
    }
  });
}

// Resetear record personal
function resetPersonalBest() {
  localStorage.removeItem("typingPB");
  personalBest = 0;
  updatePersonalBestDisplay();
  alert("Récord personal reiniciado");
}

// Configurar record personal
function updatePersonalBestDisplay() {
  pbScoreEl.textContent = `${personalBest} WPM`;
}

// Configurar dropdowns
function setupDropdowns() {
  const handleDropdown = (btn, dropdown, options, callback) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      const otherBtn = btn === difficultyMobileBtn ? modeMobileBtn : difficultyMobileBtn;
      const otherDropdown = btn === difficultyMobileBtn ? dropdownMode : dropdownDifficulty;

      otherBtn.setAttribute("aria-expanded", "false");
      otherDropdown.style.display = "none";
      otherBtn.querySelector(".arrow").style.transform = "rotate(0deg)";

      const isExpanded = btn.getAttribute("aria-expanded") === "true";
      const newState = !isExpanded;

      btn.setAttribute("aria-expanded", newState);
      dropdown.style.display = newState ? "flex" : "none";

      const arrow = btn.querySelector(".arrow");
      arrow.style.transform = newState ? "rotate(180deg)" : "rotate(0deg)";
      arrow.style.transition = "transform 0.3s";
    });

    options.forEach((option) => {
      option.addEventListener(isMobile ? 'touchstart' : 'click', (e) => {
        if (isMobile) e.preventDefault();
        e.stopPropagation();
        const value = option.getAttribute("data-value");

        options.forEach((opt) => {
          opt.classList.remove("active");
          opt.setAttribute("aria-selected", "false");
        });
        option.classList.add("active");
        option.setAttribute("aria-selected", "true");

        btn.querySelector(".btn-text").textContent = value;

        btn.setAttribute("aria-expanded", "false");
        dropdown.style.display = "none";
        btn.querySelector(".arrow").style.transform = "rotate(0deg)";

        if (callback) callback(value);
      });
    });
  };

  handleDropdown(difficultyMobileBtn, dropdownDifficulty, difficultyOptions, (value) => {
    currentDifficulty = value.toLowerCase();
    if (!isTestActive && !isTestComplete) {
      loadTextForDifficulty(currentDifficulty);
    }
  });

  handleDropdown(modeMobileBtn, dropdownMode, modeOptions, (value) => {
    currentMode = value;
    if (!isTestActive && !isTestComplete) {
      if (currentMode === "Timed (30s)") {
        timeEl.textContent = "0:30";
      } else if (currentMode === "Timed (60s)") {
        timeEl.textContent = "1:00";
      } else {
        timeEl.textContent = "0:00";
      }
    }
  });

  document.addEventListener(isMobile ? 'touchstart' : 'click', (e) => {
    if (!e.target.closest('.dropdown-group')) {
      [difficultyMobileBtn, modeMobileBtn].forEach((btn) => {
        btn.setAttribute("aria-expanded", "false");
        btn.querySelector(".arrow").style.transform = "rotate(0deg)";
      });
      [dropdownDifficulty, dropdownMode].forEach((dw) => {
        dw.style.display = "none";
      });
    }
  });
}

// Cargar texto
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
  timeEl.style.color = "var(--yellow-400)";
}

// Inicio del test
function startTest() {
  if (isTestActive || isTestComplete) return;

  isTestActive = true;
  isTestComplete = false;
  startTime = new Date();
  currentIndex = 0;
  correctCount = 0;
  incorrectCount = 0;
  userInput = "";

  // Quitar blur del texto
  textInputEl.style.filter = "none";

  // En móviles, activar el teclado automáticamente
  if (isMobile) {
    const mobileInput = document.getElementById('mobile-keyboard-input');
    if (mobileInput) {
      setTimeout(() => {
        mobileInput.focus();
        mobileInput.value = '';
      }, 300); // Delay para que el usuario vea que empezó
    }
  }

  // Ocultar controles de inicio
  document.querySelector(".test-controls").style.display = "none";

  // Mostrar botón de reinicio
  document.querySelector(".btn-restart-cont").style.display = "flex";

  // Iniciar temporizador
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

// Procesar carácter
function processCharacter(typedChar) {
  if (typedChar === 'Backspace') {
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
    return;
  }

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

  const isCorrect = typedChar.toLowerCase() === currentChar.toLowerCase();
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

  // Detener temporizador
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // En móviles, quitar el foco
  if (isMobile) {
    const mobileInput = document.getElementById('mobile-keyboard-input');
    if (mobileInput) {
      mobileInput.blur();
      mobileInput.value = '';
    }
  }

  // Calcular estadísticas
  const elapsedSeconds = (new Date() - startTime) / 1000;
  const elapsedMinutes = elapsedSeconds / 60;
  const wordsTyped = correctCount / 5;
  const finalWPM = elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0;
  const totalTyped = correctCount + incorrectCount;
  const finalAccuracy = totalTyped > 0 ? Math.round((correctCount / totalTyped) * 100) : 0;

  // Actualizar UI
  wpmCompleteEl.textContent = finalWPM;
  accuracyCompleteEl.textContent = `${finalAccuracy}%`;
  correctEl.textContent = correctCount;
  incorrectEl.textContent = incorrectCount;

  const isFirstTime = personalBest === 0;
  const pbIcon = document.getElementById("complete-icon");

  mainElement.classList.remove("confetti");
  testCompleteSection.classList.remove("no-stars");
  pbIcon.classList.remove("new-pb-icon");
  pbIcon.classList.add("complete-icon"); 
  pbIcon.src = "assets/images/icon-completed.svg"; 

  if (isFirstTime || finalWPM > personalBest) {
    personalBest = finalWPM;
    localStorage.setItem("typingPB", personalBest.toString());
    updatePersonalBestDisplay();

    if (isFirstTime) {
      messageTitle.textContent = "Baseline Established!";
      messageText.textContent = "You've set the bar. Now the real challenge begins—time to beat it.";
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

    testCompleteSection.classList.remove("no-stars");
  }

  // Cambiar a vista de resultados
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
  accuracyEl.style.color = "var(--red-500)";
}

// Reiniciar test
function restartTest() {
  mainElement.classList.remove("confetti");

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

  // En móviles
  if (isMobile) {
    const mobileInput = document.getElementById('mobile-keyboard-input');
    if (mobileInput) {
      mobileInput.blur();
      mobileInput.value = '';
    }
  }

  // Resetear estadísticas
  wpmEl.textContent = "---";
  accuracyEl.textContent = "---%";

  if (currentMode === "Timed (30s)") {
    timeEl.textContent = "0:30";
  } else if (currentMode === "Timed (60s)") {
    timeEl.textContent = "1:00";
  } else {
    timeEl.textContent = "0:00";
  }

  // Mostrar controles
  document.querySelector(".test-controls").style.display = "flex";
  document.querySelector(".btn-restart-cont").style.display = "none";

  // Cargar nuevo texto
  loadTextForDifficulty(currentDifficulty);

  // Blur el texto
  textInputEl.style.filter = "blur(16px)";
}

// Manejar teclado desktop
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

function handleKeyUp(e) {
  if (!isTestActive || isTestComplete) return;

  if (e.key.length > 1 && e.key !== " " && e.key !== "Backspace") return;

  processCharacter(e.key);
}

// SOLUCIÓN DEFINITIVA PARA MÓVILES
if (isMobile) {
  // Crear un overlay invisible que captura todos los toques en el área de texto
  const keyboardOverlay = document.createElement('div');
  keyboardOverlay.id = 'keyboard-overlay';
  keyboardOverlay.style.position = 'absolute';
  keyboardOverlay.style.top = '0';
  keyboardOverlay.style.left = '0';
  keyboardOverlay.style.width = '100%';
  keyboardOverlay.style.height = '100%';
  keyboardOverlay.style.zIndex = '10';
  keyboardOverlay.style.background = 'transparent';
  
  // Insertar el overlay dentro del área de texto
  textInputEl.style.position = 'relative';
  textInputEl.appendChild(keyboardOverlay);
  
  // Handler para el overlay
  keyboardOverlay.addEventListener('touchstart', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isTestActive && !isTestComplete) {
      startTest();
      return;
    }
    
    if (isTestActive) {
      const mobileInput = document.getElementById('mobile-keyboard-input');
      if (mobileInput) {
        // Forzar el foco de múltiples maneras
        setTimeout(() => {
          mobileInput.focus();
          mobileInput.click();
          mobileInput.value = '';
        }, 10);
        
        setTimeout(() => {
          if (document.activeElement !== mobileInput) {
            mobileInput.focus();
            mobileInput.click();
          }
        }, 100);
      }
    }
  }, { passive: false });
  
  // Ocultar el overlay cuando no se necesita
  function updateOverlayVisibility() {
    if (isTestActive) {
      keyboardOverlay.style.display = 'block';
    } else {
      keyboardOverlay.style.display = 'none';
    }
  }
  
  // Actualizar visibilidad al cambiar estados
  const originalStartTest = startTest;
  startTest = function() {
    originalStartTest();
    updateOverlayVisibility();
  };
  
  const originalRestartTest = restartTest;
  restartTest = function() {
    originalRestartTest();
    updateOverlayVisibility();
  };
  
  const originalEndTest = endTest;
  endTest = function() {
    originalEndTest();
    updateOverlayVisibility();
  };
}