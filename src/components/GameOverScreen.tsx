import React from 'react';
import { DifficultyConfig } from '../constants/difficulty';
import { ImpactMilestone } from '../constants/milestones';

interface GameOverScreenProps {
  score: number;
  liters: number;
  bestStreak: number;
  won: boolean;
  difficulty: DifficultyConfig;
  unlockedMilestones: ImpactMilestone[];
  totalLitersCollected: number;
  onPlayAgain: () => void;
  onMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  liters,
  bestStreak,
  won,
  difficulty,
  unlockedMilestones,
  totalLitersCollected,
  onPlayAgain,
  onMenu,
}) => {
  const litersRemaining = Math.max(0, difficulty.targetScore - liters);
  const totalDays = (totalLitersCollected / 5).toFixed(1);

  return (
    <section id="game-over-screen" className="screen">
      <div className="game-over-badge-wrapper">
        <span
          className="difficulty-badge"
          style={{ backgroundColor: difficulty.badgeColor }}
        >
          {difficulty.label} Mode • {difficulty.tagline}
        </span>
      </div>

      <h2 id="game-over-title">
        {won ? `🎉 Full Jerry Can Delivered!` : "Time's Up!"}
      </h2>

      <img
        src="/img/water-can.png"
        alt="Yellow water can illustration"
        className="game-over-art"
      />

      <div className="game-over-summary-card">
        <p className="liters-result-heading">
          Clean Water Collected:{' '}
          <strong id="final-score" style={{ color: won ? '#159A48' : '#173B57', fontSize: '1.75rem' }}>
            {liters} Liters
          </strong>{' '}
          <span className="target-muted">/ {difficulty.targetScore}L Goal</span>
        </p>

        {won ? (
          <p className="game-over-status win">
            🎯 Mission Accomplished! You filled the full {difficulty.targetScore}L clean water requirement for {difficulty.label} mode.
          </p>
        ) : (
          <p className="game-over-status loss">
            💧 You collected {liters}L and needed {litersRemaining} more Liter{litersRemaining === 1 ? '' : 's'} to complete the mission.
          </p>
        )}

        <p>
          Best Streak this session: <strong id="best-streak">{bestStreak}</strong> clean drops
        </p>
      </div>

      {/* Real-World Milestones Achieved this Round */}
      {unlockedMilestones.length > 0 && (
        <div className="game-over-milestones-card">
          <h4 className="milestones-card-title">🌟 Impact Milestones Unlocked This Run:</h4>
          <div className="milestones-chips-list">
            {unlockedMilestones.map((m) => (
              <div key={m.liters} className="milestone-chip-item">
                <span className="chip-icon">{m.icon}</span>
                <div>
                  <strong>{m.title} ({m.liters}L)</strong>
                  <p>{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lifetime Community Impact Summary */}
      <div className="lifetime-summary-pill">
        <span>🌍 <strong>Lifetime Total:</strong> {totalLitersCollected} Liters collected (~{totalDays} days of clean water for children)</span>
      </div>

      <p className="game-over-mission">
        Access to clean water means health, education, and opportunity.
        Keep collecting drops to spread awareness for charity: water!
      </p>

      <div>
        <button id="play-again-button" onClick={onPlayAgain}>
          Play Again ({difficulty.label})
        </button>
        <button
          id="game-over-menu-button"
          className="secondary-button"
          onClick={onMenu}
        >
          Choose Difficulty / Menu
        </button>
      </div>
    </section>
  );
};
