# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev`: Start development server at http://127.0.0.1:5173 (serves `src/` folder)
- `npm run build`: Copy entire `src/` directory to `dist/` for deployment
- `npm run test`: Currently a placeholder (no automated tests configured)

## Project Architecture

This is a vanilla JavaScript typing game with a simple, single-file architecture:

### Core Game Flow
The application follows a state-driven view system with four main screens:
1. **Name Input** (`state.view: 'name'`) - Player enters their name
2. **Countdown** (`state.view: 'countdown'`) - 3-2-1 countdown before game starts
3. **Game** (`state.view: 'game'`) - 60-second typing challenge
4. **Results** (`state.view: 'result'`) - Score display and retry options

### Key Game Mechanics
- Words spawn every 2 seconds from a predefined `WORD_BANK` of programming terms
- Words fall at variable speeds (70-120 pixels/second) from top to bottom
- Players type words and press Enter to score points (10 points per correct word)
- Game tracks hits/misses for accuracy calculation
- Target score is 120 points for "CLEAR" status

### State Management
Global `state` object manages:
- Current view/screen
- Player name
- Game data (score, hits, misses, active words)
- Result data for final screen

The game uses three main timers/loops:
- `countdownTimerId`: Handles 3-2-1 countdown
- `spawnTimerId`: Spawns new words every 2 seconds
- `animationFrameId`: Main game loop for word movement and timer updates

### File Structure
- `src/index.html`: Main HTML structure
- `src/main.js`: All game logic (single file, ~594 lines)
- `src/styles.css`: Game styling
- `scripts/dev-server.js`: Simple HTTP server for development
- `scripts/build.js`: Basic file copying for deployment

### Development Notes
- No build process or bundling - pure vanilla JS/HTML/CSS
- No external dependencies beyond Node.js for dev server
- Direct DOM manipulation with `document.createElement()`
- Performance-optimized with `requestAnimationFrame` for smooth animations
- Korean language UI text