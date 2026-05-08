// MoodPlayer.jsx - Production-Grade Music Player
import { useState, useMemo, useCallback } from "react";
import "../../shared/VibeTune.css";

const MoodPlayer = ({ songs = [], mood, loading = false }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Memoized mood data
  const moodData = useMemo(() => {
    const moodEmojis = {
      happy: '😊',
      sad: '😢',
      surprised: '😮',
      neutral: '😐'
    };
    const moodColors = {
      happy: '#4ade80',
      sad: '#60a5fa',
      surprised: '#fbbf24',
      neutral: '#94a3b8'
    };
    return {
      emoji: moodEmojis[mood] || '😐',
      color: moodColors[mood] || '#94a3b8',
      label: mood ? mood.charAt(0).toUpperCase() + mood.slice(1) : 'Neutral'
    };
  }, [mood]);

  // Safe current song selection
  const safeCurrentSong = useMemo(() => {
    if (currentSong) return currentSong;
    if (songs && songs.length > 0) return songs[0];
    return null;
  }, [currentSong, songs]);

  // Handle song selection
  const handleSongSelect = useCallback((song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  }, []);

  // Handle play/pause toggle
  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Handle next song
  const handleNext = useCallback(() => {
    if (!songs || songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.youtubeId === safeCurrentSong?.youtubeId);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    setIsPlaying(true);
  }, [songs, safeCurrentSong]);

  // Handle previous song
  const handlePrevious = useCallback(() => {
    if (!songs || songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.youtubeId === safeCurrentSong?.youtubeId);
    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    setCurrentSong(songs[prevIndex]);
    setIsPlaying(true);
  }, [songs, safeCurrentSong]);

  // Format duration helper
  const formatDuration = useCallback((duration) => {
    if (!duration) return '--:--';
    return duration;
  }, []);

  return (
    <div className="music-player">
      {/* Header */}
      <div className="player-header">
        <div className="header-title">
          <span className="mood-emoji">{moodData.emoji}</span>
          <h2 className="playlist-title">{moodData.label} Playlist</h2>
        </div>
        <div className="header-stats">
          <span className="song-count">{songs.length} songs</span>
          {loading && <div className="loading-spinner"></div>}
        </div>
      </div>

      {/* Content */}
      <div className="player-content">
        {/* Song List */}
        <div className="song-list">
          <div className="song-list-header">
            <h3 className="list-title">Queue</h3>
            <span className="list-info">{songs.length} tracks</span>
          </div>

          <div className="songs-container">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <span>Loading songs...</span>
              </div>
            ) : songs.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🎵</span>
                <p className="empty-text">No songs available</p>
                <p className="empty-subtext">Detect your mood to get recommendations</p>
              </div>
            ) : (
              songs.map((song, index) => {
                const isActive = safeCurrentSong?.youtubeId === song.youtubeId;
                return (
                  <div
                    key={song.youtubeId || index}
                    onClick={() => handleSongSelect(song)}
                    className={`song-item ${isActive ? 'active' : ''}`}
                  >
                    <div className="song-index">
                      {isActive ? (
                        <div className="playing-indicator">
                          <div className="sound-bars">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      ) : (
                        <span className="track-number">{index + 1}</span>
                      )}
                    </div>
                    
                    {song.thumbnail && (
                      <div className="song-thumbnail">
                        <img 
                          src={song.thumbnail} 
                          alt={song.title}
                          loading="lazy"
                        />
                        {isActive && (
                          <div className="now-playing-indicator">
                            <span>♪</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="song-info">
                      <p className="song-title">{song.title}</p>
                      <p className="song-artist">{song.channel}</p>
                    </div>
                    
                    <div className="song-meta">
                      <span className="song-duration">{formatDuration(song.duration)}</span>
                      <div className="song-actions">
                        <button 
                          className={`action-btn ${isActive ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSongSelect(song);
                          }}
                        >
                          {isActive ? '⏸' : '▶'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Video Player */}
        <div className="video-player">
          {safeCurrentSong ? (
            <>
              <div className="video-container">
                <iframe
                  key={safeCurrentSong.youtubeId}
                  src={`https://www.youtube.com/embed/${safeCurrentSong.youtubeId}?autoplay=${isPlaying ? '1' : '0'}&rel=0&showinfo=0&controls=1`}
                  className="video-iframe"
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="VibeTune Player"
                  loading="lazy"
                />
                {isPlaying && (
                  <div className="playing-overlay">
                    <div className="playing-animation">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
              </div>

              <div className="now-playing">
                <div className="track-info">
                  <h3 className="track-title">{safeCurrentSong.title}</h3>
                  <p className="track-artist">{safeCurrentSong.channel}</p>
                </div>
                
                <div className="player-controls">
                  <button 
                    className="control-btn prev-btn" 
                    onClick={handlePrevious}
                    title="Previous"
                  >
                    ⏮
                  </button>
                  <button 
                    className={`control-btn play-btn ${isPlaying ? 'playing' : ''}`} 
                    onClick={handlePlayPause}
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? '⏸' : '▶'}
                  </button>
                  <button 
                    className="control-btn next-btn" 
                    onClick={handleNext}
                    title="Next"
                  >
                    ⏭
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-song-selected">
              <div className="empty-player">
                <span className="empty-player-icon">�</span>
                <h3 className="empty-player-title">No Song Selected</h3>
                <p className="empty-player-text">Choose a song from the queue to start playing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodPlayer;
