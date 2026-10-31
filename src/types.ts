import { DifficultyMode, DifficultyConfig } from './constants/difficulty';
import { ImpactMilestone } from './constants/milestones';

export type ScreenType = 'title' | 'instructions' | 'learn' | 'game' | 'pause' | 'gameOver';

export type DropletType = 'clean' | 'dirty' | 'filter' | 'surge' | 'silt';

export interface DropletData {
  id: number;
  x: number;
  y: number;
  type: DropletType;
  wobbleOffset?: number;
  wobbleSpeed?: number;
}

export interface GameStats {
  score: number;
  liters: number;
  targetLiters: number;
  timeLeft: number;
  streak: number;
  bestStreak: number;
  waterAmount: number;
  won: boolean;
  difficulty: DifficultyConfig;
  unlockedMilestones: ImpactMilestone[];
}

export interface LifetimeImpact {
  totalLiters: number;
  gamesPlayed: number;
  victories: number;
}

export type { DifficultyMode, DifficultyConfig, ImpactMilestone };
