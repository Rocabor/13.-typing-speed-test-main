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
let lastTapTime = 0;
let tapCount = 0;

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
  setDefaultDisplayValues();
  
  // Configurar móvil SIEMPRE
  if (isMobile) {
    setupMobileKeyboard();
  }
});

//  TECLADO MÓVIL VISIBLE
function setupMobileKeyboard() {
  console.log('Configurando teclado para móvil...');
  
  // INPUT REAL visible
  const mobileInput = document.createElement('input');
  mobileInput.type = 'text';
  mobileInput.id = 'mobile-keyboard-input';
  mobileInput.style.position = 'fixed';
  mobileInput.style.top = '16px';
  mobileInput.style.left = '80px';
  mobileInput.style.width = '40px';
  mobileInput.style.height = '30px';
  mobileInput.style.opacity = '0.3';
  mobileInput.style.fontSize = '16px';
  mobileInput.style.zIndex = '9999';
  mobileInput.style.border = '2px solid #fbbf24';
  mobileInput.style.borderRadius = '8px';
  mobileInput.style.textAlign = 'center';
  mobileInput.style.background = '#1c1917';
  mobileInput.style.color = '#fbbf24';
  mobileInput.autocapitalize = 'none';
  mobileInput.autocomplete = 'off';
  mobileInput.autocorrect = 'off';
  mobileInput.spellcheck = false;
  mobileInput.placeholder = '...';
  mobileInput.style.display = 'none';
  
  document.body.appendChild(mobileInput);
  
  // Botón flotante para activar teclado
  const keyboardButton = document.createElement('button');
  keyboardButton.id = 'keyboard-activator';
  keyboardButton.innerHTML = '⌨️';
  keyboardButton.style.position = 'fixed';
  keyboardButton.style.bottom = '100px';
  keyboardButton.style.right = '20px';
  keyboardButton.style.width = '60px';
  keyboardButton.style.height = '60px';
  keyboardButton.style.borderRadius = '50%';
  keyboardButton.style.background = '#fbbf24';
  keyboardButton.style.color = '#1c1917';
  keyboardButton.style.border = 'none';
  keyboardButton.style.fontSize = '24px';
  keyboardButton.style.zIndex = '10000';
  keyboardButton.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.5)';
  keyboardButton.style.display = 'none';
  keyboardButton.title = 'Activar teclado';
  
  document.body.appendChild(keyboardButton);
  
  // Función para mostrar y enfocar el teclado
  function showAndFocusKeyboard() {
    console.log('Activando teclado...');
    
    // Mostrar el input móvil
    mobileInput.style.display = 'block';
    
    // Enfocar con múltiples métodos
    setTimeout(() => {
      mobileInput.focus();
      mobileInput.value = '';
      mobileInput.click();
    }, 10);
    
    setTimeout(() => {
      if (document.activeElement !== mobileInput) {
        mobileInput.focus();
        mobileInput.click();
        mobileInput.select();
      }
    }, 100);
    
    // Ocultar botón flotante
    keyboardButton.style.display = 'none';
    mobileInput.style.opacity = '0.8';
  }
  
  // Función para ocultar teclado
  function hideKeyboard() {
    mobileInput.style.display = 'none';
    mobileInput.blur();
    mobileInput.value = '';
  }
  
  // Capturar lo que escribe el usuario
  mobileInput.addEventListener('input', function(e) {
    if (!isTestActive || isTestComplete) return;
    
    const value = mobileInput.value;
    if (!value || value.length === 0) return;
    
    // Tomar el último carácter
    const lastChar = value.charAt(value.length - 1);
    
    // Limpiar el input pero mantenerlo enfocado
    mobileInput.value = '';
    
    // Procesar el carácter
    processCharacter(lastChar);
    
    // Mantener el foco
    setTimeout(() => {
      mobileInput.focus();
    }, 10);
  });
  
  // Manejar teclas especiales
  mobileInput.addEventListener('keydown', function(e) {
    if (!isTestActive || isTestComplete) return;
    
    if (e.key === 'Backspace' || e.key === ' ') {
      e.preventDefault();
      processCharacter(e.key);
      mobileInput.value = '';
      
      // Mantener el foco
      setTimeout(() => {
        mobileInput.focus();
      }, 10);
    }
    
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  });
  
  // Cuando el teclado pierde el foco, mostrar botón flotante
  mobileInput.addEventListener('blur', function() {
    console.log('Teclado perdió foco');
    if (isTestActive && !isTestComplete) {
      // Mostrar botón flotante para reactivar
      setTimeout(() => {
        if (document.activeElement !== mobileInput) {
          keyboardButton.style.display = 'block';
          mobileInput.style.opacity = '0.3';
        }
      }, 300);
    }
  });
  
  // Cuando el teclado gana foco, ocultar botón flotante
  mobileInput.addEventListener('focus', function() {
    console.log('Teclado ganó foco');
    keyboardButton.style.display = 'none';
    mobileInput.style.opacity = '0.8';
  });
  
  // Botón flotante para activar teclado
  keyboardButton.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    showAndFocusKeyboard();
  });
  
  // Cuando se toca el área de texto
  textInputEl.addEventListener('touchstart', function(e) {
    if (isTestActive) {
      e.preventDefault();
      showAndFocusKeyboard();
    }
  }, { passive: false });
  
  textInputEl.addEventListener('click', function(e) {
    if (isTestActive && isMobile) {
      e.preventDefault();
      showAndFocusKeyboard();
    }
  });
  
  // Mostrar/ocultar elementos según el estado del test
  function updateKeyboardVisibility() {
    if (isTestActive && !isTestComplete) {
      // Test activo: mostrar botón flotante
      keyboardButton.style.display = 'none';
    } else {
      // Test no activo: ocultar todo
      keyboardButton.style.display = 'none';
      hideKeyboard();
    }
  }
  
  // Sobrescribir funciones para manejar visibilidad
  const originalStartTest = startTest;
  startTest = function() {
    originalStartTest();
    updateKeyboardVisibility();
    // Enfocar automáticamente al inicio
    setTimeout(() => {
      showAndFocusKeyboard();
    }, 300);
  };
  
  const originalEndTest = endTest;
  endTest = function() {
    originalEndTest();
    updateKeyboardVisibility();
  };
  
  const originalRestartTest = restartTest;
  restartTest = function() {
    originalRestartTest();
    updateKeyboardVisibility();
  };
  
  // Inicializar visibilidad
  updateKeyboardVisibility();
}

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

