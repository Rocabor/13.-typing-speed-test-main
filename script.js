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
const textDisplay = document.getElementById("text-display");
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
const hiddenInput = document.getElementById('hidden-input');

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
    // No necesitamos recargar nada aquí, solo actualizar el modo
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
  if (!textDisplay) return;

  // Limpiar contenido
  textDisplay.innerHTML = "";

  // Crear elementos para cada carácter
  for (let i = 0; i < currentText.length; i++) {
    const charSpan = document.createElement("span");
    charSpan.textContent = currentText[i];
    charSpan.className = "char";
    charSpan.id = `char-${i}`;
    textDisplay.appendChild(charSpan);
  }

  // Establecer cursor inicial
  updateCursor();

  // Si el test no está activo, aplicar blur
  if (!isTestActive) {
    textDisplay.style.filter = "blur(16px)";
  } else {
    textDisplay.style.filter = "none";
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

// Actualizar tiempo en pantalla
function updateTimeDisplay(time) {
  if (currentMode.startsWith("Timed")) {
    // Modo Timed - cuenta regresiva
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timeEl.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  } else {
    // Modo Passage - tiempo transcurrido
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timeEl.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
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
  textDisplay.style.filter = "none";

  // Activar el textarea oculto para móviles
  if (hiddenInput) {
    hiddenInput.classList.add('active');
    
    // Pequeño retraso para asegurar que el DOM esté listo
    setTimeout(() => {
      hiddenInput.focus();
      // Limpiar el contenido del textarea
      hiddenInput.value = '';
    }, 50);
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

  // Iniciar actualización de estadísticas
  updateStats();
}

// Inicio de contador de tiempo
function startTimer(timeLimit) {
  if (timerInterval) clearInterval(timerInterval);

  let timeLeft = timeLimit;
  let elapsedTime = 0;

  // Mostrar tiempo inicial
  if (timeLimit !== null) {
    updateTimeDisplay(timeLeft);
  } else {
    updateTimeDisplay(0);
  }

  timerInterval = setInterval(() => {
    if (timeLimit !== null) {
      // Modo con tiempo límite
      timeLeft--;
      elapsedTime++;
      updateTimeDisplay(timeLeft);

      if (timeLeft <= 0) {
        endTest();
        return;
      }
    } else {
      // Modo Passage - tiempo transcurrido
      elapsedTime++;
      updateTimeDisplay(elapsedTime);
    }

    // Verificar si se completó el texto en modo Passage
    if (currentMode === "Passage" && currentIndex >= currentText.length) {
      endTest();
    }
  }, 1000);
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
    console.log("Restart button clicked");
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
  textDisplay.addEventListener("click", (e) => {
    e.preventDefault();
    if (!isTestActive && !isTestComplete) {
      startTest();
    } else if (isTestActive && hiddenInput) {
      // Si el test ya está activo, enfocar el textarea
      hiddenInput.focus();
    }
  });
  
  // Evento para el textarea oculto
  if (hiddenInput) {
    hiddenInput.addEventListener('input', handleHiddenInput);
    
    // Prevenir comportamiento por defecto en el textarea
    hiddenInput.addEventListener('keydown', (e) => {
      // Prevenir la tecla Enter para evitar saltos de línea
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    });
  }
  
  // Permitir que el área de texto reciba foco
  textDisplay.setAttribute("tabindex", "0");
  
  // Evento de teclado para desktop (solo si no es móvil)
  if (!isMobile()) {
    textDisplay.addEventListener('keydown', handleDesktopKeyDown);
  }
}

// Detectar si es móvil
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Manejar teclado en desktop
function handleDesktopKeyDown(e) {
  if (!isTestActive || isTestComplete) return;
  
  // Permitir backspace y espacio
  if (e.key === "Backspace" || e.key === " ") {
    e.preventDefault();
    // La lógica se manejará en keyup
    return;
  }
  
  // Permitir todas las teclas imprimibles excepto Escape, Enter, Tab, etc.
  if (e.key === "Escape" || e.key === "Enter" || e.key === "Tab") {
    e.preventDefault();
    return;
  }
  
  // Permitir cualquier tecla que sea un solo carácter (excepto teclas especiales)
  if (e.key.length === 1) {
    e.preventDefault();
    processCharacter(e.key);
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

  // Calcular tiempo transcurrido en minutos
  const elapsedSeconds = (new Date() - startTime) / 1000;
  const elapsedMinutes = elapsedSeconds / 60;

  // Calcular estadísticas finales
  const wordsTyped = correctCount / 5;
  const finalWPM = elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0;
  const totalTyped = correctCount + incorrectCount;
  const finalAccuracy = totalTyped > 0 ? Math.round((correctCount / totalTyped) * 100) : 0;

  // Actualizar UI de resultados
  wpmCompleteEl.textContent = finalWPM;
  accuracyCompleteEl.textContent = `${finalAccuracy}%`;
  correctEl.textContent = correctCount;
  incorrectEl.textContent = incorrectCount;

  // Guardamos si es la primera vez ANTES de actualizar la variable
  const isFirstTime = personalBest === 0;

  if (isFirstTime || finalWPM > personalBest) {
    personalBest = finalWPM;
    localStorage.setItem("typingPB", personalBest.toString());
    updatePersonalBestDisplay();

    const pbIcon = document.getElementById("complete-icon");
    const mainElement = document.querySelector(".main");
    const testCompleteSection = document.querySelector(".test-complete");

    // Remover todas las clases de estado
    testCompleteSection.classList.remove("no-stars", "with-stars");
    mainElement.classList.remove("confetti");

    if (isFirstTime) {
      // Primera vez del test
      messageTitle.textContent = "Baseline Established!";
      messageText.textContent = "You've set the bar. Now the real challenge begins—time to beat it.";

      pbIcon.src = "assets/images/icon-completed.svg";
      pbIcon.classList.remove("new-pb-icon");
      pbIcon.classList.add("complete-icon");

      // Mostrar estrellas para primera vez
      testCompleteSection.classList.add("with-stars");
    } else {
      // Nuevo Récord Personal
      messageTitle.textContent = "High Score Smashed!";
      messageText.textContent = "You're getting faster. That was incredible typing.";

      pbIcon.src = "assets/images/icon-new-pb.svg";
      pbIcon.classList.remove("complete-icon");
      pbIcon.classList.add("new-pb-icon");

      // Ocultar estrellas para nuevo récord
      testCompleteSection.classList.add("no-stars");

      // Mostrar confetti
      mainElement.classList.add("confetti");
    }
  } else {
    messageTitle.textContent = "Test Complete!";
    messageText.textContent = "Solid run. Keep pushing to beat your high score.";

    const pbIcon = document.getElementById("complete-icon");
    const testCompleteSection = document.querySelector(".test-complete");

    pbIcon.src = "assets/images/icon-completed.svg";
    pbIcon.classList.remove("new-pb-icon");
    pbIcon.classList.add("complete-icon");

    // Mostrar estrellas cuando no hay récord
    testCompleteSection.classList.remove("no-stars");
    testCompleteSection.classList.add("with-stars");

    // Remover confetti
    document.querySelector(".main").classList.remove("confetti");
  }

  // Desactivar el textarea oculto
  if (hiddenInput) {
    hiddenInput.classList.remove('active');
    hiddenInput.blur();
  }

  // Cambiar a vista de resultados
  mainContent.style.display = "none";
  testCompleteSection.style.display = "flex";
}

// Actualizar estadísticas
function updateStats() {
  if (!startTime) return;

  // Calcular tiempo transcurrido en minutos
  const elapsedTime = (new Date() - startTime) / 1000 / 60;

  // Calcular WPM (palabras por minuto)
  // Una palabra = 5 caracteres
  const wordsTyped = correctCount / 5;
  const wpm = elapsedTime > 0 ? Math.round(wordsTyped / elapsedTime) : 0;
  wpmEl.textContent = wpm;

  // Calcular precisión
  const totalTyped = correctCount + incorrectCount;
  const accuracy = totalTyped > 0 ? Math.round((correctCount / totalTyped) * 100) : 0;
  accuracyEl.textContent = `${accuracy}%`;
}

// Reiniciar test
function restartTest() {
  console.log("Restarting test...");
  
  // Detener temporizador
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Resetear estado
  isTestActive = false;
  isTestComplete = false;
  startTime = null;
  userInput = "";
  currentIndex = 0;
  correctCount = 0;
  incorrectCount = 0;

  // Desactivar el textarea oculto
  if (hiddenInput) {
    hiddenInput.classList.remove('active');
    hiddenInput.value = '';
    hiddenInput.blur();
  }

  // Resetear estadísticas en tiempo real
  wpmEl.textContent = "---";
  accuracyEl.textContent = "---%";

  // Resetear tiempo según el modo actual
  if (currentMode === "Timed (30s)") {
    timeEl.textContent = "0:30";
  } else if (currentMode === "Timed (60s)") {
    timeEl.textContent = "1:00";
  } else {
    timeEl.textContent = "0:00";
  }

  // Mostrar controles de inicio
  document.querySelector(".test-controls").style.display = "flex";

  // Ocultar botón de reinicio
  document.querySelector(".btn-restart-cont").style.display = "none";

  // Cargar nuevo texto
  loadTextForDifficulty(currentDifficulty);

  // Asegurarse de que el texto esté borroso
  textDisplay.style.filter = "blur(16px)";
}

// Manejar entrada del textarea oculto (móviles)
function handleHiddenInput(e) {
  if (!isTestActive || isTestComplete) return;
  
  const value = hiddenInput.value;
  
  // Verificar si se presionó backspace
  if (e.inputType === 'deleteContentBackward') {
    handleBackspace();
    return;
  }

  // Obtener el último carácter ingresado
  if (value.length > userInput.length) {
    const newChar = value[value.length - 1];
    processCharacter(newChar);
  }
  
  // Mantener sincronizado el valor del textarea
  hiddenInput.value = userInput;
}

function handleBackspace() {
  if (currentIndex > 0) {
    currentIndex--;
    
    // Remover el último carácter del input
    userInput = userInput.slice(0, -1);
    
    // Restaurar estado del carácter anterior
    const prevCharEl = document.getElementById(`char-${currentIndex}`);
    if (prevCharEl) {
      prevCharEl.className = "char";
      
      // Restar del conteo si estaba incorrecto
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

function processCharacter(typedChar) {
  // Si llegamos al final del texto
  if (currentIndex >= currentText.length) {
    if (currentMode === "Passage") {
      endTest();
    }
    return;
  }
  
  // Obtener el carácter actual del texto
  const currentChar = currentText[currentIndex];
  
  // Agregar al input del usuario
  userInput += typedChar;
  
  // Obtener elemento del carácter
  const charEl = document.getElementById(`char-${currentIndex}`);
  if (!charEl) return;
  
  // Verificar si es correcto
  const isCorrect = typedChar === currentChar;
  
  // Actualizar clases
  charEl.className = "char " + (isCorrect ? "correct" : "incorrect");
  
  // Actualizar conteos
  if (isCorrect) {
    correctCount++;
  } else {
    incorrectCount++;
  }
  
  // Mover al siguiente carácter
  currentIndex++;
  
  // Actualizar cursor
  updateCursor();
  
  // Actualizar estadísticas
  updateStats();
  
  // Verificar si se completó en modo Passage
  if (currentMode === "Passage" && currentIndex >= currentText.length) {
    endTest();
  }
}