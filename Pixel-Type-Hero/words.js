/**
 * PIXEL TYPE HERO - KID-FRIENDLY VOCABULARY & PROGRESSIVE TIERS
 * Gentle learning curve tailored for beginners and 4th graders.
 * Starts with super accessible 2-3 letter words on the home row and gradually builds confidence.
 */

const TYPING_TIERS = [
  {
    id: 1,
    name: 'Home Row Dojo',
    desc: 'Short & easy 2 to 3 letter starter words using home row keys!',
    difficulty: 'Novice (Starter)',
    bgTheme: 'dojo',
    baseSpeed: 30,
    targetWords: 8,
    requiredScore: 250,
    words: [
      'as', 'ask', 'all', 'dad', 'fad', 'sad', 'lad', 'gas',
      'add', 'had', 'has', 'fall', 'glad'
    ],
    fingerFocus: ['a', 's', 'd', 'f', 'j', 'k', 'l']
  },
  {
    id: 2,
    name: 'Sunny Meadow',
    desc: 'Fun 3-letter animal and nature words to reach top and bottom keys.',
    difficulty: 'Beginner',
    bgTheme: 'meadow',
    baseSpeed: 34,
    targetWords: 8,
    requiredScore: 350,
    words: [
      'cat', 'dog', 'fox', 'pig', 'owl', 'bat', 'cow', 'bee',
      'sun', 'red', 'gem', 'hat', 'box', 'cup', 'pie'
    ]
  },
  {
    id: 3,
    name: 'Mushroom Forest',
    desc: 'Friendly 4-letter words with nature and everyday objects.',
    difficulty: 'Explorer',
    bgTheme: 'forest',
    baseSpeed: 38,
    targetWords: 10,
    requiredScore: 450,
    words: [
      'tree', 'frog', 'bird', 'star', 'moon', 'fish', 'duck',
      'bear', 'lion', 'cake', 'rose', 'nest', 'pond', 'leaf'
    ]
  },
  {
    id: 4,
    name: 'Crystal Cavern',
    desc: 'Sparkling 4 to 5 letter treasure and magic words.',
    difficulty: 'Adventurer',
    bgTheme: 'cave',
    baseSpeed: 42,
    targetWords: 10,
    requiredScore: 550,
    words: [
      'gold', 'glow', 'gems', 'ruby', 'fire', 'wind', 'rock',
      'spark', 'shine', 'magic', 'frost', 'brave', 'stone'
    ]
  },
  {
    id: 5,
    name: 'Space Voyage',
    desc: 'Blast off with 4 to 5 letter space and astronomy words!',
    difficulty: 'Star Cadet',
    bgTheme: 'space',
    baseSpeed: 46,
    targetWords: 10,
    requiredScore: 650,
    words: [
      'star', 'mars', 'moon', 'ship', 'beam', 'comet',
      'orbit', 'solar', 'alien', 'laser', 'space', 'pilot'
    ]
  },
  {
    id: 6,
    name: 'Knights & Castle',
    desc: 'Defend the fortress with 5 to 6 letter knightly words!',
    difficulty: 'Spellcaster',
    bgTheme: 'citadel',
    baseSpeed: 50,
    targetWords: 10,
    requiredScore: 750,
    words: [
      'sword', 'guard', 'hero', 'cape', 'crown', 'shield',
      'castle', 'knight', 'dragon', 'armor', 'tower'
    ]
  },
  {
    id: 7,
    name: 'Champions Speed Rush',
    desc: 'Fast-paced 5 to 6 letter power verbs and action words!',
    difficulty: 'Champion',
    bgTheme: 'speedway',
    baseSpeed: 54,
    targetWords: 10,
    requiredScore: 850,
    words: [
      'flash', 'turbo', 'power', 'speed', 'quick', 'swift',
      'boost', 'smash', 'storm', 'super', 'brave'
    ]
  },
  {
    id: 8,
    name: 'Vocab Dragon Lair',
    desc: 'Boss Battle! The Vocab Dragon casts fun 2-word battle combos!',
    difficulty: 'Boss Challenge',
    bgTheme: 'volcano',
    isBoss: true,
    baseSpeed: 46,
    targetWords: 8,
    requiredScore: 1000,
    words: [
      'FIRE CAT', 'RED SUN', 'STAR GEM', 'ICE WAND',
      'GOLD CROWN', 'BIG DRAGON', 'FAST HERO', 'MAGIC SHIELD'
    ]
  }
];

// Finger assignments for interactive color-coded keyboard
const FINGER_MAP = {
  // Left Pinky (Red / Coral)
  'q': 'pinky-l', 'a': 'pinky-l', 'z': 'pinky-l', '1': 'pinky-l',
  // Left Ring (Orange / Amber)
  'w': 'ring-l', 's': 'ring-l', 'x': 'ring-l', '2': 'ring-l',
  // Left Middle (Green / Emerald)
  'e': 'middle-l', 'd': 'middle-l', 'c': 'middle-l', '3': 'middle-l',
  // Left Index (Sky Blue)
  'r': 'index-l', 'f': 'index-l', 'v': 'index-l', '4': 'index-l',
  't': 'index-l', 'g': 'index-l', 'b': 'index-l', '5': 'index-l',
  // Right Index (Sky Blue)
  'y': 'index-r', 'h': 'index-r', 'n': 'index-r', '6': 'index-r',
  'u': 'index-r', 'j': 'index-r', 'm': 'index-r', '7': 'index-r',
  // Right Middle (Green / Emerald)
  'i': 'middle-r', 'k': 'middle-r', ',': 'middle-r', '8': 'middle-r',
  // Right Ring (Orange / Amber)
  'o': 'ring-r', 'l': 'ring-r', '.': 'ring-r', '9': 'ring-r',
  // Right Pinky (Red / Coral)
  'p': 'pinky-r', ';': 'pinky-r', '/': 'pinky-r', '0': 'pinky-r',
  // Thumbs (Purple / Violet)
  ' ': 'thumb'
};

const FINGER_NAMES = {
  'pinky-l': 'Left Pinky',
  'ring-l': 'Left Ring Finger',
  'middle-l': 'Left Middle Finger',
  'index-l': 'Left Index Finger',
  'index-r': 'Right Index Finger',
  'middle-r': 'Right Middle Finger',
  'ring-r': 'Right Ring Finger',
  'pinky-r': 'Right Pinky',
  'thumb': 'Thumb (Spacebar)'
};

// Fun kid typing tips
const TYPING_TIPS = [
  'Rest your fingers on the Home Row (A S D F and J K L ;) between words for maximum speed!',
  'Look at the screen, not your hands! The glowing on-screen keyboard guides your fingers!',
  'Keep your wrists gently floating above the desk to type comfortably and avoid fatigue.',
  'Accuracy gives the biggest score multipliers - take your time and hit every letter cleanly!',
  'Each key has its own dedicated finger hero! Match the colors on the keyboard.'
];
