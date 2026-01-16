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
let lastScrollLine = 0; // Para controlar cada cuántas líneas hacemos scroll

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
  // Configurar record personal
  updatePersonalBestDisplay();

  // Configurar dropdowns
  setupDropdowns();

  // Cargar texto inicial
  loadTextForDifficulty(currentDifficulty);

  // Configurar eventos
  setupEventListeners();

  // Configurar eventos del logo
  setupLogoEvents();

  // Configurar funcionalidad móvil
  setupMobileFunctionality();

  // Configurar valores por defecto en pantalla
  setDefaultDisplayValues();
});

// Valores por defecto en pantalla
function setDefaultDisplayValues() {
  // Valores por defecto en la sección principal
  wpmEl.textContent = "0";
  accuracyEl.textContent = "100%";
  timeEl.textContent = "0:30"; // Modo por defecto: Timed (30s)
  
  // Valores por defecto en el dropdown de dificultad
  const difficultyBtnText = difficultyMobileBtn.querySelector(".btn-text");
  difficultyBtnText.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
  
  // Valores por defecto en el dropdown de modo
  const modeBtnText = modeMobileBtn.querySelector(".btn-text");
  modeBtnText.textContent = currentMode;  
}

// Configurar funcionalidad móvil
function setupMobileFunctionality() {
  if (!isMobile) return;

  // Cambiar texto del hint para móviles
  const hintElement = document.querySelector(".hint");
  if (hintElement) {
    hintElement.textContent = "Or tap the text and start typing";
  }

  // Mejorar el área de texto para móviles
  const textBox = document.querySelector('.text-box');
  if (textBox) {
    textBox.style.maxHeight = '70vh';
    textBox.style.overflowY = 'auto';
    textBox.style.WebkitOverflowScrolling = 'touch';
    textBox.style.padding = '10px 0';
    // Evitar que palabras se corten
    textBox.style.wordBreak = 'keep-all';
    textBox.style.overflowWrap = 'break-word';
  }

  // Prevenir zoom en elementos interactivos
  document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  }, { passive: false });

  // Mejorar la respuesta táctil en botones
  const touchElements = document.querySelectorAll('.btn-setting, .btn-start, .btn-restart, .btn-go-again, .select');
  touchElements.forEach(el => {
    el.style.cursor = 'pointer';
    
    el.addEventListener('touchstart', function() {
      this.style.transform = 'scale(0.98)';
      this.style.opacity = '0.9';
    });
    
    el.addEventListener('touchend', function() {
      this.style.transform = '';
      this.style.opacity = '';
    });
  });

  // Para móviles: configurar textarea invisible para capturar teclas
  setupMobileKeyboardInput();
}

// Función para centrar el cursor al inicio del test (móviles)
function centerCursorOnStart() {
  if (!isMobile) return;
  
  const textBox = document.querySelector('.text-box');
  if (!textBox) return;
  
  // Desplazar al inicio
  textBox.scrollTop = 0;
  lastScrollLine = 0; // Reiniciar contador de líneas
  
  // Si hay un cursor, centrarlo después de un breve delay
  setTimeout(() => {
    const cursorElement = document.querySelector('.cursor');
    if (cursorElement && isTestActive) {
      scrollToCursor();
    }
  }, 100);
}

// Calcular en qué línea está el cursor actualmente
function getCurrentLine() {
  if (!isMobile) return 0;
  
  const cursorElement = document.querySelector('.cursor');
  if (!cursorElement) return 0;
  
  // Obtener posición vertical del cursor
  const cursorRect = cursorElement.getBoundingClientRect();
  const textBox = document.querySelector('.text-box');
  if (!textBox) return 0;
  
  const textBoxRect = textBox.getBoundingClientRect();
  const relativeTop = cursorRect.top - textBoxRect.top;
  
  // Calcular altura aproximada de una línea (usando el primer carácter como referencia)
  const firstChar = document.querySelector('.char');
  if (!firstChar) return 0;
  
  const charHeight = firstChar.offsetHeight || 40; // Altura aproximada de 40px por línea
  return Math.floor(relativeTop / charHeight);
}

