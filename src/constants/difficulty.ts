export type DifficultyMode = 'easy' | 'normal' | 'hard';

export interface DifficultyConfig {
  id: DifficultyMode;
  label: string;
  tagline: string;
  targetScore: number;
  timeLimit: number;
  dropletSpeed: number;
  spawnInterval: number;
  cleanChance: number;
  dirtyPenalty: number;
  waterIncrement: number;
  badgeColor: string;
  description: string;
}

export const DIFFICULTIES: Record<DifficultyMode, DifficultyConfig> = {
  easy: {
    id: 'easy',
    label: 'Easy',
    tagline: 'Gentle Rain',
    targetScore: 15,
    timeLimit: 60,
    dropletSpeed: 110,
    spawnInterval: 800,
    cleanChance: 0.8,
    dirtyPenalty: 1,
    waterIncrement: 10,
    badgeColor: '#4FCB53', // Brand Green
    description: 'Slower droplets, 80% clean drops, -1 penalty, 15 points to win.',
  },
  normal: {
    id: 'normal',
    label: 'Normal',
    tagline: 'Steady Flow',
    targetScore: 20,
    timeLimit: 60,
    dropletSpeed: 140,
    spawnInterval: 700,
    cleanChance: 0.7,
    dirtyPenalty: 2,
    waterIncrement: 8,
    badgeColor: '#2E9DF7', // Brand Blue
    description: 'Classic pace: 70% clean drops, -2 penalty, 20 points to win.',
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    tagline: 'Downpour Challenge',
    targetScore: 25,
    timeLimit: 45,
    dropletSpeed: 185,
    spawnInterval: 550,
    cleanChance: 0.6,
    dirtyPenalty: 3,
    waterIncrement: 7,
    badgeColor: '#FF902A', // Brand Orange
    description: 'High-speed downpour, 45s timer, -3 penalty, 25 points to win.',
  },
};
