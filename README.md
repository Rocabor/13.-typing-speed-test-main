# Frontend Mentor - Typing Speed Test


## Welcome! 👋

This challenge is part of the Frontend Mentor 30-Day Hackathon. 
Frontend Mentor challenges help you improve your coding skills by building realistic projects.To do this challenge, you need a good understanding of HTML, CSS and JavaScript.

## Table of contents 📋

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  - [Useful resources](#useful-resources)
- [Author](#author)
- [Acknowledgments](#acknowledgments)

## Overview


### 🏋️‍♂️The challenge 
![Static Badge](https://img.shields.io/badge/JUNIOR-%23ffffff?style=for-the-badge&label=2&labelColor=%2334D399)
![Static Badge](https://img.shields.io/badge/html5-%23E34F26?style=for-the-badge&logo=html5&logoColor=%23ffffff)
![Static Badge](https://img.shields.io/badge/css-%23663399?style=for-the-badge&logo=css)
![Static Badge](https://img.shields.io/badge/javascript-%23F7DF1E?style=for-the-badge&logo=javascript&logoColor=%23000)

Your challenge is to build out this typing speed test app and get it looking as close to the design as possible.

You can use any tools you like to help you complete the challenge. So if you've got something you'd like to practice, feel free to give it a go.

We store the passage data in a local `data.json` file. You can use that to randomly select passages of varying difficulty.

Your users should be able to:

#### Test Controls

- Start a test by clicking the start button or by clicking the passage and typing
- Select a difficulty level (Easy, Medium, Hard) for passages of varying complexity
- Switch between "Timed (60s)" mode and "Passage" mode (timer counts up, no limit)
- Restart at any time to get a new random passage from the selected difficulty

#### Typing Experience

- See real-time WPM, accuracy, and time stats while typing
- See visual feedback showing correct characters (green), errors (red/underlined), and cursor position
- Correct mistakes with backspace (original errors still count against accuracy)

#### Results & Progress

- View results showing WPM, accuracy, and characters (correct/incorrect) after completing a test
- See a "Baseline Established!" message on their first test, setting their personal best
- See a "High Score Smashed!" celebration with confetti when beating their personal best
- Have their personal best persist across sessions via localStorage

#### UI & Responsiveness

- View the optimal layout depending on their device's screen size
- See hover and focus states for all interactive elements

### Data Model

A `data.json` file is provided with passages organized by difficulty. Each passage has the following structure:

```json
{
  "id": "easy-1",
  "text": "The sun rose over the quiet town. Birds sang in the trees as people woke up and started their day."
}
```

| Property | Type | Description |
| --- | --- | --- |
| `id` | string | Unique identifier for the passage (e.g., "easy-1", "medium-3", "hard-10") |
| `text` | string | The passage text the user will type |

### Expected Behaviors

- **Starting the test**: The timer begins when the user starts typing or clicks the start button. Clicking directly on the passage text and typing also initiates the test
- **Timed mode**: 60-second countdown. Test ends when timer reaches 0 or passage is completed
- **Passage mode**: Timer counts up with no limit. Test ends when the full passage is typed
- **Error handling**: Incorrect characters are highlighted in red with an underline. Backspace allows corrections, but errors still count against accuracy
- **Results logic**:
  - First completed test: "Baseline Established!" - sets initial personal best
  - New personal best: "High Score Smashed!" with confetti animation
  - Normal completion: "Test Complete!" with encouragement message

### Data Persistence

The personal best score should persist across browser sessions using `localStorage`. When a user beats their high score, the new value should be saved and displayed on subsequent visits.

### Want some support on the challenge? 

[Join our community](https://www.frontendmentor.io/community) and ask questions in the **#help** channel.

### 📸 Screenshot

![](https://snipboard.io/CgDz9F.jpg)

### 🌎 Links

- Solution URL: [Repository URL](https://github.com/Rocabor/13.-typing-speed-test-main)
- Live Site URL: [Typing Speed Test](https://rocabor.github.io/13.-typing-speed-test-main/)

## My process

### 🛠️ Built with

- Semantic HTML5 markup
- CSS custom properties
- Flexbox
- CSS Grid
- Mobile-first workflow
- Vanilla JavaScript
- LocalStorage API
- Fetch API for JSON data
- Responsive design principles
- ARIA accessibility attributes

### 💡 What I learned

During this project, I learned several advanced JavaScript and web accessibility techniques:

**Semantic Accessibility in HTML:** I implemented specific ARIA roles to enhance the experience for users relying on assistive technologies.

### Accessibility Implementation (ARIA)

To ensure the application is accessible to all users, I implemented specific ARIA roles and attributes:

```html
<!-- Navegación con etiqueta ARIA -->
<nav aria-label="Attribution links">
<!-- Controles con roles específicos -->
<div class="difficulty-buttons" role="radiogroup" aria-label="Seleccionar dificultad">
<button type="button" class="btn-difficulty" role="radio" aria-checked="true">Easy</button>
<!-- Text area accesible -->
<div class="text-box" id="text-input" tabindex="0" role="textbox" 
     aria-label="Texto para practicar mecanografía" aria-multiline="true"></div>
```
**Complex State Management:**
I implemented a robust system to handle multiple test states:

```js
// Variables de estado global
let isTestActive = false;
let isTestComplete = false;
let currentDifficulty = "easy";
let currentMode = "Timed (60s)";

// Sistema de estadísticas por dificultad
let statsByDifficulty = {
  easy: {
    attempts: 0,
    best: 0,
    attemptsLocalStorageKey: "typingStatsEasyAttempts",
    bestLocalStorageKey: "typingStatsEasyBest",
  },
  // ... más dificultades
};
```
**Mobile-first design:**
I developed an innovative solution to improve the mobile device experience:
```js
// Input móvil virtual para mejor experiencia de teclado
const mobileInput = document.createElement("input");
mobileInput.type = "text";
mobileInput.autocapitalize = "none";
mobileInput.autocomplete = "off";
mobileInput.autocorrect = "off";
mobileInput.spellcheck = false;

// Botón flotante para activar teclado en móviles
const keyboardButton = document.createElement("button");
keyboardButton.id = "keyboard-activator";
keyboardButton.innerHTML = "⌨️";
```
**Tips system:**
I implemented a tips system that loads dynamically from JSON:
```js
async function loadFooterTips() {
  try {
    const response = await fetch("tips.json");
    const data = await response.json();
    currentTips = data.typing_tips;
    showRandomTip();
  } catch (error) {
    console.error("Error cargando tips:", error);
  }
}

// Tip interactivo con efectos visuales
function setupTipInteractivity() {
  const tipContainer = document.getElementById("tip-container");
  tipContainer.addEventListener("click", () => {
    tipContainer.style.opacity = "0.7";
    tipContainer.style.transform = "scale(0.98)";
    setTimeout(() => {
      showRandomTip();
      tipContainer.style.opacity = "1";
      tipContainer.style.transform = "scale(1)";
    }, 200);
  });
}
```
**Real-Time Statistics Calculation:**
 I implemented algorithms to calculate WPM and accuracy:
 ```js
 function updateStats() {
  const elapsedTime = (new Date() - startTime) / 1000 / 60;
  const wordsTyped = correctCount / 5; // 5 caracteres = 1 palabra
  const wpm = elapsedTime > 0 ? Math.round(wordsTyped / elapsedTime) : 0;
  const totalTyped = correctCount + incorrectCount;
  const accuracy = totalTyped > 0 ? Math.round((correctCount / totalTyped) * 100) : 0;
  
  wpmEl.textContent = wpm;
  accuracyEl.textContent = `${accuracy}%`;
}
```
**LocalStorage for data persistence:**
I used localStorage for multiple data types:
```js
// Guardar récord personal principal
localStorage.setItem("typingPB", personalBest.toString());

// Guardar estadísticas por dificultad
localStorage.setItem(stats.attemptsLocalStorageKey, stats.attempts.toString());
localStorage.setItem(stats.bestLocalStorageKey, stats.best.toString());
```
**Confetti animation:**
I implemented visual effects to celebrate records:
```js
if (finalWPM > personalBest) {
  document.body.classList.add("confetti");
  testCompleteSection.classList.add("no-stars");
  messageTitle.textContent = "High Score Smashed!";
}
```
### 🧗‍♂️Continued development

- [React](https://reactjs.org/) - JS library to restructure the project into components
- [Next.js](https://nextjs.org/) - React framework for better performance and SSR
- [TypeScript](https://www.typescriptlang.org/) - For static typing and improved maintainability
- [Tailwind CSS](https://tailwindcss.com/) - For more consistent and faster styles
- [Framer Motion](https://www.framer.com/motion/) - For more advanced animations
- [Jest](https://jestjs.io/) - For unit testing of JavaScript code
- [Cypress](https://www.cypress.io/) - For end-to-end testing of the application
- [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) - For background statistics processing

### 📖 Useful resources


- [MDN Web Docs](https://developer.mozilla.org/es/) - A very comprehensive resource with tutorials, explanations, and references for HTML, CSS, and JavaScript. I found it very useful for completing this challenge and will continue to use it.

- [W3Schools](https://www.w3schools.com/) - Another great resource for learning to program, and I used it to complete this challenge. I recommend it to anyone still learning this concept.

- [Web Dev](https://web.dev/) - Guidance to build modern web experiences that work on any browser.

- [Javascript Info](https://javascript.info/) - From the basics to advanced topics with simple, but detailed explanations.

- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) Recommended ARIA Implementation Patterns.

- [CSS-Tricks](https://css-tricks.com/) - For advanced CSS techniques and responsive design.

- [Frontend Mentor Community](https://www.frontendmentor.io/community) - For helpful discussions and sharing of your work.




## ​​Author

- Frontend Mentor - 👨‍💻[@ Rocabor](https://www.frontendmentor.io/profile/Rocabor)

## Acknowledgments

I'm grateful to Frontend Mentor for providing a realistic challenge that allowed me to delve deeper into:

- Complex state management in vanilla JavaScript applications

- Implementing web accessibility with ARIA roles and attributes

- Responsive design that works on mobile and desktop devices

- Data persistence using the localStorage API

- Handling keyboard and touch events for different devices

- Calculating real-time metrics such as WPM and accuracy

- Performance optimization for a smooth user experience

This project helped me become a more well-rounded frontend developer, focusing not only on functionality but also on accessibility, user experience, and maintainable code.




