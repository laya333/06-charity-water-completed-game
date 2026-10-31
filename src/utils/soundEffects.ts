// Browser Audio object-based sound effect system for The Water Line

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function createWavDataUri(
  sampleRate: number,
  duration: number,
  sampleFn: (t: number, index: number) => number
): string {
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // File length minus 8
  view.setUint32(4, 36 + numSamples * 2, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // Format chunk identifier
  writeString(view, 12, 'fmt ');
  // Format chunk length (16 for PCM)
  view.setUint32(16, 16, true);
  // Sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // Channels (1 = mono)
  view.setUint16(22, 1, true);
  // Sample rate
  view.setUint32(24, sampleRate, true);
  // Byte rate (sampleRate * 2 for 16-bit mono)
  view.setUint32(28, sampleRate * 2, true);
  // Block align (2 bytes)
  view.setUint16(32, 2, true);
  // Bits per sample
  view.setUint16(34, 16, true);
  // Data chunk identifier
  writeString(view, 36, 'data');
  // Data chunk length
  view.setUint32(40, numSamples * 2, true);

  // Write samples
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.max(-1, Math.min(1, sampleFn(t, i)));
    view.setInt16(offset, sample < 0 ? sample * 32768 : sample * 32767, true);
    offset += 2;
  }

  // Convert buffer to base64 data URI
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

// 1. Clean water drop sound (water bloop with upward frequency chirp)
function generateCleanDropWav(pitchMultiplier = 1.0): string {
  const sampleRate = 22050;
  const duration = 0.22;
  return createWavDataUri(sampleRate, duration, (t) => {
    const freq = (480 + 400 * (1 - Math.exp(-t * 30))) * pitchMultiplier;
    const env = Math.exp(-t * 22);
    const fundamental = Math.sin(2 * Math.PI * freq * t);
    const harmonic = 0.3 * Math.sin(2 * Math.PI * freq * 2 * t);
    return (fundamental + harmonic) * env * 0.75;
  });
}

// 2. Dirty water drop sound (muddy, dissonant, descending thud)
function generateDirtyDropWav(): string {
  const sampleRate = 22050;
  const duration = 0.28;
  return createWavDataUri(sampleRate, duration, (t) => {
    const freq = Math.max(50, 160 - 320 * t);
    const env = Math.exp(-t * 14);
    const tone1 = Math.sin(2 * Math.PI * freq * t);
    const tone2 = 0.4 * Math.sin(2 * Math.PI * (freq * 1.42) * t);
    const noise = (Math.random() * 2 - 1) * 0.25;
    return (tone1 + tone2 + noise) * env * 0.7;
  });
}

// 3. BioSand Filter drop sound (sparkling crystal activation sound)
function generateFilterPowerupWav(): string {
  const sampleRate = 22050;
  const duration = 0.45;
  return createWavDataUri(sampleRate, duration, (t) => {
    const freq = 600 + 700 * t;
    const env = Math.exp(-t * 6.5);
    const sparkle = Math.sin(2 * Math.PI * (freq + 15 * Math.sin(2 * Math.PI * 25 * t)) * t);
    const shimmer = 0.35 * Math.sin(2 * Math.PI * freq * 2 * t);
    return (sparkle + shimmer) * env * 0.65;
  });
}

// 4. Spring Surge drop sound (golden rush chime)
function generateSurgeWav(): string {
  const sampleRate = 22050;
  const duration = 0.38;
  return createWavDataUri(sampleRate, duration, (t) => {
    // 2-tone bright chord
    const env = Math.exp(-t * 8);
    const toneA = Math.sin(2 * Math.PI * 784 * t);
    const toneB = 0.6 * Math.sin(2 * Math.PI * 1046 * t);
    return (toneA + toneB) * env * 0.65;
  });
}

// 5. Milestone unlocked sound (resonant celebratory impact chime)
function generateMilestoneWav(): string {
  const sampleRate = 22050;
  const duration = 0.65;
  return createWavDataUri(sampleRate, duration, (t) => {
    const env = Math.exp(-t * 4);
    const c5 = Math.sin(2 * Math.PI * 523.25 * t);
    const e5 = 0.5 * Math.sin(2 * Math.PI * 659.25 * t);
    const g5 = 0.5 * Math.sin(2 * Math.PI * 783.99 * t);
    return (c5 + e5 + g5) * env * 0.5;
  });
}

// 6. Win fanfare sound (joyful ascending 4-note arpeggio)
function generateWinWav(): string {
  const sampleRate = 22050;
  const duration = 0.95;
  const notes = [
    { start: 0.0, end: 0.22, freq: 523.25 },
    { start: 0.18, end: 0.40, freq: 659.25 },
    { start: 0.36, end: 0.60, freq: 783.99 },
    { start: 0.54, end: 0.95, freq: 1046.5 },
  ];

  return createWavDataUri(sampleRate, duration, (t) => {
    let sample = 0;
    for (const n of notes) {
      if (t >= n.start && t < n.end) {
        const localT = t - n.start;
        const env = Math.exp(-localT * 6);
        const wave = Math.sin(2 * Math.PI * n.freq * localT);
        const harmonic = 0.25 * Math.sin(4 * Math.PI * n.freq * localT);
        sample += (wave + harmonic) * env * 0.55;
      }
    }
    return sample;
  });
}

// 7. Lose sound (downbeat descending 3-note sequence)
function generateLoseWav(): string {
  const sampleRate = 22050;
  const duration = 0.85;
  const notes = [
    { start: 0.0, end: 0.26, freq: 349.23 },
    { start: 0.24, end: 0.52, freq: 293.66 },
    { start: 0.50, end: 0.85, freq: 233.08 },
  ];

  return createWavDataUri(sampleRate, duration, (t) => {
    let sample = 0;
    for (const n of notes) {
      if (t >= n.start && t < n.end) {
        const localT = t - n.start;
        const env = Math.exp(-localT * 4.5);
        const wave = Math.sin(2 * Math.PI * n.freq * localT);
        sample += wave * env * 0.5;
      }
    }
    return sample;
  });
}

// Pre-synthesized Data URIs
const cleanDropUris = [
  generateCleanDropWav(1.0),
  generateCleanDropWav(1.1),
  generateCleanDropWav(1.2),
  generateCleanDropWav(1.3),
];
const dirtyDropUri = generateDirtyDropWav();
const filterPowerupUri = generateFilterPowerupWav();
const surgeUri = generateSurgeWav();
const milestoneUri = generateMilestoneWav();
const winUri = generateWinWav();
const loseUri = generateLoseWav();

// Audio object pools to allow rapid overlapping sounds without stutter
const POOL_SIZE = 4;
const cleanAudioPool: HTMLAudioElement[][] = cleanDropUris.map((uri) =>
  Array.from({ length: POOL_SIZE }, () => {
    const audio = new Audio(uri);
    audio.preload = 'auto';
    return audio;
  })
);

const dirtyAudioPool: HTMLAudioElement[] = Array.from({ length: POOL_SIZE }, () => {
  const audio = new Audio(dirtyDropUri);
  audio.preload = 'auto';
  return audio;
});

const filterAudioPool: HTMLAudioElement[] = Array.from({ length: 2 }, () => {
  const audio = new Audio(filterPowerupUri);
  audio.preload = 'auto';
  return audio;
});

const surgeAudioPool: HTMLAudioElement[] = Array.from({ length: 2 }, () => {
  const audio = new Audio(surgeUri);
  audio.preload = 'auto';
  return audio;
});

let milestoneAudio: HTMLAudioElement | null = null;
let winAudio: HTMLAudioElement | null = null;
let loseAudio: HTMLAudioElement | null = null;

let cleanPoolIndex = 0;
let dirtyPoolIndex = 0;
let filterPoolIndex = 0;
let surgePoolIndex = 0;
let soundEnabled = true;

// Helper to safely play a browser Audio object
function playAudio(audio: HTMLAudioElement): void {
  if (!soundEnabled) return;
  try {
    audio.currentTime = 0;
    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch(() => {
        // Autoplay policy or user hasn't interacted yet; safely ignored
      });
    }
  } catch {
    // Ignore browser audio restrictions
  }
}

