import { useEffect, useRef, useState, useCallback } from "react";
import { detect, init } from "../utlis/utlis.js";
// import { getRandomSong } from "../utlis/songMap.js";
import Player from "./Player.jsx";
import "../../shared/FaceExpression.css";
import { useRecommendation } from "../hooks/useRecommendation.js";

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

const { songs, fetchSongs } = useRecommendation();

const DETECTION_INTERVAL = 600;
const HISTORY_SIZE = 5;

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

  useEffect(() => {
    init({ landmarkerRef, videoRef, streamRef }, setReady, setError);

    return () => {
      if (landmarkerRef.current) landmarkerRef.current.close();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    const interval = setInterval(() => {
      const exp = detect({ landmarkerRef, videoRef });

      if (exp) {
        setExpression(exp);

        const updated = [...historyRef.current, exp].slice(-HISTORY_SIZE);
        historyRef.current = updated;

        const voted = getMajorityMood(updated);
        if (voted) {
          setStableMood((prev) => {
            if (prev === voted) return prev; // Same mood → no update
            console.log(`🎵 Mood changed: ${prev} → ${voted}`);
            fetchSongs(voted);
            return voted;
          });
        }
      }
    }, DETECTION_INTERVAL);

    useEffect(() => {
      if (songs.length > 0) {
        const randomSong = songs[Math.floor(Math.random() * songs.length)];
        setVideoId(randomSong.youtubeId);
      }
    }, [songs]);

    return () => clearInterval(interval);
  }, [ready, getMajorityMood]);

  // Error state: camera denied or model failed
  if (error) {
    return (
      <div className="moodify-container">
        <div className="moodify-card">
          <div className="error-box">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

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
