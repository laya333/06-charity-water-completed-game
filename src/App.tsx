import React, { useState } from 'react';
import { ScreenType } from './types';
import { DifficultyMode, DIFFICULTIES } from './constants/difficulty';
import { ImpactMilestone } from './constants/milestones';
import { Header } from './components/Header';
import { TitleScreen } from './components/TitleScreen';
import { InstructionsScreen } from './components/InstructionsScreen';
import { LearnScreen } from './components/LearnScreen';
import { GameScreen } from './components/GameScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { Confetti } from './components/Confetti';
import { soundSystem } from './utils/soundEffects';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('title');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyMode>('normal');
  const [gameKey, setGameKey] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(soundSystem.isMuted());

  // Lifetime Community Impact State
  const [totalLitersCollected, setTotalLitersCollected] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cw_total_liters');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [totalVictories, setTotalVictories] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cw_total_victories');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  // Track best win streak per difficulty mode
  const [bestStreaks, setBestStreaks] = useState<Record<DifficultyMode, number>>(() => {
    try {
      const saved = localStorage.getItem('cw_best_streaks');
      return saved ? JSON.parse(saved) : { easy: 0, normal: 0, hard: 0 };
    } catch {
      return { easy: 0, normal: 0, hard: 0 };
    }
  });

  const [gameOverStats, setGameOverStats] = useState<{
    score: number;
    liters: number;
    bestStreak: number;
    won: boolean;
    unlockedMilestones: ImpactMilestone[];
  }>({
    score: 0,
    liters: 0,
    bestStreak: 0,
    won: false,
    unlockedMilestones: [],
  });

  const activeDifficultyConfig = DIFFICULTIES[selectedDifficulty];

  const handleStartGame = () => {
    setGameKey((prev) => prev + 1);
    setCurrentScreen('game');
  };

  const handleRestartGame = () => {
    setGameKey((prev) => prev + 1);
    setCurrentScreen('game');
  };

  const handlePause = () => {
    setCurrentScreen('pause');
  };

  const handleResume = () => {
    setCurrentScreen('game');
  };

  const handleReturnToMenu = () => {
    setCurrentScreen('title');
  };

  const handleInstructions = () => {
    setCurrentScreen('instructions');
  };

  const handleLearn = () => {
    setCurrentScreen('learn');
  };

  const handleSelectDifficulty = (mode: DifficultyMode) => {
    setSelectedDifficulty(mode);
  };

  const handleGameOver = (stats: {
    score: number;
    liters: number;
    bestStreak: number;
    won: boolean;
    unlockedMilestones: ImpactMilestone[];
  }) => {
    setGameOverStats(stats);

    // Update lifetime stats
    setTotalLitersCollected((prev) => {
      const updated = prev + stats.liters;
      try {
        localStorage.setItem('cw_total_liters', updated.toString());
      } catch {
        // Safe fallback
      }
      return updated;
    });

    if (stats.won) {
      setTotalVictories((prev) => {
        const updated = prev + 1;
        try {
          localStorage.setItem('cw_total_victories', updated.toString());
        } catch {
          // Safe fallback
        }
        return updated;
      });
    }

    setBestStreaks((prev) => {
      const updated = {
        ...prev,
        [selectedDifficulty]: Math.max(prev[selectedDifficulty], stats.bestStreak),
      };
      try {
        localStorage.setItem('cw_best_streaks', JSON.stringify(updated));
      } catch {
        // Safe fallback
      }
      return updated;
    });

    setCurrentScreen('gameOver');
  };

  const handleToggleMute = () => {
    const muted = soundSystem.toggleMute();
    setIsMuted(muted);
  };

  return (
    <>
      <main className="game-container">
        <Header isMuted={isMuted} onToggleMute={handleToggleMute} />

        {currentScreen === 'title' && (
          <TitleScreen
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={handleSelectDifficulty}
            bestStreakForMode={bestStreaks[selectedDifficulty]}
            totalLitersCollected={totalLitersCollected}
            totalVictories={totalVictories}
            onStart={handleStartGame}
            onInstructions={handleInstructions}
            onLearn={handleLearn}
          />
        )}

        {currentScreen === 'instructions' && (
          <InstructionsScreen onBack={handleReturnToMenu} />
        )}

        {currentScreen === 'learn' && (
          <LearnScreen onBack={handleReturnToMenu} />
        )}

        {(currentScreen === 'game' || currentScreen === 'pause') && (
          <GameScreen
            key={gameKey}
            difficulty={activeDifficultyConfig}
            isPaused={currentScreen === 'pause'}
            onPause={handlePause}
            onResume={handleResume}
            onRestart={handleRestartGame}
            onMenu={handleReturnToMenu}
            onGameOver={handleGameOver}
            initialBestStreak={bestStreaks[selectedDifficulty]}
          />
        )}

        {currentScreen === 'gameOver' && (
          <GameOverScreen
            score={gameOverStats.score}
            liters={gameOverStats.liters}
            bestStreak={bestStreaks[selectedDifficulty]}
            won={gameOverStats.won}
            difficulty={activeDifficultyConfig}
            unlockedMilestones={gameOverStats.unlockedMilestones}
            totalLitersCollected={totalLitersCollected}
            onPlayAgain={handleStartGame}
            onMenu={handleReturnToMenu}
          />
        )}
      </main>

      {currentScreen === 'gameOver' && gameOverStats.won && <Confetti />}
    </>
  );
};

export default App;
