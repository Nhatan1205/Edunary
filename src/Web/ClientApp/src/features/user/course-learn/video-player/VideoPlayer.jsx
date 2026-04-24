import { Box, Typography, CircularProgress, Button } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowBackIosNew as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIcon,
} from "@mui/icons-material";
import CourseLearnTab from "../course-learn-tabs/CourseLearnTab";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import useGetCPByItemId from "../../../../hooks/course-progress-hooks/useGetCPByItemId";
import useUpdateCPByItemId from "../../../../hooks/course-progress-hooks/useUpdateCPByItemId";

import { useHls } from "../../../../hooks/media-file-hooks/useHls";
import useGetDownloadUrl from "../../../../hooks/media-file-hooks/useGetDownloadUrl";
import useGetCaptionsByVideoId from "../../../../hooks/video-caption-hooks/useGetCaptionsByVideoId";
import { getCaptionLanguageOption } from "../../../../utils/captionLanguageHelper";
import ControlsOverlay from "./ControlsOverlay";
import ArticleContent from "./ArticleContent";

function VideoPlayer() {
  const { courseId, contentId } = useParams();
  const navigate = useNavigate();
  const { data: itemData, isLoading } = useGetCPByItemId(contentId, courseId);
  const [showOverlay, setShowOverlay] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const [activeCaptionId, setActiveCaptionId] = useState(null);
  const [currentSubtitleText, setCurrentSubtitleText] = useState("");
  const activeCaptionTrackRef = useRef(null);

  const timerRef = useRef(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const lastSaveTimeRef = useRef(0);
  const hasProcessedEndRef = useRef(false);
  const overlayTriggerItemRef = useRef(null);
  const updateProgressMutation = useUpdateCPByItemId();

  // Current item definition moved up here.
  const currentItem = itemData?.currentItem;

  const videoId = currentItem?.contentType === 'video' ? currentItem.videoId : null;
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const { qualityLevels, currentLevel, changeQuality } = useHls(videoId, videoRef);
  const getDownloadUrlMutation = useGetDownloadUrl();
  const { data: videoCaptions } = useGetCaptionsByVideoId(videoId);

  const mappedCaptions = (videoCaptions || [])
    .filter((c) => Boolean(c?.fileUrl))
    .map((c) => ({
      ...c,
      label: getCaptionLanguageOption(c.language)?.label || "Unknown",
    }));

  const activeCaption = mappedCaptions.find((c) => c.id === activeCaptionId) || null;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!activeCaptionId) {
      setCurrentSubtitleText("");
      activeCaptionTrackRef.current = null;
      Array.from(video.textTracks).forEach(track => {
        track.mode = "disabled";
        track.oncuechange = null;
      });
      return;
    }

    const handleCueChange = (e) => {
      const activeCues = e.target.activeCues;
      if (activeCues && activeCues.length > 0) {
        setCurrentSubtitleText(activeCues[0].text || "");
      } else {
        setCurrentSubtitleText("");
      }
    };

    const configureTrack = (track) => {
      track.mode = "hidden";
      track.oncuechange = handleCueChange;
      activeCaptionTrackRef.current = track;
      if (track.activeCues && track.activeCues.length > 0) {
        setCurrentSubtitleText(track.activeCues[0].text || "");
      }
    };

    Array.from(video.textTracks).forEach(configureTrack);

    const onAddTrack = (e) => {
      configureTrack(e.track);
    };

    video.textTracks.addEventListener('addtrack', onAddTrack);

    return () => {
      video.textTracks.removeEventListener('addtrack', onAddTrack);
    };
  }, [activeCaptionId, videoId]);

  const handleVideoDownload = async () => {
    if (currentItem?.videoId) {
      try {
        const result = await getDownloadUrlMutation.mutateAsync(currentItem.videoId);
        if (result) {
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = result.url;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } catch (e) {
        console.error("Failed to download video", e);
      }
    }
  };

  useEffect(() => {
    setShowOverlay(false);
    setCountdown(5);
    hasProcessedEndRef.current = false;
    overlayTriggerItemRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }, [contentId]);

  // Use currentItem from above instead of redefining it.

  useEffect(() => {
    if (currentItem && videoRef.current && currentItem.lastPosition > 0) {
      const restoreTime = () => {
        if (videoRef.current) {
          if (videoRef.current.currentTime < 2) {
            videoRef.current.currentTime = currentItem.lastPosition;
          }
          videoRef.current.playbackRate = playbackRate;
        }
      };

      if (videoRef.current.readyState >= 1) {
        restoreTime();
      } else {
        videoRef.current.addEventListener('loadedmetadata', restoreTime, { once: true });
      }
    }
  }, [contentId, currentItem, playbackRate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // // Prevent running if user is typing in form inputs (like comments)
      // const tagName = document.activeElement.tagName.toLowerCase();
      // if (tagName === 'input' || tagName === 'textarea' || document.activeElement.isContentEditable) return;
      if (!videoRef.current || currentItem?.contentType !== 'video' || showOverlay) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          setCurrentTime(videoRef.current.currentTime);
          break;
        case 'ArrowRight':
          e.preventDefault();
          videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
          setCurrentTime(videoRef.current.currentTime);
          break;
        case 'ArrowUp':
          e.preventDefault();
          {
            const newVol = Math.min(1, volume + 0.1);
            setVolume(newVol);
            videoRef.current.volume = newVol;
            if (newVol > 0) setIsMuted(false);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          {
            const newVol = Math.max(0, volume - 0.1);
            setVolume(newVol);
            videoRef.current.volume = newVol;
            if (newVol === 0) setIsMuted(true);
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, currentItem, showOverlay]);

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

  const handleTimeUpdatePlayer = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    handleTimeUpdate();
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const now = Date.now();
    if (now - lastSaveTimeRef.current > 10000) {
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
    } catch (e) {
      console.error("Error saving progress:", e);
    }
  };

  const handleArticleInteraction = async () => {
    if (currentItem?.contentType === 'article' && !currentItem?.isCompleted) {
      try {
        await updateProgressMutation.mutateAsync({
          courseId,
          itemId: contentId,
          isCompleted: true,
          lastPosition: 0
        });

        // Nếu có bài tiếp theo, hiển thị màn hình đếm ngược (như khi xem xong video)
        if (itemData?.navigation?.next) {
          overlayTriggerItemRef.current = contentId;
          setShowOverlay(true);
          startCountdown();
        }
      } catch (error) {
        console.error("Error updating article progress:", error);
      }
    }
  };

  if (isLoading) {
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
        ref={containerRef}
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
          <Box
            sx={{ position: 'relative', width: '100%', height: '100%', display: showOverlay ? 'none' : 'block' }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {isLoadingVideo && (
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
              key={currentItem.itemId}
              width="100%"
              height="100%"
              crossOrigin="anonymous"
              autoPlay
              onWaiting={() => setIsLoadingVideo(true)}
              onPlaying={() => setIsLoadingVideo(false)}
              onCanPlay={() => setIsLoadingVideo(false)}
              onEnded={handleVideoEnded}
              onTimeUpdate={handleTimeUpdatePlayer}
              onLoadedMetadata={() => setDuration(videoRef.current.duration)}
              onPlay={() => setIsPlaying(true)}
              onPause={(e) => {
                setIsPlaying(false);
                handlePause(e);
              }}
              onClick={() => {
                isPlaying ? videoRef.current.pause() : videoRef.current.play();
              }}
              style={{ width: '100%', height: '100%', display: 'block', backgroundColor: 'black' }}
            >
              {activeCaption && (
                <track
                  key={`${videoId}-${activeCaption.id}`}
                  kind="subtitles"
                  src={activeCaption.fileUrl}
                  default
                />
              )}

              Your browser does not support the video tag.
            </video>

            {activeCaptionId && currentSubtitleText && (
              <Box sx={{
                position: "absolute", bottom: isHovering || !isPlaying ? 100 : 30, left: 0, right: 0,
                display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 1,
                transition: "bottom 0.3s ease", px: 4
              }}>
                <Typography sx={{
                  bgcolor: "rgba(0,0,0,0.75)", color: "white", px: 2, py: 0.5, borderRadius: 1,
                  fontSize: { xs: '0.9rem', md: '1.2rem' }, textAlign: "center", maxWidth: "80%",
                  textShadow: "1px 1px 2px black", lineHeight: 1.4
                }}>
                  {currentSubtitleText}
                </Typography>
              </Box>
            )}

            {!showOverlay && (
              <ControlsOverlay
                showControls={isHovering || !isPlaying}
                isPlaying={isPlaying}
                isMuted={isMuted}
                volume={volume}
                currentTime={currentTime}
                duration={duration}
                togglePlay={() => isPlaying ? videoRef.current.pause() : videoRef.current.play()}
                toggleMute={() => setIsMuted(!isMuted)}
                handleVolumeChange={(e, newValue) => { setVolume(newValue); videoRef.current.volume = newValue; setIsMuted(newValue === 0); }}
                handleSeek={(e, newValue) => { videoRef.current.currentTime = newValue; setCurrentTime(newValue); }}
                toggleFullscreen={() => {
                  if (!document.fullscreenElement) {
                    if (containerRef.current?.requestFullscreen) {
                      containerRef.current.requestFullscreen();
                    }
                  } else {
                    if (document.exitFullscreen) {
                      document.exitFullscreen();
                    }
                  }
                }}
                formatTime={(seconds) => new Date((seconds || 0) * 1000).toISOString().slice(14, 19)}
                qualities={qualityLevels}
                currentQuality={currentLevel}
                onQualityChange={changeQuality}
                playbackRate={playbackRate}
                onPlaybackRateChange={(rate) => setPlaybackRate(rate)}
                isDownloadable={currentItem.downloadable}
                onDownload={handleVideoDownload}
                captions={mappedCaptions}
                activeCaptionId={activeCaptionId}
                onCaptionChange={setActiveCaptionId}
              />
            )}
          </Box>
        ) : (
          <ArticleContent
            item={currentItem}
            onMarkAsComplete={handleArticleInteraction}
          />
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