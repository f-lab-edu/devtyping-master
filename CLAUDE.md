# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev`: Start development server at http://127.0.0.1:5173 (serves `src/` folder)
- `npm run build`: Copy entire `src/` directory to `dist/` for deployment
- `npm run test`: Currently a placeholder (no automated tests configured)

## Project Architecture

This is a TypeScript typing game that has been refactored from a single-file architecture to a modular structure:

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
- `src/app.ts`: Application entry point and initialization
- `src/styles.css`: Game styling
- `src/core/`: Core business logic
  - `constants/`: Game constants and configuration
    - `game-config.ts`: Game settings and constants
    - `index.ts`: Module exports
  - `state/`: Global state management
    - `game-state.ts`: Application state and state mutations
    - `index.ts`: Module exports
  - `game/`: Game engine and logic
    - `game-engine.ts`: Core game mechanics
    - `timer.ts`: Timer and countdown functionality
    - `index.ts`: Module exports
- `src/components/`: UI components
  - `ui/`: Reusable UI components
    - `ui-elements.ts`: Generic UI component builders
    - `index.ts`: Module exports
  - `screens/`: Screen rendering components
    - `name-input.ts`: Name input screen
    - `countdown.ts`: Countdown screen
    - `game.ts`: Game screen
    - `result.ts`: Results screen
    - `index.ts`: Module exports
- `src/utils/`: Utility functions
  - `game-utils.ts`: Game-related utility functions
  - `index.ts`: Module exports
- `src/types/`: TypeScript type definitions
  - `game.types.ts`: Game-specific type definitions
  - `index.ts`: Module exports
- `scripts/dev-server.js`: Simple HTTP server for development
- `scripts/build.js`: Basic file copying for deployment

### Development Notes
- **TypeScript**: Full type safety and modern development experience
- **Modular Architecture**: Clear separation of concerns with domain-driven structure:
  - `core/`: Business logic isolated from UI
  - `components/`: Reusable UI components and screens
  - `utils/`: Shared utility functions
  - `types/`: Centralized type definitions
- **Module System**: Each folder has `index.ts` for clean imports
- **No Build Process**: TypeScript files served directly by browser
- **No External Dependencies**: Only Node.js for development server
- **Performance Optimized**: `requestAnimationFrame` for smooth animations
- **Direct DOM Manipulation**: Using `document.createElement()` for lightweight UI
- **Korean Language**: UI text in Korean for target audience