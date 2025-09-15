## Product Requirements Document (PRD)

### Project: YuGiOh-inspired Chess Trading Game (Web + XR)

### Version: 0.1 (MVP)

### Date: 2025-09-14

### Owners: Product, Design, Engineering

---

## 1) Overview

Build a cross-platform game that blends chess mechanics with trading card summoning, available as:

- 2D browser app
- Spatial XR app for Apple Vision Pro via WebSpatial

Players construct a deck of cards, then play those cards to summon chess-like pieces onto a 3D board and take turns moving pieces per standard chess rules. For the MVP, we use YuGiOh as an example theme for cards and visuals only; long-term we will replace with original IP.

---

## 2) Goals and Non-Goals

- **Goals (MVP)**

  - Deck building: create, edit, and save decks from a card library
  - Card viewing: inspect cards in detail, including XR 3D viewing and spatial placement
  - Playable match: Player vs Computer on a 3D chess arena, turn-based, with card-based summoning and chess movement
  - Win condition: capturing the king ends the game
  - Cross-platform: Web (2D) and Apple Vision Pro (spatial) builds

- **Non-Goals (MVP)**
  - Online PvP matchmaking and networking
  - Advanced card effects beyond mapping to piece summoning and simple modifiers
  - Ranked ladders, social features, friends, chat
  - Commerce/monetization
  - Persistence to cloud backends (local-only is fine for MVP)

---

## 3) Constraints

- **Tech stack**: React, Vite, TailwindCSS, ThreeJS, WebSpatial (for Vision Pro)
- **Performance targets**:
  - Web: 60 FPS on modern laptops; initial load < 3s on fast network
  - XR: 60 FPS; maintain comfortable frame time and low latency interactions
- **IP/Content**: YuGiOh used as example only for MVP. Replace with original branded content before public release.

---

## 4) Platforms and Modes

- **Web (2D)**: Standard desktop browser experience with mouse/keyboard input
- **XR (Spatial)**: Apple Vision Pro via WebSpatial; hand tracking, gaze, and spatial anchoring for card inspection and board viewing

---

## 5) Users and Personas

- **New Player**: curious about hybrid chess-card gameplay; needs onboarding and hints
- **Card Enthusiast**: wants to browse and inspect cards in XR; values visual fidelity
- **Casual Tactician**: wants short PvC matches with clear rules and feedback

---

## 6) MVP Scope

- Deck builder with local persistence (create, edit, save, load decks)
- Card library with filters/search and detail view (2D and XR)
- 3D chess arena with:
  - Turn-based flow: Draw → Summon (optional) → Move → End Turn
  - Summoning via cards to spawn chess pieces
  - Standard chess movement and capture rules
  - Win condition: capture enemy king
  - Single-player vs CPU with a basic AI

---

## 7) Future Scope (Post-MVP)

- Online PvP
- Advanced card effects (buffs, zones, cost systems, cooldowns)
- Progression, unlocks, cosmetics
- Cloud save, profiles, analytics
- Tournaments, rankings

---

## 8) User Stories (MVP)

- As a player, I can browse a library of cards and view details
- As a player, I can build a deck and save it locally
- As a player, I can start a PvC match using a selected deck
- As a player, I can play a card to summon a piece to the board
- As a player, I can move my pieces per chess rules and capture enemy pieces
- As a player, I see clear feedback when I win by capturing the king
- As an XR user, I can view a card as a spatial 3D element, inspect, scale, and reposition it comfortably

---

## 9) Functional Requirements

### 9.1 Deck Builder

- Create a deck from available cards
- View card list with thumbnails, rarity/type tags (placeholder for MVP)
- Add/remove cards via click/tap (web) or hand/pinch (XR)
- Save/load deck locally (localStorage or IndexedDB)
- Validation: deck size constraints (configurable; default 30–40 cards)

### 9.2 Card Library and Detail View

- Card list with search and basic filters (type/piece mapping)
- Card detail panel with art, description, mapped piece type, and any simple modifiers (if used)
- XR: spatially render a large card in 3D space; allow scale/rotate and place within user’s space via WebSpatial

### 9.3 Game Board and Rules

- 3D 8x8 board with coordinate labeling (optional HUD in 2D)
- Camera controls:
  - Web: orbit, pan, zoom via mouse/trackpad
  - XR: spatial placement of board, walk-around viewing; adjustable scale within safe bounds
- Summoning via cards:
  - Each card maps to a chess piece type (pawn/knight/bishop/rook/queen/king)
  - MVP: cards primarily summon that piece; no complex effects
  - Summon constraints (MVP default):
    - Summon to an empty square on your side of the board (first 4 ranks)
    - Cannot summon directly into checkmate state; if ambiguous, disallow squares that leave your king captured immediately
- Movement and capture follow standard chess rules for all pieces
- Turn structure: Player turn then CPU turn; on each turn, player may play at most one card to summon, then may move one piece
- Win condition: capturing the king ends the game and displays result UI

### 9.4 AI

- Simple heuristic-based AI:
  - Prioritize avoiding immediate capture of king
  - Prefer capturing high-value pieces
  - Summon when advantageous (e.g., if can protect king or create capture)