// Función para hacer scroll automático al cursor (móviles) - MEJORADA
function scrollToCursor() {
  if (!isMobile) return; // Solo aplica para móviles
  
  const cursorElement = document.querySelector('.cursor');
  if (!cursorElement) return;
  
  // Obtener el contenedor del texto
  const textBox = document.querySelector('.text-box');
  if (!textBox) return;
  
  // Calcular en qué línea está el cursor actualmente
  const currentLine = getCurrentLine();
  
  // Verificar si hemos pasado 3 líneas desde el último scroll
  if (currentLine >= lastScrollLine + 3) {
    // Hacer scroll para mantener la línea actual en la parte superior
    const cursorRect = cursorElement.getBoundingClientRect();
    const textBoxRect = textBox.getBoundingClientRect();
    
    // Calcular el desplazamiento para colocar el cursor cerca de la parte superior
    const desiredPosition = textBoxRect.top + 50; // 50px desde la parte superior
    const offset = cursorRect.top - desiredPosition;
    
    // Aplicar scroll suave
    if (offset > 0) {
      textBox.scrollBy({
        top: offset,
        behavior: 'smooth'
      });
      
      // Actualizar la última línea en la que hicimos scroll
      lastScrollLine = currentLine;
    }
  } else {
    // Método de respaldo para mantener el cursor visible en la pantalla
    const cursorRect = cursorElement.getBoundingClientRect();
    const textBoxRect = textBox.getBoundingClientRect();
    
    // Margen de seguridad (60px desde arriba, 40px desde abajo)
    const topMargin = 60;
    const bottomMargin = 40;
    
    // Si el cursor está cerca del borde inferior
    if (cursorRect.bottom > (textBoxRect.bottom - bottomMargin)) {
      // Calcular cuánto necesitamos desplazar
      const offset = cursorRect.bottom - textBoxRect.bottom + bottomMargin;
      textBox.scrollBy({
        top: offset,
        behavior: 'smooth'
      });
    }
    // Si el cursor está cerca del borde superior
    else if (cursorRect.top < (textBoxRect.top + topMargin)) {
      const offset = textBoxRect.top + topMargin - cursorRect.top;
      textBox.scrollBy({
        top: -offset,
        behavior: 'smooth'
      });
    }
  }
  
  // También desplazar la ventana si es necesario (para dispositivos muy pequeños)
  if (window.innerHeight < 600) {
    const cursorRect = cursorElement.getBoundingClientRect();
    const cursorPosition = cursorRect.top;
    const windowHeight = window.innerHeight;
    
    // Si el cursor está en la mitad inferior de la pantalla
    if (cursorPosition > windowHeight * 0.6) {
      const scrollAmount = cursorPosition - (windowHeight * 0.3);
      window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  }
}

// Configurar input de teclado para móviles
function setupMobileKeyboardInput() {
  // Crear textarea invisible para capturar input en móviles
  const mobileInput = document.createElement('textarea');
  mobileInput.id = 'mobile-text-input';
  mobileInput.style.position = 'absolute';
  mobileInput.style.opacity = '0';
  mobileInput.style.height = '0';
  mobileInput.style.width = '0';
  mobileInput.style.pointerEvents = 'none';
  mobileInput.style.userSelect = 'none';
  document.body.appendChild(mobileInput);

  // Variable para controlar si el teclado ya está activo
  let keyboardActive = false;

  // Cuando se toque el área de texto en móvil, enfocar el textarea
  textInputEl.addEventListener('touchstart', function(e) {
    if (!isTestActive && !isTestComplete) {
      startTest();
      setTimeout(() => {
        if (!keyboardActive) {
          mobileInput.focus();
          mobileInput.value = '';
          keyboardActive = true;
        }
      }, 100);
    } else if (isTestActive && !keyboardActive) {
      mobileInput.focus();
      mobileInput.value = '';
      keyboardActive = true;
    }
    e.preventDefault();
  });

  // Manejar input del textarea
  mobileInput.addEventListener('input', handleMobileInput);
  
  // Manejar keydown para backspace y espacio
  mobileInput.addEventListener('keydown', handleMobileKeyDown);
  
  // Cuando se pierde el foco, mantener el valor pero marcar como inactivo
  mobileInput.addEventListener('blur', function() {
    keyboardActive = false;
    // NO limpiar el valor para evitar que el teclado se vuelva a abrir
    // this.value = '';
  });

  // Evitar que el teclado se abra al hacer tap en otras partes de la pantalla
  document.addEventListener('touchstart', function(e) {
    if (isTestActive && isMobile) {
      // Solo permitir que el teclado se abra al tocar el área de texto
      if (!e.target.closest('#text-input') && !e.target.closest('#mobile-text-input')) {
        if (mobileInput === document.activeElement) {
          mobileInput.blur();
          keyboardActive = false;
        }
      }
    }
  });

  // También enfocar cuando se haga clic normalmente
  textInputEl.addEventListener('click', function() {
    if (isTestActive && isMobile && !keyboardActive) {
      setTimeout(() => {
        mobileInput.focus();
        mobileInput.value = '';
        keyboardActive = true;
      }, 100);
    }
  });
}

// Manejar input en móviles
function handleMobileInput(e) {
  if (!isTestActive || isTestComplete || !isMobile) return;
  
  const input = e.target.value;
  if (!input || input.length === 0) return;
  
  // Obtener el último carácter ingresado
  const typedChar = input.charAt(input.length - 1);
  
  // Limpiar el input para el siguiente carácter
  e.target.value = '';
  
  // Procesar el carácter como si fuera una tecla normal
  processCharacter(typedChar);
}

// Manejar keydown en móviles (para backspace y espacio)
function handleMobileKeyDown(e) {
  if (!isTestActive || isTestComplete || !isMobile) return;
  
  if (e.key === 'Backspace' || e.key === ' ') {
    e.preventDefault();
    processCharacter(e.key);
  }
  
  // Prevenir Enter
  if (e.key === 'Enter') {
    e.preventDefault();
  }
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
      
      // Desplazar al cursor (especialmente importante en móviles)
      if (isMobile) {
        setTimeout(scrollToCursor, 10);
      }
      
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
  
  // Desplazar al cursor (especialmente importante en móviles)
  if (isMobile) {
    setTimeout(scrollToCursor, 10);
  }

  // Actualizar estadísticas
  updateStats();

  // Verificar si se completó en modo Passage
  if (currentMode === "Passage" && currentIndex >= currentText.length) {
    endTest();
  }
}

// Configurar eventos del logo
function setupLogoEvents() {
  if (isMobile) {
    // Solo para móviles: doble tap para reiniciar récord
    logo.addEventListener("touchstart", handleLogoTouch, { passive: true });
    logo.addEventListener("click", (e) => e.preventDefault()); // Prevenir clic accidental
  } else {
    // Solo para desktop: clic normal
    logo.addEventListener("click", () => {
      if (confirm("¿Quieres reiniciar tu récord personal?")) {
        resetPersonalBest();
      }
    });
  }
}

// Manejar toque en logo (para móviles)
function handleLogoTouch(e) {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTapTime;
  
  if (tapLength < 500 && tapLength > 0) {
    // Doble tap detectado
    tapCount++;
    if (tapCount === 2) { // Cambiado de 3 a 2 para doble tap
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
      // Para móviles, usar touch events
      const eventType = isMobile ? 'touchstart' : 'click';
      
      option.addEventListener(eventType, (e) => {
        if (isMobile) e.preventDefault();
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
        btn.querySelector(".arrow").style.transform = "rotate(0deg)";
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
    
    // Desplazar al cursor en móviles
    if (isMobile && isTestActive) {
      // Usar setTimeout para asegurar que el DOM se haya actualizado
      setTimeout(scrollToCursor, 10);
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
  lastScrollLine = 0; // Reiniciar contador de líneas

  // Quitar blur del texto
  textInputEl.style.filter = "none";

  // Centrar cursor en móviles
  if (isMobile) {
    centerCursorOnStart();
  }

  // Enfocar el área de texto (solo en desktop)
  if (!isMobile) {
    textInputEl.focus();
  } else {
    // En móviles, enfocar el textarea invisible
    const mobileInput = document.getElementById('mobile-text-input');
    if (mobileInput) {
      setTimeout(() => {
        mobileInput.focus();
        mobileInput.value = '';
      }, 100);
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

  // Eventos de teclado en el área de texto (solo desktop)
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

  // Permitir que el área de texto reciba foco
  textInputEl.setAttribute("tabindex", "0");

  // Manejar cambios en el teclado virtual (móviles)
  if (isMobile) {
    // También desplazar cuando el teclado se abra/cierre
    let lastHeight = window.innerHeight;
    window.addEventListener('resize', function() {
      if (window.innerHeight < lastHeight && isTestActive) {
        // Teclado probablemente se abrió - esperar un momento y luego hacer scroll
        setTimeout(() => {
          scrollToCursor();
        }, 300);
      }
      lastHeight = window.innerHeight;
    });
    
    // Prevenir que el teclado se abra al tocar otras áreas
    document.addEventListener('touchstart', function(e) {
      if (isTestActive && !e.target.closest('#text-input')) {
        const mobileInput = document.getElementById('mobile-text-input');
        if (mobileInput && mobileInput === document.activeElement) {
          mobileInput.blur();
        }
      }
    }, true);
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

  // En móviles, quitar el foco del textarea
  if (isMobile) {
    const mobileInput = document.getElementById('mobile-text-input');
    if (mobileInput) {
      mobileInput.blur();
      // Limpiar valor solo al finalizar
      mobileInput.value = '';
    }
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
  lastScrollLine = 0; // Reiniciar contador de líneas

  // En móviles, limpiar el textarea
  if (isMobile) {
    const mobileInput = document.getElementById('mobile-text-input');
    if (mobileInput) {
      mobileInput.blur();
      mobileInput.value = '';
    }
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