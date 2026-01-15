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
const messageTitle = document.getElementById("logro");
const messageText = document.getElementById("text");
const logo = document.getElementById("logo");
const hiddenInput = document.getElementById("hidden-input");

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

  // Configurar para móviles
  setupMobileSupport();
});

// Configurar soporte para móviles
function setupMobileSupport() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Configurar el área de texto para móviles
    textInputEl.style.cursor = 'pointer';
    
    // Asegurar que el hidden input esté disponible
    hiddenInput.style.position = 'fixed';
    hiddenInput.style.top = '0';
    hiddenInput.style.left = '0';
    hiddenInput.style.width = '100%';
    hiddenInput.style.height = '60px';
    hiddenInput.style.opacity = '0';
    hiddenInput.style.zIndex = '1000';
    hiddenInput.style.pointerEvents = 'auto';
    
    // Redirigir toques al input oculto
    textInputEl.addEventListener('touchstart', function(e) {
      e.preventDefault();
      setTimeout(() => {
        hiddenInput.focus();
        // En algunos dispositivos necesitamos forzar el teclado
        hiddenInput.click();
      }, 50);
    }, { passive: false });
    
    // También el botón start
    startBtn.addEventListener('touchstart', function(e) {
      e.stopPropagation();
      setTimeout(() => {
        hiddenInput.focus();
      }, 100);
    });
  }
}

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
      e.preventDefault();

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
        e.preventDefault();
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
      
      // Soporte táctil para opciones
      option.addEventListener('touchstart', function(e) {
        e.stopPropagation();
        e.preventDefault();
        this.click();
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
    // Actualizar tiempo display según el modo
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

  // Cerrar dropdowns al hacer clic fuera
  document.addEventListener("click", (e) => {
    if (!e.target.closest('.dropdown-group')) {
      [difficultyMobileBtn, modeMobileBtn].forEach((btn) => {
        btn.setAttribute("aria-expanded", "false");
        const arrow = btn.querySelector(".arrow");
        if (arrow) arrow.style.transform = "rotate(0deg)";
      });
      [dropdownDifficulty, dropdownMode].forEach((dw) => {
        dw.style.display = "none";
      });
    }
  });
  
  // También cerrar dropdowns en toque fuera
  document.addEventListener('touchstart', (e) => {
    if (!e.target.closest('.dropdown-group')) {
      [difficultyMobileBtn, modeMobileBtn].forEach((btn) => {
        btn.setAttribute("aria-expanded", "false");
        const arrow = btn.querySelector(".arrow");
        if (arrow) arrow.style.transform = "rotate(0deg)";
      });
      [dropdownDifficulty, dropdownMode].forEach((dw) => {
        dw.style.display = "none";
      });
    }
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
    
    // Scroll suave al cursor en móviles
    if (isTestActive) {
      currentCharEl.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
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
  textInputEl.style.filter = "none";

  // Limpiar y enfocar el input oculto para móviles
  hiddenInput.value = "";
  
  // Enfocar el input oculto con retraso para permitir que el teclado aparezca
  setTimeout(() => {
    hiddenInput.focus();
    // Forzar el teclado en móviles
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      hiddenInput.click();
    }
  }, 200);

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
  // Para Passage, timeLimit es null

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
  startBtn.addEventListener("click", startTest);
  
  // También iniciar al tocar el área de texto
  textInputEl.addEventListener("click", () => {
    if (!isTestActive && !isTestComplete) {
      startTest();
    }
  });

  // Botón de reinicio
  restartBtn.addEventListener("click", restartTest);
  
  // Soporte táctil para botones
  restartBtn.addEventListener('touchstart', function(e) {
    e.stopPropagation();
    this.click();
  });

  // Botón de "ir de nuevo"
  goAgainBtn.addEventListener("click", () => {
    testCompleteSection.style.display = "none";
    mainContent.style.display = "flex";
    restartTest();
  });
  
  goAgainBtn.addEventListener('touchstart', function(e) {
    e.stopPropagation();
    this.click();
  });

  // Eventos de teclado en el input oculto (para móviles)
  hiddenInput.addEventListener("keydown", handleKeyDown);
  hiddenInput.addEventListener("keyup", handleKeyUp);
  
  // También manejar input event para móviles
  hiddenInput.addEventListener("input", handleInput);

  // Reset record personal
  logo.addEventListener("click", () => {
    // Confirmación para evitar borrados accidentales en táctil
    if (confirm("¿Quieres reiniciar tu récord personal?")) {
      localStorage.removeItem("typingPB");
      personalBest = 0;
      updatePersonalBestDisplay();

      // Opcional: Feedback visual rápido
      alert("Récord reiniciado");
    }
  });
  
  logo.addEventListener('touchstart', function(e) {
    e.stopPropagation();
    // Para móviles, usar un double tap o gesto largo para prevenir accidentes
    let tapCount = 0;
    let tapTimer;
    
    tapCount++;
    if (tapCount === 1) {
      tapTimer = setTimeout(() => {
        tapCount = 0;
      }, 300);
    } else if (tapCount === 2) {
      clearTimeout(tapTimer);
      tapCount = 0;
      this.click();
    }
  });

  // Permitir que el área de texto reciba foco
  textInputEl.setAttribute("tabindex", "0");
}

// Manejar input event para móviles
function handleInput(e) {
  if (!isTestActive || isTestComplete) return;
  
  const inputValue = hiddenInput.value;
  
  // Si no hay valor, salir
  if (!inputValue) return;
  
  // Obtener el último carácter ingresado
  const lastChar = inputValue.slice(-1);
  
  // Procesar el carácter
  if (lastChar) {
    processCharacter(lastChar);
  }
  
  // Limpiar el input para el siguiente carácter
  hiddenInput.value = "";
}

// Procesar un carácter
function processCharacter(typedChar) {
  // Si llegamos al final del texto
  if (currentIndex >= currentText.length) {
    if (currentMode === "Passage") {
      endTest();
    }
    return;
  }

  // Obtener el carácter actual
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
  const pbIcon = document.getElementById("complete-icon");
  const mainElement = document.querySelector(".main");
  const testCompleteSection = document.querySelector(".test-complete");

  // Remover todas las clases de estado
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
      // Primera vez del test
      messageTitle.textContent = "Baseline Established!";
      messageText.textContent = "You've set the bar. Now the real challenge begins—time to beat it.";
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

    // Mostrar estrellas cuando no hay récord
    testCompleteSection.classList.remove("no-stars");
  }

  // Cambiar a vista de resultados
  mainContent.style.display = "none";
  testCompleteSection.style.display = "flex";
  
  // Perder foco del input oculto
  hiddenInput.blur();
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
  // Remover confetti
  document.querySelector(".main").classList.remove("confetti");

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
  
  // Limpiar input oculto
  hiddenInput.value = "";

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
  textInputEl.style.filter = "blur(16px)";
  
  // Mostrar contenido principal
  mainContent.style.display = "flex";
  testCompleteSection.style.display = "none";
}

// Manejar teclado - keydown
function handleKeyDown(e) {
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
    e.preventDefault(); // Prevenir comportamiento por defecto
  }
}

// Manejar teclado - keyup
function handleKeyUp(e) {
  if (!isTestActive || isTestComplete) return;

  // Ignorar teclas especiales excepto espacio y backspace
  if (e.key.length > 1 && e.key !== " " && e.key !== "Backspace") return;

  // Manejar backspace
  if (e.key === "Backspace") {
    handleBackspace();
    return;
  }

  // Manejar espacio
  if (e.key === " ") {
    processCharacter(' ');
    e.preventDefault();
    return;
  }

  // Para teclas normales en desktop
  if (e.key.length === 1) {
    processCharacter(e.key);
    e.preventDefault();
  }
}

// Manejar backspace
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