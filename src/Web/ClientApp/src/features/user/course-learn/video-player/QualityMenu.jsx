import { Box, Typography, IconButton, Popover, MenuItem } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckIcon from "@mui/icons-material/Check";
import SpeedIcon from "@mui/icons-material/Speed";
import HighQualityIcon from "@mui/icons-material/HighQuality";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useState } from "react";

const QualityMenu = ({ qualities, currentQuality, onQualityChange, playbackRate, onPlaybackRateChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [view, setView] = useState("main"); // "main", "quality", "speed"
  const isOpen = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setView("main");
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <>
      <IconButton sx={{ color: "white" }} onClick={handleClick}>
        <SettingsIcon />
      </IconButton>
      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        disablePortal
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        PaperProps={{ sx: { bgcolor: "rgba(0,0,0,0.85)", color: "white", minWidth: 220, backdropFilter: 'blur(8px)' } }}
      >
        {view === "main" && (
          <Box sx={{ py: 1 }}>
            <MenuItem onClick={() => setView("speed")} sx={{ display: 'flex', alignItems: 'center', py: 1.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <SpeedIcon fontSize="small" sx={{ mr: 2, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ flexGrow: 1 }}>Speed</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1 }}>
                {playbackRate === 1 ? "Normal" : `${playbackRate}x`}
              </Typography>
              <KeyboardArrowRightIcon fontSize="small" sx={{ color: "text.secondary" }} />
            </MenuItem>
            
            {qualities && qualities.length > 0 && (
              <MenuItem onClick={() => setView("quality")} sx={{ display: 'flex', alignItems: 'center', py: 1.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                <HighQualityIcon fontSize="small" sx={{ mr: 2, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ flexGrow: 1 }}>Quality</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', mr: 1 }}>
                  {currentQuality === -1 ? "Auto" : `${qualities[currentQuality]?.height}p`}
                </Typography>
                <KeyboardArrowRightIcon fontSize="small" sx={{ color: "text.secondary" }} />
              </MenuItem>
            )}
          </Box>
        )}

        {view === "speed" && (
          <Box sx={{ pb: 1, pt: 1 }}>
            <MenuItem onClick={() => setView("main")} sx={{ borderBottom: "1px solid #444", mb: 1, pb: 1.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <ArrowBackIcon fontSize="small" sx={{ mr: 2 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Speed</Typography>
            </MenuItem>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {speeds.map((s) => (
                <MenuItem 
                  key={s}
                  onClick={() => { onPlaybackRateChange(s); handleClose(); }}
                  sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  <Box sx={{ width: 32, display: 'flex', alignItems: 'center' }}>
                    {playbackRate === s && <CheckIcon fontSize="small" />}
                  </Box>
                  <Typography variant="body2">{s === 1 ? "Normal" : `${s}x`}</Typography>
                </MenuItem>
              ))}
            </Box>
          </Box>
        )}

        {view === "quality" && (
          <Box sx={{ pb: 1, pt: 1 }}>
            <MenuItem onClick={() => setView("main")} sx={{ borderBottom: "1px solid #444", mb: 1, pb: 1.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <ArrowBackIcon fontSize="small" sx={{ mr: 2 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Quality</Typography>
            </MenuItem>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              <MenuItem 
                onClick={() => { onQualityChange(-1); handleClose(); }}
                sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                <Box sx={{ width: 32, display: 'flex', alignItems: 'center' }}>
                  {currentQuality === -1 && <CheckIcon fontSize="small" />}
                </Box>
                <Typography variant="body2">Auto</Typography>
              </MenuItem>
              {qualities?.map((q, index) => (
                <MenuItem 
                  key={index}
                  onClick={() => { onQualityChange(index); handleClose(); }}
                  sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  <Box sx={{ width: 32, display: 'flex', alignItems: 'center' }}>
                    {currentQuality === index && <CheckIcon fontSize="small" />}
                  </Box>
                  <Typography variant="body2">{q.height}p</Typography>
                </MenuItem>
              ))}
            </Box>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default QualityMenu;