export const soundSystem = {
  playCleanDrop(streak = 0): void {
    if (!soundEnabled) return;
    const pitchTier = Math.min(cleanDropUris.length - 1, Math.floor(streak / 5));
    const pool = cleanAudioPool[pitchTier];
    const audio = pool[cleanPoolIndex % pool.length];
    cleanPoolIndex++;
    playAudio(audio);
  },

  playDirtyDrop(): void {
    if (!soundEnabled) return;
    const audio = dirtyAudioPool[dirtyPoolIndex % dirtyAudioPool.length];
    dirtyPoolIndex++;
    playAudio(audio);
  },

  playFilterPowerup(): void {
    if (!soundEnabled) return;
    const audio = filterAudioPool[filterPoolIndex % filterAudioPool.length];
    filterPoolIndex++;
    playAudio(audio);
  },

  playSurge(): void {
    if (!soundEnabled) return;
    const audio = surgeAudioPool[surgePoolIndex % surgeAudioPool.length];
    surgePoolIndex++;
    playAudio(audio);
  },

  playMilestone(): void {
    if (!soundEnabled) return;
    if (!milestoneAudio) {
      milestoneAudio = new Audio(milestoneUri);
    }
    playAudio(milestoneAudio);
  },

  playWin(): void {
    if (!soundEnabled) return;
    if (!winAudio) {
      winAudio = new Audio(winUri);
    }
    playAudio(winAudio);
  },

  playLose(): void {
    if (!soundEnabled) return;
    if (!loseAudio) {
      loseAudio = new Audio(loseUri);
    }
    playAudio(loseAudio);
  },

  isMuted(): boolean {
    return !soundEnabled;
  },

  setMuted(muted: boolean): void {
    soundEnabled = !muted;
  },

  toggleMute(): boolean {
    soundEnabled = !soundEnabled;
    return !soundEnabled;
  },
};
