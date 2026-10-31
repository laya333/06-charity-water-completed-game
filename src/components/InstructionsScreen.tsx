import React from 'react';
import { DIFFICULTIES } from '../constants/difficulty';
import { IMPACT_MILESTONES } from '../constants/milestones';

interface InstructionsScreenProps {
  onBack: () => void;
}

export const InstructionsScreen: React.FC<InstructionsScreenProps> = ({ onBack }) => {
  return (
    <section id="instructions-screen" className="screen">
      <h2>How to Play: Clean Water Mission</h2>
      <p>
        In real communities, millions of women and children walk hours to fetch water.
        Your goal is to fill the iconic <strong>Yellow Jerry Can</strong> with clean drinking water!
      </p>

      {/* Special Mission Drops Guide */}
      <h3 className="section-subtitle">Mission Drops & Power-Ups</h3>
      <div className="drops-guide-grid">
        <div className="drop-guide-card">
          <div className="drop-preview-badge clean">💧</div>
          <div>
            <strong>Clean Water Drop (+1L)</strong>
            <p>Adds 1 Liter of clean water to your Jerry Can and increases your streak.</p>
          </div>
        </div>

        <div className="drop-guide-card">
          <div className="drop-preview-badge droplet-filter">🧪</div>
          <div>
            <strong>BioSand Filter Drop (Power-Up!)</strong>
            <p>Activates 5 seconds of active purification! All falling contaminated water turns into clean water.</p>
          </div>
        </div>

        <div className="drop-guide-card">
          <div className="drop-preview-badge droplet-surge">⚡</div>
          <div>
            <strong>Spring Surge Drop (Bonus!)</strong>
            <p>Instantly pours +3 Liters directly into your Jerry Can and boosts your streak by +2.</p>
          </div>
        </div>

        <div className="drop-guide-card">
          <div className="drop-preview-badge dirty">🍂</div>
          <div>
            <strong>Contaminated Water Drop</strong>
            <p>Subtracts liters from your can due to contamination and resets your win streak to 0.</p>
          </div>
        </div>

        <div className="drop-guide-card">
          <div className="drop-preview-badge silt">🪨</div>
          <div>
            <strong>Muddy Silt Clump (Wobbly)</strong>
            <p>Falls with a wavy path. Steer swiftly around it to keep your water supply pure!</p>
          </div>
        </div>
      </div>

      {/* Real-World Impact Milestones */}
      <h3 className="section-subtitle">Real-World Impact Milestones</h3>
      <div className="milestones-guide-list">
        {IMPACT_MILESTONES.map((m) => (
          <div key={m.liters} className="milestone-guide-item">
            <span className="milestone-icon">{m.icon}</span>
            <div className="milestone-info">
              <strong>{m.liters} Liters: {m.title}</strong>
              <p>{m.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Difficulty Modes Grid */}
      <h3 className="section-subtitle">Difficulty Modes</h3>
      <div className="instructions-modes-grid">
        {Object.values(DIFFICULTIES).map((diff) => (
          <div key={diff.id} className="instructions-mode-card">
            <div className="mode-card-top">
              <span
                className="difficulty-badge"
                style={{ backgroundColor: diff.badgeColor }}
              >
                {diff.label}
              </span>
              <span className="mode-card-tagline">{diff.tagline}</span>
            </div>
            <ul className="mode-rules-list">
              <li>🎯 <strong>Target:</strong> {diff.targetScore} Liters</li>
              <li>⏱️ <strong>Timer:</strong> {diff.timeLimit} seconds</li>
              <li>💧 <strong>Clean Drops:</strong> {Math.round(diff.cleanChance * 100)}% base</li>
              <li>⚠️ <strong>Contamination:</strong> -{diff.dirtyPenalty} Liters</li>
              <li>⚡ <strong>Pace:</strong> {diff.id === 'easy' ? 'Gentle' : diff.id === 'normal' ? 'Moderate' : 'Intense Downpour'}</li>
            </ul>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
        <button id="instructions-back" onClick={onBack}>
          Back to Menu
        </button>
      </div>
    </section>
  );
};
