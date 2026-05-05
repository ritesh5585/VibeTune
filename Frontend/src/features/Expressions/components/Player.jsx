import { useState } from "react";

/**
 * PLAYER COMPONENT
 *
 * Renders a YouTube iframe embed for the given videoId.
 *
 * Key decisions:
 *   - `key={videoId}` forces React to unmount/remount the iframe
 *     when the song changes. This triggers autoplay on the new video.
 *   - Fade-in via CSS opacity transition (no flicker).
 *   - Returns null if no videoId yet (nothing to play).
 */
export default function Player({ videoId }) {
  const [loaded, setLoaded] = useState(false);

  if (!videoId) return null;

  return (
    <div className="player-wrapper">
      <iframe
        key={videoId}
        className={`player-iframe ${loaded ? "visible" : ""}`}
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="Moodify Player"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
