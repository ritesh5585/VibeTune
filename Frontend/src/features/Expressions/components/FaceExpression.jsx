import { useEffect, useRef, useState, useCallback } from "react";
import { detect, init } from "../utlis/utlis.js";
import { getRandomSong } from "../utlis/songMap.js";
import Player from "./Player.jsx";
import "../../shared/FaceExpression.css";

/**
 * MOOD CONFIG
 * Each mood gets an emoji and a CSS class for the badge color.
 */
const MOOD_CONFIG = {
  happy: { emoji: "😊", label: "Happy" },
  sad: { emoji: "😢", label: "Sad" },
  surprised: { emoji: "😮", label: "Surprised" },
  neutral: { emoji: "😐", label: "Neutral" },
};

const DETECTION_INTERVAL = 600; // ms between each detection frame
const HISTORY_SIZE = 5; // number of frames for majority vote

export default function FaceExpression() {
  // ── Refs (don't trigger re-renders) ──
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const historyRef = useRef([]); // Last N raw expressions

  // ── State ──
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [expression, setExpression] = useState(null); // Raw per-frame result
  const [stableMood, setStableMood] = useState(null); // After majority vote
  const [videoId, setVideoId] = useState(null);

  /**
   * MAJORITY VOTE
   * Takes the history array, counts occurrences, returns the most frequent mood.
   * This prevents flickering: e.g. [happy, happy, neutral, happy, happy] → "happy"
   */
  const getMajorityMood = useCallback((history) => {
    if (history.length < HISTORY_SIZE) return null;

    const counts = {};
    history.forEach((m) => {
      counts[m] = (counts[m] || 0) + 1;
    });

    return Object.entries(counts).reduce(
      (best, [mood, count]) => (count > best[1] ? [mood, count] : best),
      ["neutral", 0],
    )[0];
  }, []);

  /**
   * EFFECT 1: Initialize camera + model on mount
   * Runs once. Cleanup stops camera + closes model.
   */
  useEffect(() => {
    init({ landmarkerRef, videoRef, streamRef }, setReady, setError);

    return () => {
      if (landmarkerRef.current) landmarkerRef.current.close();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  /**
   * EFFECT 2: Detection loop (only runs when model is ready)
   *
   * Every 600ms:
   *   1. Call detect() → get raw expression string
   *   2. Push into history buffer (capped at 5)
   *   3. Run majority vote → stableMood
   *   4. If stableMood changed → pick a new random song
   */
  useEffect(() => {
    if (!ready) return;

    const interval = setInterval(() => {
      const exp = detect({ landmarkerRef, videoRef });

      if (exp) {
        setExpression(exp);

        // Update history buffer
        const updated = [...historyRef.current, exp].slice(-HISTORY_SIZE);
        historyRef.current = updated;

        // Only run vote when buffer is full
        const voted = getMajorityMood(updated);
        if (voted) {
          setStableMood((prev) => {
            if (prev === voted) return prev; // Same mood → no update
            console.log(`🎵 Mood changed: ${prev} → ${voted}`);
            setVideoId(getRandomSong(voted)); // New mood → new song
            return voted;
          });
        }
      }
    }, DETECTION_INTERVAL);

    return () => clearInterval(interval);
  }, [ready, getMajorityMood]);

  // ── Render ──

  // Error state: camera denied or model failed
  // if (error) {
  //   return (
  //     <div className="moodify-container">
  //       <div className="moodify-card">
  //         <div className="error-box">
  //           <span className="error-icon">⚠️</span>
  //           <p>{error}</p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  const mood = stableMood ? MOOD_CONFIG[stableMood] : null;

  return (
    <div className="moodify-container">
      <div className="moodify-card">
        {/* Header */}
        <h1 className="moodify-title">
          <span className="title-icon">🎵</span> Moodify
        </h1>
        <p className="moodify-subtitle">
          AI reads your face. Music follows your mood.
        </p>

        {/* Loading overlay */}
        {!ready && (
          <div className="loading-overlay">
            <div className="spinner" />
            <p>Loading AI Model...</p>
          </div>
        )}

        {/* Camera Feed */}
        <div className="camera-section">
          <div className="camera-ring">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="camera-feed"
            />
          </div>
        </div>

        {/* Mood Badge */}
        <div className="mood-section">
          {mood ? (
            <div className={`mood-badge mood-${stableMood}`}>
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-label">{mood.label}</span>
            </div>
          ) : (
            <div className="mood-badge mood-detecting">
              <span className="mood-emoji">🔍</span>
              <span className="mood-label">Detecting...</span>
            </div>
          )}

          {expression && <p className="raw-expression">Raw: {expression}</p>}
        </div>

        {/* YouTube Player */}
        <div className="player-section">
          {videoId ? (
            <Player videoId={videoId} />
          ) : (
            <div className="player-placeholder">
              <span>🎶</span>
              <p>Your song will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
