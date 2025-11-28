import { Box, Typography, CircularProgress, Button } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  ArrowBackIosNew as ArrowBackIcon, 
  ArrowForwardIos as ArrowForwardIcon,
} from "@mui/icons-material";
import CourseLearnTab from "../course-learn-tabs/CourseLearnTab";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import useGetCPByItemId from "../../../../hooks/useGetCPByItemId";
import useUpdateCPByItemId from "../../../../hooks/useUpdateCPByItemId";

function VideoPlayer() {
  const { courseId, contentId } = useParams();
  const navigate = useNavigate();
  const { data: itemData, isLoading } = useGetCPByItemId(contentId, courseId);
  const [showOverlay, setShowOverlay] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  const timerRef = useRef(null);
  const videoRef = useRef(null);
  const lastSaveTimeRef = useRef(0);
  const hasProcessedEndRef = useRef(false);
  const overlayTriggerItemRef = useRef(null);
  const updateProgressMutation = useUpdateCPByItemId();

  useEffect(() => {
    setShowOverlay(false);
    setCountdown(5);
    hasProcessedEndRef.current = false;
    overlayTriggerItemRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }, [contentId]);

  const currentItem = itemData?.currentItem;

  useEffect(() => {
    if (currentItem && videoRef.current && currentItem.lastPosition > 0) {
      const restoreTime = () => {
        if (videoRef.current) {
          if (videoRef.current.currentTime < 2) { 
            videoRef.current.currentTime = currentItem.lastPosition;
          }
        }
      };

      if (videoRef.current.readyState >= 1) {
        restoreTime();
      } else {
        videoRef.current.addEventListener('loadedmetadata', restoreTime, { once: true });
      }
    }
  }, [contentId, currentItem]);

  const handleNavigateNext = useCallback(() => {
    const nextItem = itemData?.navigation?.next;
    if (nextItem) {
      const routeType = nextItem.type === 'quiz' ? 'quiz' : 'lecture';
      navigate(`/course/${courseId}/learn/${routeType}/${nextItem.itemId}`);
    }
  }, [itemData, courseId, navigate]);

  const handleNavigatePrev = () => {
    const prevItem = itemData?.navigation?.prev;
    if (prevItem) {
      const routeType = prevItem.type === 'quiz' ? 'quiz' : 'lecture';
      navigate(`/course/${courseId}/learn/${routeType}/${prevItem.itemId}`);
    }
  };

  const startCountdown = () => {
    setCountdown(5);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  };

  useEffect(() => {
    if (countdown === 0 && showOverlay && overlayTriggerItemRef.current === contentId) {
       if (timerRef.current) clearInterval(timerRef.current);
       handleNavigateNext();
    }
  }, [countdown, showOverlay, handleNavigateNext, contentId]);

  const handleVideoEnded = async () => {
    if (hasProcessedEndRef.current) {
      return;
    }
    hasProcessedEndRef.current = true;
    const wasAlreadyCompleted = currentItem?.isCompleted;
    if (!wasAlreadyCompleted) {
      try {
        await updateProgressMutation.mutateAsync({
          courseId,
          itemId: contentId,
          lastPosition: 0,
          isCompleted: true 
        });
      } catch (error) {
        hasProcessedEndRef.current = false;
        return;
      }
    }
    if (itemData?.navigation?.next && !wasAlreadyCompleted) {
      overlayTriggerItemRef.current = contentId;
      setShowOverlay(true);
      startCountdown();
    }
  };

  const handleCancelAutoPlay = () => {
    setShowOverlay(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const now = Date.now();
    if (now - lastSaveTimeRef.current > 5000) {
        saveProgress(videoRef.current.currentTime);
        lastSaveTimeRef.current = now;
    }
  };

  const handlePause = () => {
    if (!videoRef.current) return;
    saveProgress(videoRef.current.currentTime);
    lastSaveTimeRef.current = Date.now();
  };

  const saveProgress = async (currentTime) => {
    try {
      await updateProgressMutation.mutateAsync({
        courseId,
        itemId: contentId,
        lastPosition: currentTime,
        isCompleted: currentItem?.isCompleted || false
      });
    } catch(e) { 
      console.error("Error saving progress:", e); 
    }
  };

  const handleArticleInteraction = async () => {
    if (currentItem?.contentType === 'article' && !currentItem?.isCompleted) {
      
      await updateProgressMutation.mutateAsync({
        courseId,
        itemId: contentId,
        isCompleted: true,
        lastPosition: 0
      });
    }
  };

  if (isLoading){
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <LoadingSpinner />
      </div>
    );
  };

  if (!currentItem) {
    return (
      <Box sx={{ textAlign: 'center' }} className="d-flex justify-content-center align-items-center vh-100">
        <Typography>Select a lecture to start learning</Typography>
      </Box>
    );
  }

  const nextItemInfo = itemData?.navigation?.next;
  const prevItemInfo = itemData?.navigation?.prev;

  return (
    <Box>
      <Box 
        sx={{ 
          width: "100%", 
          height: "500px",
          bgcolor: "black", 
          position: "relative", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          color: "white",
          "&:hover .nav-btn": { opacity: 1 }
        }}
      >
        {currentItem.contentType === 'video' ? (
           <video 
             ref={videoRef}
             key={currentItem.itemId} 
             controls={!showOverlay} 
             width="100%" 
             height="100%"
             autoPlay 
             src={currentItem.content} 
             onEnded={handleVideoEnded}
             onTimeUpdate={handleTimeUpdate} 
             onPause={handlePause}
             style={{ display: showOverlay ? 'none' : 'block' }}
           >
             Your browser does not support the video tag.
           </video>
        ) : (
          <Box sx={{ p: 4, bgcolor: '#fff', color: '#000', width: '100%', height: '100%', overflow: 'auto' }} onClick={handleArticleInteraction}>
             <Typography variant="h4" gutterBottom>{currentItem.title}</Typography>
             <div dangerouslySetInnerHTML={{ __html: currentItem.content }} />
          </Box>
        )}

        {showOverlay && nextItemInfo && (
          <Box
            sx={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              bgcolor: "rgba(0, 0, 0, 0.92)", 
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              backdropFilter: "blur(8px)",
              animation: "fadeIn 0.3s ease-out"
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                animation: "slideUp 0.5s ease-out"
              }}
            >
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: "#a0a0a0", 
                  mb: 2,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  fontSize: "0.75rem",
                  fontWeight: 600
                }}
              >
                Up Next
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  color: "#fff", 
                  fontWeight: 600, 
                  mb: 5, 
                  textAlign: "center", 
                  px: 4,
                  maxWidth: "600px",
                  lineHeight: 1.4
                }}
              >
                {nextItemInfo.title}
              </Typography>

              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                <CircularProgress 
                  variant="determinate" 
                  value={100} 
                  size={100}
                  thickness={2}
                  sx={{ color: "rgba(255,255,255,0.08)", position: "absolute" }}
                />
                <CircularProgress 
                  variant="determinate" 
                  value={((5 - countdown) / 5) * 100} 
                  size={100}
                  thickness={2}
                  sx={{ 
                    color: "#5ac8fa",
                    transition: "none",
                    "& .MuiCircularProgress-circle": { transition: "stroke-dashoffset 1s linear" }
                  }}
                />
                <Box
                  sx={{
                    top: 0, left: 0, bottom: 0, right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h4" sx={{ color: "#fff", fontWeight: 700 }}>
                    {countdown}
                  </Typography>
                </Box>
              </Box>

              <Button 
                variant="outlined" 
                onClick={handleCancelAutoPlay}
                sx={{ 
                  color: "#fff", 
                  borderColor: "rgba(255,255,255,0.3)",
                  textTransform: "none", 
                  fontSize: "0.95rem",
                  px: 4, py: 1,
                  borderRadius: "8px",
                  fontWeight: 500,
                  "&:hover": { 
                    bgcolor: "rgba(255,255,255,0.08)",
                    borderColor: "rgba(255,255,255,0.5)"
                  }
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}

        {prevItemInfo && !showOverlay && (
          <Box
            className="nav-btn"
            onClick={handleNavigatePrev}
            sx={{
              position: "absolute", left: 10, zIndex: 5,
              display: "flex", alignItems: "center",
              bgcolor: "rgba(0,0,0,0.5)", color: "white",
              borderRadius: "24px", p: 1,
              opacity: 0, transition: "all 0.3s ease",
              cursor: "pointer",
              "&:hover": { bgcolor: "rgba(0,0,0,0.8)", opacity: 1, pr: 2 }
            }}
          >
            <ArrowBackIcon fontSize="small" />
            <Box 
              sx={{ 
                width: 0, opacity: 0, overflow: "hidden", 
                transition: "all 0.3s ease",
                whiteSpace: "nowrap",
                ".nav-btn:hover &": { width: "auto", opacity: 1, ml: 1 }
              }}
            >
              <Typography variant="caption" sx={{ display: "block", color: "#ccc", lineHeight: 1 }}>Previous</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{prevItemInfo.title}</Typography>
            </Box>
          </Box>
        )}

        {nextItemInfo && !showOverlay && (
          <Box
            className="nav-btn"
            onClick={handleNavigateNext}
            sx={{
              position: "absolute", right: 10, zIndex: 5,
              display: "flex", alignItems: "center",
              bgcolor: "rgba(0,0,0,0.5)", color: "white",
              borderRadius: "24px", p: 1,
              opacity: 0, transition: "all 0.3s ease",
              cursor: "pointer",
              "&:hover": { bgcolor: "rgba(0,0,0,0.8)", opacity: 1, pl: 2 }
            }}
          >
            <Box 
              sx={{ 
                width: 0, opacity: 0, overflow: "hidden", 
                transition: "all 0.3s ease",
                whiteSpace: "nowrap",
                textAlign: "right",
                ".nav-btn:hover &": { width: "auto", opacity: 1, mr: 1 }
              }}
            >
              <Typography variant="caption" sx={{ display: "block", color: "#ccc", lineHeight: 1 }}>Next</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{nextItemInfo.title}</Typography>
            </Box>
            <ArrowForwardIcon fontSize="small" />
          </Box>
        )}

      </Box>

      <CourseLearnTab />
    </Box>
  );
}

export default VideoPlayer;