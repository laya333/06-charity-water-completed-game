# The Water Line (charity: water)

An interactive React web game built with TypeScript and Vite. Players maneuver a water can bucket to collect clean water droplets while avoiding contaminated water drops, raising awareness for global clean water access.

## Features & Gameplay

- **Clean Water Liters & Yellow Jerry Can Mission**:
  - Score represents **Liters of Clean Water** collected into charity: water's iconic 20L Yellow Jerry Can.
  - Real-World Impact Milestones trigger as you collect water:
    - **5L**: Daily clean drinking water for a child
    - **10L**: BioSand filter activated
    - **15L**: Classroom water station
    - **20L**: Full 20L Jerry Can delivered to a household
    - **25L+**: Piped tap stand supported
  - Lifetime community impact tracker persisting total liters delivered and child-days of clean water provided.
- **Mission-Themed Special Drops & Power-Ups**:
  - 💧 **Clean Droplet (+1L)**: Fills water level and advances win streak.
  - 🧪 **BioSand Filter Drop (Power-Up)**: Activates 5 seconds of active purification, converting all falling contaminated drops into purified clean drops with glowing visual effects.
  - ⚡ **Spring Surge Drop (Bonus)**: Pours +3 Liters directly and boosts streak by +2.
  - 🍂 **Contaminated Drop**: Subtracts liters due to contamination and resets win streak.
  - 🪨 **Muddy Silt Clump (Wobbly Drop)**: Falls with a sinusoidal wave path, requiring agile dodging.
- **Difficulty Modes (Easy, Normal, Hard)**:
  - **Easy (Gentle Rain)**: 15L goal, 60s timer, slower droplets (110 px/s), 80% clean drops, and -1L contamination penalty.
  - **Normal (Steady Flow)**: 20L goal, 60s timer, standard speed (140 px/s), 70% clean drops, and -2L penalty.
  - **Hard (Downpour Challenge)**: 25L goal, 45s timer, high-speed droplets (185 px/s), 60% clean drops, and -3L penalty.
- **Controls**:
  - Keyboard: `ArrowLeft` / `ArrowRight` or `A` / `D`
  - Mouse & Touch: Drag or tap your yellow can directly across the play area.
- **Game State Screens**:
  - Title Screen with interactive difficulty selector and rules preview
  - Live Game Screen with mode banner, score against target, countdown timer, streak, and gauge
  - Pause & Resume screen displaying active mode and goal
  - Game Over & Victory screen with celebratory confetti and difficulty-specific stats
- **Charity: water Visuals**: Authentic brand styling, logos, illustrations, and water can imagery.

## Tech Stack

- React 18
- TypeScript
- Vite
- Modern CSS with charity: water brand tokens
