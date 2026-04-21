import { Box, CircularProgress } from "@mui/material";
import { useRef, useState } from "react";
import { useHls } from "../../../../hooks/media-file-hooks/useHls";
import ControlsOverlay from "../../../user/course-learn/video-player/ControlsOverlay";

export default function PreviewVideoPlayer({ contentId, onEnded }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const { qualityLevels, currentLevel, changeQuality } = useHls(contentId, videoRef);

  const handleTimeUpdatePlayer = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const wrapToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        aspectRatio: "16/9",
        maxHeight: "80vh",
        bgcolor: "black",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        "&:hover .nav-btn": { opacity: 1 }
      }}
    >
      <Box 
        ref={containerRef}
        sx={{ position: 'relative', width: '100%', height: '100%', display: 'block', bgcolor: 'black' }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {isLoading && (
          <Box 
            sx={{ 
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(0,0,0,0.5)', zIndex: 1 
            }}
          >
            <CircularProgress sx={{ color: 'brand.main' }} />
          </Box>
        )}
        <video
          ref={videoRef}
          width="100%"
          height="100%"
          autoPlay
          onEnded={onEnded}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => setIsLoading(false)}
          onCanPlay={() => setIsLoading(false)}
          onTimeUpdate={handleTimeUpdatePlayer}
          onLoadedMetadata={() => {
            if (videoRef.current) setDuration(videoRef.current.duration);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={() => {
            if (videoRef.current) {
              isPlaying ? videoRef.current.pause() : videoRef.current.play();
            }
          }}
          style={{ width: '100%', height: '100%', display: 'block', backgroundColor: 'black' }}
        >
          Your browser does not support the video tag.
        </video>
        
        <ControlsOverlay 
          showControls={isHovering || !isPlaying}
          isPlaying={isPlaying}
          isMuted={isMuted}
          volume={volume}
          currentTime={currentTime}
          duration={duration}
          togglePlay={() => {
            if (videoRef.current) {
              isPlaying ? videoRef.current.pause() : videoRef.current.play();
            }
          }}
          toggleMute={() => setIsMuted(!isMuted)}
          handleVolumeChange={(e, newValue) => { 
            setVolume(newValue); 
            if (videoRef.current) {
              videoRef.current.volume = newValue; 
              setIsMuted(newValue === 0); 
            }
          }}
          handleSeek={(e, newValue) => { 
            if (videoRef.current) {
              videoRef.current.currentTime = newValue; 
              setCurrentTime(newValue); 
            }
          }}
          toggleFullscreen={wrapToggleFullscreen}
          formatTime={(seconds) => new Date((seconds || 0) * 1000).toISOString().slice(14, 19)}
          qualities={qualityLevels}
          currentQuality={currentLevel}
          onQualityChange={changeQuality}
          playbackRate={playbackRate}
          onPlaybackRateChange={(rate) => {
            setPlaybackRate(rate);
            if (videoRef.current) {
              videoRef.current.playbackRate = rate;
            }
          }}
        />
      </Box>
    </Box>
  );
}