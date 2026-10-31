import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DifficultyConfig } from '../constants/difficulty';
import { DropletType } from '../types';
import { IMPACT_MILESTONES, ImpactMilestone } from '../constants/milestones';
import { soundSystem } from '../utils/soundEffects';
import { PauseScreen } from './PauseScreen';

interface GameScreenProps {
  difficulty: DifficultyConfig;
  isPaused?: boolean;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
  onGameOver: (stats: {
    score: number;
    liters: number;
    bestStreak: number;
    won: boolean;
    unlockedMilestones: ImpactMilestone[];
  }) => void;
  initialBestStreak: number;
}

interface Droplet {
  id: number;
  x: number;
  y: number;
  type: DropletType;
  baseX: number;
  wobbleSpeed?: number;
  wobbleOffset?: number;
}

const BUCKET_WIDTH = 76;
const BUCKET_HEIGHT = 58;
const BUCKET_SPEED = 500;

export const GameScreen: React.FC<GameScreenProps> = ({
  difficulty,
  isPaused = false,
  onPause,
  onResume,
  onRestart,
  onMenu,
  onGameOver,
  initialBestStreak,
}) => {
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const bucketRef = useRef<HTMLDivElement>(null);

  // Visible reactive state for stats
  const [liters, setLiters] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(difficulty.timeLimit);
  const [streak, setStreak] = useState<number>(0);
  const [waterAmount, setWaterAmount] = useState<number>(0);
  const [droplets, setDroplets] = useState<Droplet[]>([]);
  const [activeFilterSeconds, setActiveFilterSeconds] = useState<number>(0);
  const [latestMilestone, setLatestMilestone] = useState<ImpactMilestone | null>(null);

  // Mutable refs for high-frequency 60fps loop
  const litersRef = useRef<number>(0);
  const timeLeftRef = useRef<number>(difficulty.timeLimit);
  const streakRef = useRef<number>(0);
  const bestStreakRef = useRef<number>(initialBestStreak);
  const waterAmountRef = useRef<number>(0);
  const bucketXRef = useRef<number>(0);
  const dropletsRef = useRef<Droplet[]>([]);
  const keysPressedRef = useRef<Record<string, boolean>>({});
  const nextDropletIdRef = useRef<number>(1);

  // Power-up and Milestone refs
  const filterTimerMsRef = useRef<number>(0);
  const unlockedMilestonesRef = useRef<Set<number>>(new Set());
  const achievedMilestonesListRef = useRef<ImpactMilestone[]>([]);
  const isInitializedRef = useRef<boolean>(false);

  // Loop control refs
  const animationIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const spawnElapsedRef = useRef<number>(0);
  const secondElapsedRef = useRef<number>(0);
  const isGameOverTriggeredRef = useRef<boolean>(false);

  // Sync initial best streak
  useEffect(() => {
    bestStreakRef.current = initialBestStreak;
  }, [initialBestStreak]);

  // Handle End Game
  const handleEndGame = useCallback(() => {
    if (isGameOverTriggeredRef.current) return;
    isGameOverTriggeredRef.current = true;

    if (animationIdRef.current !== null) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }

    const currentLiters = litersRef.current;
    const won = currentLiters >= difficulty.targetScore;
    let finalStreak = streakRef.current;
    let finalBest = bestStreakRef.current;

    if (won) {
      finalStreak += 1;
      finalBest = Math.max(finalBest, finalStreak);
      soundSystem.playWin();
    } else {
      finalStreak = 0;
      soundSystem.playLose();
    }

    streakRef.current = finalStreak;
    bestStreakRef.current = finalBest;

    onGameOver({
      score: currentLiters,
      liters: currentLiters,
      bestStreak: finalBest,
      won,
      unlockedMilestones: achievedMilestonesListRef.current,
    });
  }, [difficulty.targetScore, onGameOver]);

  // Check and trigger real-world impact milestones
  const checkMilestones = useCallback((currentLiters: number) => {
    for (const m of IMPACT_MILESTONES) {
      if (currentLiters >= m.liters && !unlockedMilestonesRef.current.has(m.liters)) {
        unlockedMilestonesRef.current.add(m.liters);
        achievedMilestonesListRef.current.push(m);
        // Stays put as the active banner instead of disappearing
        setLatestMilestone(m);
        soundSystem.playMilestone();
      }
    }
  }, []);

  // Main game loop & Pause/Resume handling
  useEffect(() => {
    const area = gameAreaRef.current;
    if (!area) return;

    // First mount initialization only
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      const initialX = Math.max(0, (area.clientWidth - BUCKET_WIDTH) / 2);
      bucketXRef.current = initialX;
      if (bucketRef.current) {
        bucketRef.current.style.left = `${initialX}px`;
      }

      litersRef.current = 0;
      streakRef.current = 0;
      waterAmountRef.current = 0;
      filterTimerMsRef.current = 0;
      unlockedMilestonesRef.current = new Set();
      achievedMilestonesListRef.current = [];
      dropletsRef.current = [];
      timeLeftRef.current = difficulty.timeLimit;

      setTimeLeft(difficulty.timeLimit);
      setLiters(0);
      setStreak(0);
      setWaterAmount(0);
      setActiveFilterSeconds(0);
      setLatestMilestone(null);
      setDroplets([]);
      spawnElapsedRef.current = 0;
      secondElapsedRef.current = 0;
      isGameOverTriggeredRef.current = false;
    }

    // If currently paused, halt loop and reset frame time anchor
    if (isPaused) {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      lastFrameTimeRef.current = 0;
      return;
    }

    if (isGameOverTriggeredRef.current) return;

    // Resuming active loop: anchor current timestamp
    lastFrameTimeRef.current = performance.now();

    const dropletSpeed = difficulty.dropletSpeed;
    const spawnInterval = difficulty.spawnInterval;
    const cleanChance = difficulty.cleanChance;
    const dirtyPenalty = difficulty.dirtyPenalty;
    const waterIncrement = difficulty.waterIncrement;

    const gameLoop = (timestamp: number) => {
      if (isGameOverTriggeredRef.current) return;

      if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = timestamp;
      }

      const deltaTime = Math.min((timestamp - lastFrameTimeRef.current) / 1000, 0.05);
      lastFrameTimeRef.current = timestamp;

      // 1. Update countdown from exactly the remaining time
      secondElapsedRef.current += deltaTime;
      if (secondElapsedRef.current >= 1) {
        const secondsPassed = Math.floor(secondElapsedRef.current);
        timeLeftRef.current = Math.max(0, timeLeftRef.current - secondsPassed);
        secondElapsedRef.current -= secondsPassed;
        setTimeLeft(timeLeftRef.current);

        if (timeLeftRef.current <= 0) {
          handleEndGame();
          return;
        }
      }

      // Update BioSand filter duration
      if (filterTimerMsRef.current > 0) {
        filterTimerMsRef.current = Math.max(0, filterTimerMsRef.current - deltaTime * 1000);
        const filterSecsLeft = Math.ceil(filterTimerMsRef.current / 1000);
        setActiveFilterSeconds(filterSecsLeft);
      } else if (activeFilterSeconds > 0) {
        setActiveFilterSeconds(0);
      }

      // 2. Spawn droplets
      spawnElapsedRef.current += deltaTime * 1000;
      const currentArea = gameAreaRef.current;
      const areaWidth = currentArea ? currentArea.clientWidth : 720;
      const areaHeight = currentArea ? currentArea.clientHeight : 400;

      while (spawnElapsedRef.current >= spawnInterval) {
        const roll = Math.random();
        let type: DropletType = 'clean';

        if (roll < 0.10) {
          type = 'filter';
        } else if (roll < 0.18) {
          type = 'surge';
        } else {
          const subRoll = Math.random();
          if (subRoll < cleanChance) {
            type = 'clean';
          } else {
            type = (difficulty.id !== 'easy' && Math.random() < 0.5) ? 'silt' : 'dirty';
          }
        }

        const maxX = Math.max(0, areaWidth - 22);
        const spawnX = Math.random() * maxX;
        const spawnY = 95;

        dropletsRef.current.push({
          id: nextDropletIdRef.current++,
          x: spawnX,
          baseX: spawnX,
          y: spawnY,
          type,
          wobbleSpeed: 4 + Math.random() * 3,
          wobbleOffset: Math.random() * Math.PI * 2,
        });

        spawnElapsedRef.current -= spawnInterval;
      }

      // 3. Move bucket (if not paused)
      const keys = keysPressedRef.current;
      if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        bucketXRef.current -= BUCKET_SPEED * deltaTime;
      }
      if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        bucketXRef.current += BUCKET_SPEED * deltaTime;
      }

      const maxX = Math.max(0, areaWidth - BUCKET_WIDTH);
      bucketXRef.current = Math.max(0, Math.min(bucketXRef.current, maxX));

      if (bucketRef.current) {
        bucketRef.current.style.left = `${bucketXRef.current}px`;
      }

      // 4. Update droplets and check collisions
      const bucketTop = areaHeight - BUCKET_HEIGHT - 8;
      const bucketRight = bucketXRef.current + BUCKET_WIDTH;
      const currentDroplets = dropletsRef.current;
      const remainingDroplets: Droplet[] = [];
      let litersChanged = false;
      const isFilterActive = filterTimerMsRef.current > 0;

      for (let i = 0; i < currentDroplets.length; i++) {
        const d = currentDroplets[i];
        d.y += dropletSpeed * deltaTime;

        if (d.type === 'silt' && d.wobbleSpeed !== undefined) {
          d.wobbleOffset = (d.wobbleOffset || 0) + d.wobbleSpeed * deltaTime;
          d.x = Math.max(0, Math.min(areaWidth - 20, d.baseX + Math.sin(d.wobbleOffset) * 24));
        }

        const dropletLeft = d.x;
        const dropletRight = d.x + 20;
        const dropletBottom = d.y + 20;

        const overlapsBucket =
          dropletRight > bucketXRef.current &&
          dropletLeft < bucketRight &&
          dropletBottom >= bucketTop &&
          d.y <= bucketTop + BUCKET_HEIGHT;

        if (overlapsBucket) {
          litersChanged = true;

          if (d.type === 'filter') {
            filterTimerMsRef.current = 5000;
            setActiveFilterSeconds(5);
            litersRef.current += 1;
            streakRef.current += 1;
            bestStreakRef.current = Math.max(bestStreakRef.current, streakRef.current);
            waterAmountRef.current = Math.min(waterAmountRef.current + waterIncrement * 1.5, 100);
            soundSystem.playFilterPowerup();
            checkMilestones(litersRef.current);
          } else if (d.type === 'surge') {
            litersRef.current += 3;
            streakRef.current += 2;
            bestStreakRef.current = Math.max(bestStreakRef.current, streakRef.current);
            waterAmountRef.current = Math.min(waterAmountRef.current + waterIncrement * 2.5, 100);
            soundSystem.playSurge();
            checkMilestones(litersRef.current);
          } else if (d.type === 'clean' || isFilterActive) {
            litersRef.current += 1;
            streakRef.current += 1;
            bestStreakRef.current = Math.max(bestStreakRef.current, streakRef.current);
            waterAmountRef.current = Math.min(waterAmountRef.current + waterIncrement, 100);
            soundSystem.playCleanDrop(streakRef.current);
            checkMilestones(litersRef.current);
          } else {
            litersRef.current = Math.max(0, litersRef.current - dirtyPenalty);
            streakRef.current = 0;
            soundSystem.playDirtyDrop();
          }
        } else if (d.y <= areaHeight) {
          remainingDroplets.push(d);
        }
      }

      dropletsRef.current = remainingDroplets;
      setDroplets([...remainingDroplets]);

      if (litersChanged) {
        setLiters(litersRef.current);
        setStreak(streakRef.current);
        setWaterAmount(waterAmountRef.current);
      }

      animationIdRef.current = requestAnimationFrame(gameLoop);
    };

    animationIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, [isPaused, difficulty, handleEndGame, checkMilestones]);

  // Key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
      if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
        keysPressedRef.current[e.key] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)) {
        keysPressedRef.current[e.key] = false;
      }
    };

    const handleBlur = () => {
      keysPressedRef.current = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isPaused]);

  // Pointer / Touch support for game area
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPaused || !gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left - BUCKET_WIDTH / 2;
    const maxX = Math.max(0, rect.width - BUCKET_WIDTH);
    bucketXRef.current = Math.max(0, Math.min(clickX, maxX));
    if (bucketRef.current) {
      bucketRef.current.style.left = `${bucketXRef.current}px`;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPaused || e.buttons !== 1 || !gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left - BUCKET_WIDTH / 2;
    const maxX = Math.max(0, rect.width - BUCKET_WIDTH);
    bucketXRef.current = Math.max(0, Math.min(clickX, maxX));
    if (bucketRef.current) {
      bucketRef.current.style.left = `${bucketXRef.current}px`;
    }
  };

  const progressPercentage = Math.min(100, Math.max(0, (liters / difficulty.targetScore) * 100));
  const isBioSandActive = activeFilterSeconds > 0;
  const remainingLiters = Math.max(0, difficulty.targetScore - liters);

  return (
    <section id="game-screen" className="game-screen-wrapper">
      {/* Permanent, Fixed-Height Banner that stays put on the game with zero layout shake */}
      <div
        className={`game-live-banner ${isBioSandActive ? 'biosand-active' : latestMilestone ? 'milestone-active' : ''}`}
        role="status"
        aria-live="polite"
      >
        <div className="banner-left">
          <span
            className="difficulty-badge"
            style={{ backgroundColor: difficulty.badgeColor }}
          >
            {difficulty.label}
          </span>

          {isBioSandActive ? (
            <div className="banner-message biosand-msg">
              <span className="banner-icon">🧪</span>
              <strong>BioSand Filter Active ({activeFilterSeconds}s)</strong>
              <span className="banner-subtext">— Purifying all dirty water!</span>
            </div>
          ) : latestMilestone ? (
            <div className="banner-message milestone-msg">
              <span className="banner-icon">{latestMilestone.icon}</span>
              <strong>Impact Milestone: {latestMilestone.title} ({latestMilestone.liters}L)!</strong>
            </div>
          ) : (
            <div className="banner-message standard-msg">
              <span className="banner-icon">🎯</span>
              <strong>Target: {difficulty.targetScore} Liters</strong>
              <span className="banner-subtext">Clean water needed</span>
            </div>
          )}
        </div>

        <div className="banner-right">
          {remainingLiters === 0 ? (
            <span className="goal-achieved-badge">✨ Goal Met!</span>
          ) : (
            <span className="banner-remaining">{remainingLiters}L to go</span>
          )}
        </div>
      </div>

      <header className="game-header">
        <div className="stat">
          <span className="stat-label">Clean Water</span>
          <strong id="score" className="stat-value">
            {liters} <small className="stat-sub">/ {difficulty.targetScore}L</small>
          </strong>
        </div>
        <div className="stat">
          <span className="stat-label">Time</span>
          <strong className="stat-value">
            <span
              id="timer"
              className="timer-count"
              style={{ color: timeLeft <= 10 ? '#F5402C' : 'inherit' }}
            >
              {timeLeft}
            </span>
            <span className="timer-unit">s</span>
          </strong>
        </div>
        <div className="stat">
          <span className="stat-label">Win Streak</span>
          <strong id="streak" className="stat-value">{streak}</strong>
        </div>
      </header>

      {/* Goal Progress Bar */}
      <div className="goal-status">
        <div className="goal-label-row">
          <span>Jerry Can Progress ({liters} / {difficulty.targetScore} Liters)</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="goal-track">
          <div
            className="goal-level"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: liters >= difficulty.targetScore ? '#159A48' : '#FFC907',
            }}
          />
        </div>
      </div>

      <div className="water-status">
        <span>Yellow Jerry Can Fill</span>
        <div className="water-track">
          <div id="water-level" style={{ width: `${waterAmount}%` }} />
        </div>
      </div>

      <div
        id="game-area"
        ref={gameAreaRef}
        className={isBioSandActive ? 'biosand-glow' : ''}
        aria-label="Game area"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <div className="cloud cloud-one" />
        <div className="cloud cloud-two" />
        <div className="cloud cloud-three" />

        {droplets.map((d) => {
          let className = 'droplet';
          let dropSymbol = '';
          if (d.type === 'clean') {
            className += ' clean';
          } else if (d.type === 'dirty') {
            className += isBioSandActive ? ' clean purified' : ' dirty';
          } else if (d.type === 'silt') {
            className += isBioSandActive ? ' clean purified silt-purified' : ' silt';
          } else if (d.type === 'filter') {
            className += ' droplet-filter';
            dropSymbol = '🧪';
          } else if (d.type === 'surge') {
            className += ' droplet-surge';
            dropSymbol = '⚡';
          }

          return (
            <div
              key={d.id}
              className={className}
              style={{
                left: `${d.x}px`,
                top: `${d.y}px`,
              }}
            >
              {dropSymbol && <span className="droplet-symbol">{dropSymbol}</span>}
            </div>
          );
        })}

        <div id="bucket" ref={bucketRef} aria-label="Yellow Jerry Can">
          <img
            src="/img/water-can-transparent.png"
            alt=""
            className="bucket-image"
          />
          <div id="bucket-water" style={{ height: `${waterAmount}%` }} />
        </div>
      </div>

      <div className="game-controls">
        <p>Move with arrow keys, A / D, or drag your can directly</p>

        <div>
          <button id="pause-button" onClick={onPause}>
            Pause
          </button>
          <button
            id="restart-button"
            className="secondary-button"
            onClick={onRestart}
          >
            Restart
          </button>
          <button
            id="menu-button"
            className="secondary-button"
            onClick={onMenu}
          >
            Main Menu / Modes
          </button>
        </div>
      </div>

      {/* When paused, render the PauseScreen overlay on top, freezing time and gameplay */}
      {isPaused && (
        <PauseScreen
          difficulty={difficulty}
          onResume={onResume}
          onRestart={onRestart}
          onMenu={onMenu}
        />
      )}
    </section>
  );
};