// Configurar eventos
function setupEventListeners() {
  // Botón de inicio
  startBtn.forEach((btn) => {
    const eventType = isMobile ? 'touchstart' : 'click';
    btn.addEventListener(eventType, (e) => {
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
  if (isMobile) {
    // Para móviles: doble tap
    logo.addEventListener("touchstart", function(e) {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTapTime;
      
      if (tapLength < 500 && tapLength > 0) {
        tapCount++;
        if (tapCount === 2) {
          e.preventDefault();
          if (confirm("¿Quieres reiniciar tu récord personal?")) {
            resetPersonalBest();
          }
          tapCount = 0;
        }
      } else {
        tapCount = 1;
      }
      
      lastTapTime = currentTime;
    }, { passive: true });
  } else {
    // Para desktop: click normal
    logo.addEventListener("click", () => {
      if (confirm("¿Quieres reiniciar tu récord personal?")) {
        resetPersonalBest();
      }
    });
  }
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
      const eventType = isMobile ? 'touchstart' : 'click';
      
      option.addEventListener(eventType, (e) => {
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
    // Resetear tiempo según el modo seleccionado
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
  const closeEvent = isMobile ? 'touchstart' : 'click';
  document.addEventListener(closeEvent, (e) => {
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

// Cargar archivo data.json
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
    
    // Añadir espacios no separables para evitar que palabras se corten
    if (currentText[i] === ' ') {
      charSpan.style.whiteSpace = 'nowrap';
    }
    
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

  // Enfocar el área de texto (solo en desktop)
  if (!isMobile) {
    textInputEl.focus();
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

// Procesar carácter (función común para desktop y móvil)
function processCharacter(typedChar) {
  if (typedChar === 'Backspace') {
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
    return;
  }

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

  // Verificar si es correcto (comparación insensible a mayúsculas para móviles)
  const isCorrect = typedChar.toLowerCase() === currentChar.toLowerCase();

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

  // Remover todas las clases de estado
  mainElement.classList.remove("confetti");
  testCompleteSection.classList.remove("no-stars");
  if (pbIcon) {
    pbIcon.classList.remove("new-pb-icon");
    pbIcon.classList.add("complete-icon");
    pbIcon.src = "assets/images/icon-completed.svg";
  }

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

      if (pbIcon) {
        pbIcon.src = "assets/images/icon-new-pb.svg";
        pbIcon.classList.remove("complete-icon");
        pbIcon.classList.add("new-pb-icon");
      }

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
  accuracyEl.style.color = "var(--red-500)";
}

// Reiniciar test
function restartTest() {
  // Remover confetti
  mainElement.classList.remove("confetti");

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
}

// Manejar teclado (solo para desktop)
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

// Manejar teclado (solo para desktop)
function handleKeyUp(e) {
  if (!isTestActive || isTestComplete) return;

  // Ignorar teclas especiales excepto espacio y backspace
  if (e.key.length > 1 && e.key !== " " && e.key !== "Backspace") return;

  // Usar la función común para procesar caracteres
  processCharacter(e.key);
}