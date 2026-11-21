# Math Runner

A browser-based educational math game made with HTML, CSS, and vanilla JavaScript. Solve arithmetic questions while controlling a player across three lanes and choosing answer gates.

## Features

- Addition, subtraction, multiplication, and division options.
- Several answer modes (`Lim`, `Ezy`, `Pro`) with different question/answer behavior.
- Levels, points, and lives.
- Keyboard and pointer/touch interactions.
- Pause, resume, restart, and sound controls.
- Level progression saved locally with `localStorage`.
- Responsive game layout and visual feedback.

## Tech stack

- HTML5
- CSS3
- JavaScript ES modules
- Browser APIs, including `localStorage`

No frontend framework or backend is required by the current source.

## Play locally

1. Clone or download this repository.
2. Start a simple local web server in the project directory (for example, VS Code **Live Server** or `python -m http.server 8000`).
3. Open the local server URL in a modern browser.
4. Select the operation(s) and an answer mode, then press **Ready!** to start.

Using a local web server is recommended because the application loads JavaScript with `type="module"`.

## Project structure

```text
index.html          Game layout and controls
css/style.css       Styling, layout and responsive presentation
js/main.js          Entry point
js/game.js          Game state, interaction and animation loop
js/gameModes.js     Game modes and state presets
js/questions.js     Question and answer generation
js/levels.js        Difficulty settings and saved progress
js/audio.js         Sound controls and effects
js/tests/           Browser-oriented test files
assets/             Images and other game assets
```

## Learning and engineering focus

The project demonstrates DOM manipulation, event handling, ES modules, state management without a framework, animation, responsive UI design and browser persistence.

## Status

The README is based on inspection of the source structure and core files. Browser behavior and automated tests were **not** executed as part of this documentation update. Screenshots and a live demo link can be added later.
