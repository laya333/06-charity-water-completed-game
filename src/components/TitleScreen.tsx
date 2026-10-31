import React from 'react';
import { DifficultyMode, DIFFICULTIES } from '../constants/difficulty';

interface TitleScreenProps {
  selectedDifficulty: DifficultyMode;
  onSelectDifficulty: (mode: DifficultyMode) => void;
  bestStreakForMode: number;
  totalLitersCollected: number;
  totalVictories: number;
  onStart: () => void;
  onInstructions: () => void;
  onLearn: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedDifficulty,
  onSelectDifficulty,
  bestStreakForMode,
  totalLitersCollected,
  totalVictories,
  onStart,
  onInstructions,
  onLearn,
}) => {
  const currentConfig = DIFFICULTIES[selectedDifficulty];
  const daysOfWater = (totalLitersCollected / 5).toFixed(1);

  return (
    <section id="title-screen" className="screen">
      <h1>Welcome to The Water Line</h1>
      <p>Fill the iconic Yellow Jerry Can with clean water. Every drop makes a difference.</p>
      <div className="title-cloud" role="img" aria-label="cloud">☁️</div>

      {/* Community Impact Tracker (Lifetime) */}
      {totalLitersCollected > 0 && (
        <div className="community-impact-banner" role="status">
          <span className="impact-banner-icon">🌍</span>
          <div className="impact-banner-content">
            <strong>Community Impact: {totalLitersCollected} Liters Collected!</strong>
            <p>Equal to ~{daysOfWater} days of safe, clean water for children in need ({totalVictories} Jerry Cans delivered).</p>
          </div>
        </div>
      )}

      {/* Clean Difficulty Selector */}
      <div className="difficulty-container" aria-label="Difficulty Selection">
        <label className="difficulty-label">Select Difficulty:</label>
        <div className="difficulty-tabs" role="tablist">
          {(Object.keys(DIFFICULTIES) as DifficultyMode[]).map((mode) => {
            const config = DIFFICULTIES[mode];
            const isSelected = selectedDifficulty === mode;
            return (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`difficulty-tab-btn ${isSelected ? 'active' : ''}`}
                style={isSelected ? { borderColor: config.badgeColor } : undefined}
                onClick={() => onSelectDifficulty(mode)}
              >
                <span className="mode-name">{config.label}</span>
                <span className="mode-goal">{config.targetScore} Liters • {config.timeLimit}s</span>
              </button>
            );
          })}
        </div>

        {bestStreakForMode > 0 && (
          <div className="difficulty-streak-indicator">
            <span>Best Win Streak ({currentConfig.label}): <strong>{bestStreakForMode}</strong></span>
          </div>
        )}
      </div>

      <div className="title-actions">
        <button id="start-button" className="primary-start-btn" onClick={onStart}>
          Collect Clean Water ({currentConfig.label})
        </button>
        <div className="secondary-actions">
          <button
            id="instructions-button"
            className="secondary-button"
            onClick={onInstructions}
          >
            How to Play & Power-Ups
          </button>
          <button
            id="learn-button"
            className="secondary-button"
            onClick={onLearn}
          >
            Learn About Charity Water
          </button>
        </div>
      </div>
    </section>
  );
};
