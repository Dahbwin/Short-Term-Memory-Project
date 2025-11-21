// sound.js - Sound effects system

const SOUND_KEY = 'nst_sounds';
const DEFAULT_CONFIG = {
  enabled: true,  // Enabled - WAV files are now valid
  volume: 0.5
};

let soundConfig = { ...DEFAULT_CONFIG };
let audioCache = {};

export function getSoundConfig() {
  try {
    const stored = localStorage.getItem(SOUND_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (err) {
    console.warn('Sound config parse error:', err);
  }
  return { ...DEFAULT_CONFIG };
}

export function saveSoundConfig(config) {
  soundConfig = { ...DEFAULT_CONFIG, ...config };
  localStorage.setItem(SOUND_KEY, JSON.stringify(soundConfig));
}

export function setSoundEnabled(enabled) {
  soundConfig.enabled = Boolean(enabled);
  saveSoundConfig(soundConfig);
}

export function setSoundVolume(volume) {
  soundConfig.volume = Math.max(0, Math.min(1, Number(volume)));
  saveSoundConfig(soundConfig);
}

export function playSound(name) {
  console.log(`playSound called: ${name}, enabled: ${soundConfig.enabled}, volume: ${soundConfig.volume}`);
  if (!soundConfig.enabled) return;
  
  try {
    // Always create new Audio instance for reliability
    const audio = new Audio(`./assets/sfx/${name}.wav`);
    audio.volume = soundConfig.volume;
    console.log(`Playing sound: ${name} at volume ${soundConfig.volume}`);
    audio.play().then(() => {
      console.log(`Sound ${name} played successfully`);
    }).catch(err => {
      // Silently fail if user hasn't interacted yet (autoplay policy)
      if (err.name !== 'NotAllowedError') {
        console.warn(`Sound play error (${name}):`, err);
      } else {
        console.log(`Autoplay blocked for ${name} - user interaction needed`);
      }
    });
  } catch (err) {
    console.warn(`Sound error (${name}):`, err);
  }
}

export function initSound() {
  soundConfig = getSoundConfig();
  console.log('Sound system initialized:', soundConfig);
}

// Preload sounds
export function preloadSounds() {
  console.log('Preloading sounds...');
  ['show_item', 'correct', 'wrong'].forEach(name => {
    const audio = new Audio(`./assets/sfx/${name}.wav`);
    audio.preload = 'auto';
    audioCache[name] = audio;
  });
  console.log('Sounds preloaded');
}
