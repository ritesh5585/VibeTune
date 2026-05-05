/**
 * MOOD → SONG MAPPING
 *
 * Each mood has multiple YouTube video IDs so the user
 * doesn't hear the same song every time.
 *
 * getRandomSong(mood) picks one randomly from the pool.
 */

export const moodSongs = {
  happy: [
    "ZbZSe6N_BXs", // Pharrell - Happy
    "ru0K8uYEZWw", // Ed Sheeran - Perfect
    "3JZ4pnNtyxQ", // Imagine Dragons - On Top of the World
  ],
  sad: [
    "hLQl3WQQoQ0", // Adele - Someone Like You
    "RgKAFK5djSk", // Wiz Khalifa - See You Again
    "nfWlot6h_JM", // Taylor Swift - Shake It Off (slow version)
  ],
  surprised: [
    "ZZ5LpwO-An4", // LMFAO - Party Rock Anthem
    "fJ9rUzIMcZQ", // Queen - Bohemian Rhapsody
    "kJQP7kiw5Fk", // Luis Fonsi - Despacito
  ],
  neutral: [
    "5qap5aO4i9A", // Lofi beats
    "lTRiuFIWV54", // Lofi hip hop radio
    "jfKfPfyJRdk", // Lofi Girl livestream
  ],
};

// Default fallback when no mood is detected yet
export const DEFAULT_VIDEO = "5qap5aO4i9A";

/**
 * Returns a random YouTube ID for the given mood.
 * Falls back to DEFAULT_VIDEO if mood is invalid.
 */
export const getRandomSong = (mood) => {
  const songs = moodSongs[mood];
  if (!songs || songs.length === 0) return DEFAULT_VIDEO;
  return songs[Math.floor(Math.random() * songs.length)];
};