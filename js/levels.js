// ============================================
//  Typo Disk — levels.js
//  3 difficulties. Add more texts to each array.
// ============================================

const levels = {
  easy: {
    label: "Easy",
    texts: [
      "the quick brown fox jumps over the lazy dog",
      "cats and dogs like to play in the park",
      "she sells sea shells by the sea shore",
      "i like to read books on a sunny day"
    ]
  },
  medium: {
    label: "Medium",
    texts: [
      "the quick brown fox jumps over the lazy dog and runs away into the forest",
      "typing fast requires practice patience and a good amount of focus every single day",
      "the weather today is bright and sunny with a gentle breeze blowing through the trees",
      "many people find it relaxing to type out their thoughts on a quiet afternoon"
    ]
  },
  hard: {
    label: "Hard",
    texts: [
      "the intricate clockwork mechanism ticked steadily as gears of brass and copper turned in perfect synchrony beneath the glass casing",
      "despite the unpredictable weather conditions the expedition team pressed forward through the dense, fog-covered mountain pass",
      "quantum computing relies on the principles of superposition and entanglement to perform calculations far beyond classical limits",
      "the ancient manuscript, written in a long-forgotten dialect, puzzled even the most experienced linguists and historians alike"
    ]
  }
};

// Pick a random text from a given difficulty
function getRandomText(difficulty) {
  const pool = levels[difficulty].texts;
  return pool[Math.floor(Math.random() * pool.length)];
}
