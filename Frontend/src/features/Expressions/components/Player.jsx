import { useState } from "react";

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
