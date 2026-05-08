import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRecommendation } from "../hooks/useRecommendation.js";
import { detect, init } from "../utlis/utlis.js";
import MoodPlayer from "./MoodPlayer.jsx";
import "../../shared/VibeTune.css";
import Player from "./Player.jsx";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useNavigate } from "react-router-dom";

// Constants
const MOOD_CONFIG = {
  happy: { emoji: "😊", label: "Happy", color: "#4ade80" },
  sad: { emoji: "😢", label: "Sad", color: "#60a5fa" },
  surprised: { emoji: "😮", label: "Surprised", color: "#fbbf24" },
  neutral: { emoji: "😐", label: "Neutral", color: "#94a3b8" },
};

const DETECTION_INTERVAL = 500;
const HISTORY_SIZE = 5;

export default function FaceExpression() {
  // Refs
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const historyRef = useRef([]);

  // State
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [expression, setExpression] = useState(null);
  const [stableMood, setStableMood] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // Hooks
  const { songs = [], fetchSongs, loading: songsLoading } = useRecommendation();
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  // Memoized mood data
  const currentMood = useMemo(() => {
    return stableMood ? MOOD_CONFIG[stableMood] : null;
  }, [stableMood]);

  // Safe song selection
  const currentSong = useMemo(() => {
    return songs && songs.length > 0 ? songs[0] : null;
  }, [songs]);

  // Utility function to get majority mood
  const getMajorityMood = useCallback((history) => {
    if (history.length < HISTORY_SIZE) return null;

    const counts = {};
    history.forEach((m) => {
      counts[m] = (counts[m] || 0) + 1;
    });

    return Object.entries(counts).reduce(
      (a, b) => (counts[a[0]] > counts[b[0]] ? a : b),
      [null, 0],
    )[0];
  }, []);
  // FaceExpression.jsx

  // ─── Camera setup useEffect ───────────────────────
  useEffect(() => {
    const setupCamera = async () => {
      try {
        setIsDetecting(true);

        // ✅ Sahi tarah se init call karo — refs aur setters pass karo
        await init(
          { landmarkerRef, videoRef, streamRef }, // ✅ Refs object
          setReady, 
          setError, 
        );
      } catch (err) {
        console.error("Error setting up camera:", err);
        setError("Unable to access camera.");
      } finally {
        setIsDetecting(false);
      }
    };

    setupCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []); 

  // Face detection loop
  useEffect(() => {
    if (!ready) return;

    const interval = setInterval(() => {
      const exp = detect({ landmarkerRef, videoRef });
      if (!exp) return;

      setExpression(exp);

      const updated = [...historyRef.current, exp].slice(-HISTORY_SIZE);
      historyRef.current = updated;

      const voted = getMajorityMood(updated);
      if (!voted) return;

      setStableMood((prev) => {
        if (prev === voted) return prev;
        console.log(`🎭 Mood: ${prev} → ${voted}`);
        return voted;
      });
    }, DETECTION_INTERVAL);

    return () => clearInterval(interval);
  }, [ready, getMajorityMood]);

  // Fetch songs when mood changes
  useEffect(() => {
    if (!stableMood) return;
    fetchSongs(stableMood);
  }, [stableMood, fetchSongs]);

  // Update video ID when songs change
  useEffect(() => {
    if (!currentSong) {
      setVideoId(null);
      return;
    }
    setVideoId(currentSong.youtubeId);
  }, [currentSong]);

  const handleLogoutClick = () => {
    handleLogout();
    navigate("/login");
  };

  return (
    <div className="vibe-app">
      <div className="app-container">
        {/* Left Card - Face Expression */}
        <div className="app-card left-card">
          <div className="card-header">
            <div className="header-content">
              <h1 className="app-title">
                <span className="title-icon">🎵</span> VibeTune
              </h1>
              <button className="logout-btn" onClick={handleLogoutClick}>
                <span className="logout-icon">🚪</span>
                <span className="logout-text">Logout</span>
              </button>
            </div>
            <p className="app-subtitle">
              AI reads your face. Music follows your mood.
            </p>
          </div>

          <div className="card-content">
            {/* Camera Section */}
            <div className="camera-section">
              <div className="camera-wrapper">
                <div className="camera-feed-container">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="camera-feed"
                  />
                  {isDetecting && (
                    <div className="camera-overlay">
                      <div className="detection-indicator">
                        <div className="pulse-dot"></div>
                        <span>Detecting...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mood Display */}
            <div className="mood-section">
              {currentMood ? (
                <div className={`mood-badge mood-${stableMood}`}>
                  <span className="mood-emoji">{currentMood.emoji}</span>
                  <span className="mood-label">{currentMood.label}</span>
                  <div
                    className="mood-glow"
                    style={{ backgroundColor: currentMood.color }}
                  ></div>
                </div>
              ) : (
                <div className="mood-badge mood-detecting">
                  <span className="mood-emoji">🔍</span>
                  <span className="mood-label">Analyzing...</span>
                  <div className="mood-glow"></div>
                </div>
              )}
              {expression && (
                <p className="raw-expression">Expression: {expression}</p>
              )}
            </div>

            {/* Main Player */}
            <div className="main-player-section">
              {videoId ? (
                <Player videoId={videoId} />
              ) : (
                <div className="player-placeholder">
                  <div className="placeholder-content">
                    <span className="placeholder-icon">🎶</span>
                    <p className="placeholder-text">
                      Your song will appear here
                    </p>
                    <p className="placeholder-subtext">
                      Detect your mood to get started
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Card - Music Player */}
        <div className="app-card right-card">
          <MoodPlayer songs={songs} mood={stableMood} loading={songsLoading} />
        </div>
      </div>
    </div>
  );
}
