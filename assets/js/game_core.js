/* game_core.js (moved) */

/*
 * game_core.js
 * Port of the project's Python `game_core` into browser JS.
 * Exports:
 *  - WORDS
 *  - difficultyPresets()
 *  - generateSequence({ min, max, wordInterval, seed }) => { sequence, key }
 *  - parseUserInput(str) => mixed array (numbers and strings)
 *  - checkAnswer(correctSeq, userSeq) => { correct, errors, details }
 */

// Vocabulary (mirrors the Python list exactly)
const WORDS = [
  "apple","banana","cherry","date","fig","grape","kiwi","lemon","mango",
  "nectarine","orange","papaya","quince","raspberry","strawberry",
  "tangerine","ugli fruit","voavanga","watermelon","xigua","yellow passion fruit",
  "zucchini"
];

// Difficulty presets matching the Python table
function difficultyPresets(){
  return {
    easy:   { min: 4,  max: 6,  wordInterval: 2 },
    medium: { min: 7,  max: 10, wordInterval: 2 },
    hard:   { min: 11, max: 15, wordInterval: 3 },
    very_hard: { min: 16, max: 20, wordInterval: 4 }
  };
}

// Backwards-compatible mapping: numeric level ids used by the UI ('1'..'4')
// will resolve to the corresponding preset names. This keeps controller
// code unchanged while supporting the original preset names.
function difficultyPresetsWithNumeric(){
  const base = difficultyPresets();
  const mapped = Object.assign({}, base);
  mapped['1'] = base.easy;
  mapped['2'] = base.medium;
  mapped['3'] = base.hard;
  mapped['4'] = base.very_hard;
  return mapped;
}

// Helper: RNG with optional integer seed (simple LCG for reproducibility)
function makeRng(seed){
  if (seed == null) return Math.random;
  let state = Number(seed) >>> 0;
  return function(){ state = (1664525 * state + 1013904223) >>> 0; return state / 4294967296; };
}

function _shuffleArray(arr, rng=Math.random){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// generateSequence options: { min, max, wordInterval, seed }
function generateSequence({ min=4, max=6, wordInterval=2, seed=null } = {}){
  if (!Number.isInteger(min) || !Number.isInteger(max) || min <= 0 || max < min) throw new Error('invalid min/max');
  if (!Number.isInteger(wordInterval) || wordInterval <= 0) throw new Error('wordInterval must be positive integer');

  const rng = makeRng(seed);
  const total = Math.floor(rng() * (max - min + 1)) + min; // random between min..max inclusive

  const sequence = [];

  // Prepare a shuffled reservoir of words (no repeats until exhausted)
  let wordPool = _shuffleArray(WORDS, rng);
  let numbersSinceLastWord = 0;

  while (sequence.length < total){
    // add a random number 0-9
    const num = Math.floor(rng() * 10);
    sequence.push(num);
    numbersSinceLastWord += 1;

    // if we've hit the wordInterval and still have room, insert a word
    if (numbersSinceLastWord >= wordInterval && sequence.length < total){
      if (wordPool.length === 0){
        // refill and reshuffle when exhausted
        wordPool = _shuffleArray(WORDS, rng);
      }
      const w = wordPool.pop();
      sequence.push(w);
      numbersSinceLastWord = 0;
    }
  }

  // Create a key (mirror of sequence). Keeping `key` for API compatibility.
  const key = sequence.slice();
  return { sequence, key };
}

// parseUserInput: split by comma, trim, convert numbers where possible
function parseUserInput(input){
  if (typeof input !== 'string') return [];
  return input.split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(token => {
      // try integer conversion first
      if (/^-?\d+$/.test(token)) return parseInt(token, 10);
      // try float? follow original: only integers expected (0-9), but keep numeric if provided
      if (/^-?\d+\.\d+$/.test(token)) return parseFloat(token);
      return token;
    });
}

// checkAnswer: compares item-by-item and returns structured details
function checkAnswer(correctSeq, userSeq){
  const details = [];
  const maxLen = Math.max((correctSeq || []).length, (userSeq || []).length);
  let correctCount = 0;

  for (let i=0;i<maxLen;i++){
    const correctVal = (i < (correctSeq||[]).length) ? correctSeq[i] : undefined;
    const userVal = (i < (userSeq||[]).length) ? userSeq[i] : undefined;

    let isCorrect = false;
    if (correctVal === undefined && userVal === undefined) isCorrect = true;
    else if (typeof correctVal === 'number' && typeof userVal === 'number') {
      isCorrect = correctVal === userVal;
    } else if (typeof correctVal === 'string' && typeof userVal === 'string'){
      isCorrect = correctVal.trim().toLowerCase() === userVal.trim().toLowerCase();
    } else {
      // cross-type comparison: allow string numbers vs numbers
      if (typeof correctVal === 'number' && typeof userVal === 'string' && /^-?\d+$/.test(userVal.trim())){
        isCorrect = correctVal === parseInt(userVal.trim(),10);
      } else if (typeof correctVal === 'string' && typeof userVal === 'number'){
        isCorrect = correctVal.trim().toLowerCase() === String(userVal).trim().toLowerCase();
      } else {
        isCorrect = false;
      }
    }

    if (isCorrect) correctCount += 1;
    details.push([userVal, correctVal, isCorrect]);
  }

  const errors = maxLen - correctCount;
  const correct = (errors === 0) && ((userSeq||[]).length === (correctSeq||[]).length);
  return { correct, errors, details };
}

// Export difficultyPresetsWithNumeric under the name `difficultyPresets`
// so existing controller code that indexes by '1'..'4' continues to work.
export { WORDS, generateSequence, parseUserInput, checkAnswer, difficultyPresetsWithNumeric as difficultyPresets };
