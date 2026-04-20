import { Box, IconButton, Slider, Typography, Stack } from "@mui/material";
import { PlayArrow, Pause, VolumeUp, VolumeOff, Fullscreen } from "@mui/icons-material";
import QualityMenu from "./QualityMenu";

const ControlsOverlay = ({
  showControls, isPlaying, isMuted, volume, currentTime, duration,
  togglePlay, toggleMute, handleVolumeChange, handleSeek, toggleFullscreen, formatTime,
  qualities, currentQuality, onQualityChange, playbackRate, onPlaybackRateChange
}) => {
  return (
    <Box
      sx={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
        p: 2,
        opacity: showControls ? 1 : 0,
        transition: "opacity 0.3s",
        pointerEvents: showControls ? "auto" : "none",
        zIndex: 2,
      }}
    >
      <Slider
        min={0}
        max={duration || 100}
        value={currentTime}
        onChange={handleSeek}
        sx={{
          color: "#3b82f6", height: 4, padding: "0 !important",
          "& .MuiSlider-thumb": { display: "none" },
          "&:hover .MuiSlider-thumb": { display: "block" }
        }}
      />
      
      <Stack direction="row" alignItems="center" justifyContent="space-between" mt={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={togglePlay} sx={{ color: "white" }}>
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
          
          <Stack direction="row" alignItems="center" spacing={1} sx={{ width: 100, mr: 2 }}>
            <IconButton onClick={toggleMute} sx={{ color: "white" }}>
              {isMuted || volume === 0 ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
            <Slider 
              min={0} max={1} step={0.01} value={isMuted ? 0 : volume} 
              onChange={handleVolumeChange}
              sx={{ color: "white" }} 
            />
          </Stack>

          <Typography variant="body2" sx={{ color: "white", ml: 3}}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <QualityMenu 
            qualities={qualities} 
            currentQuality={currentQuality} 
            onQualityChange={onQualityChange}
            playbackRate={playbackRate}
            onPlaybackRateChange={onPlaybackRateChange}
          />
          <IconButton onClick={toggleFullscreen} sx={{ color: "white" }}>
            <Fullscreen />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ControlsOverlay;
