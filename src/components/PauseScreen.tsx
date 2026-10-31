import React from 'react';
import { DifficultyConfig } from '../constants/difficulty';

interface PauseScreenProps {
  difficulty: DifficultyConfig;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

export const PauseScreen: React.FC<PauseScreenProps> = ({
  difficulty,
  onResume,
  onRestart,
  onMenu,
}) => {
  return (
    <section id="pause-screen" className="screen pause-overlay" role="dialog" aria-modal="true" aria-label="Game Paused">
      <div className="pause-modal-card">
        <h2>Game Paused</h2>
        <div className="pause-difficulty-pill">
          <span
            className="difficulty-badge"
            style={{ backgroundColor: difficulty.badgeColor }}
          >
            {difficulty.label} Mode
          </span>
          <span>Goal: {difficulty.targetScore} Liters in {difficulty.timeLimit}s</span>
        </div>
        <p>Take a breath. Ready to continue?</p>
        <div>
          <button id="resume-button" onClick={onResume}>
            Resume Game
          </button>
          <button
            id="pause-restart-button"
            className="secondary-button"
            onClick={onRestart}
          >
            Restart ({difficulty.label})
          </button>
          <button
            id="pause-menu-button"
            className="secondary-button"
            onClick={onMenu}
          >
            Main Menu / Change Mode
          </button>
        </div>
      </div>
    </section>
  );
};