- Performance: respond within 1 second on typical hardware

### 9.5 UI/UX

- Responsive UI with TailwindCSS
- Clear state indicators: current phase (Draw/Summon/Move), selected card, valid squares highlights
- Turn log with minimal text
- Undo/redo for selection before commit; committed moves are final (no takebacks)
- Basic tutorial overlay for first-time users

### 9.6 Settings

- Toggle animations and quality (low/medium/high)
- Audio on/off (if added)
- XR comfort options: scale limits, board height preset

---

## 10) Non-Functional Requirements

- **Performance**: 60 FPS target for XR; degrade gracefully with quality presets
- **Load**: initial bundle < 2 MB gzipped target for web MVP (excluding large textures); lazy-load 3D/XR assets
- **Stability**: no crashes during normal playthrough; graceful error messaging
- **Accessibility**:
  - High-contrast mode; scalable UI text
  - Keyboard navigation support in web mode
  - XR comfort: avoid rapid camera motions; stable world-locked content
- **Offline**: game and decks usable offline after first load
- **Privacy/Security**: no PII; local-only storage for MVP

---

## 11) Technical Approach

- **Frontend**: React + Vite; TailwindCSS for styling
- **3D**: ThreeJS for rendering board, pieces, spatial card visualization
- **XR**: WebSpatial for Apple Vision Pro spatial runtime
- **State**: lightweight store (e.g., Zustand or React Context) – final choice TBD by engineering
- **Data**: local JSON for card definitions; localStorage/IndexedDB for decks and settings
- **Chess Logic**: pure TypeScript module implementing move validation, check detection, and capture rules
- **AI**: simple rules/heuristics; TypeScript module interfacing with game state
- **Build Targets**: two entry points or a mode switch for Web vs XR; feature detection for capabilities

---

## 12) Data Models (MVP)

- Card

  - id: string
  - name: string
  - description: string
  - pieceType: enum("pawn"|"knight"|"bishop"|"rook"|"queen"|"king")
  - artUrl: string

- Deck

  - id: string
  - name: string
  - cardIds: string[]

- GameState
  - board: 8x8 piece grid
  - hands/deck: arrays for draw/summon flow (MVP may simplify to on-demand draw)
  - turn: "player" | "cpu"
  - phase: "draw" | "summon" | "move"

---

## 13) XR Interaction Details (WebSpatial)

- Spatial placement of board on a surface with adjustable scale within bounds
- Card inspection: pinch to grab, rotate, and scale; maintain readable text at 50–80 cm distance
- Gaze/gesture selection for squares and UI buttons
- Hints/reticles for valid targets
- Performance budget: avoid large shadow maps and dynamic lights; prefer baked or simple lighting

---

## 14) Risks and Mitigations

- Performance on XR devices → Quality presets; LOD for models; texture compression
- Input complexity in XR → Keep gestures minimal; provide clear affordances
- IP concerns using YuGiOh → Use placeholder/example assets internally; replace with original IP before public release
- Chess + card rules confusion → In-app tutorial and clear step-by-step turn UI

---

## 15) Open Questions

- Exact deck size and draw mechanics (opening hand size, draw per turn)
- Summon restrictions: allowed squares, piece limits, and king duplication rules
- Card rarity/economy even if cosmetic-only in MVP
- Sound design scope

---

## 16) Milestones and Acceptance Criteria

### M0 – Project Setup (Week 1)

- Vite + React app scaffolding
- Tailwind configured; ThreeJS and WebSpatial dependencies installed
- Mode switch or capability detection for Web vs XR

Acceptance:

- App runs in browser with placeholder scene
- XR build launches and shows a spatial placeholder

### M1 – Deck Builder (Week 2)

- Card list and detail view
- Add/remove cards to deck; save/load locally

Acceptance:

- Create a new deck, persist it, reload app and see the deck
- Search/filter returns expected cards

### M2 – XR Card Inspector (Week 3)

- Spatial card rendering with scale/rotate and placement

Acceptance:

- In XR, a selected card appears as a spatial object that can be repositioned and scaled comfortably

### M3 – Core Gameplay PvC (Weeks 4–5)

- 3D board, turn system, summoning, chess movement, basic AI

Acceptance:

- Player can start a match, summon a piece, make moves, and win by capturing the king
- CPU takes turns within 1 second median response

### M4 – Polish and Performance (Week 6)

- UI refinement, accessibility, quality tiers, bug fixes

Acceptance:

- Stable 60 FPS target in XR test scene; web smooth at 60 FPS on target hardware
- Tutorial overlay explains turn flow and win condition

---

## 17) Success Metrics (MVP)

- Time-to-first-match < 90 seconds for new users
- > 80% of test users complete a match vs CPU
- XR session comfort: no reported motion sickness; >90% rate handling as intuitive

---

## 18) Rollout Plan

- Internal alpha with placeholder assets (YuGiOh-inspired, not distributed publicly)
- Replace with original card IP
- Closed beta on web and TestFlight for Vision Pro if applicable

---

## 19) Appendix

- Competitive references: Chess apps, TCG viewers, hybrid titles
- Glossary: WebSpatial (Apple Vision Pro spatial web runtime), XR (extended reality)
