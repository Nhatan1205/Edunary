import { useState } from "react";
import { useParams } from "react-router";
import {
  Box,
  Button,
  Typography,
  Tabs,
  Tab,
  Switch,
  TextField,
  IconButton,
  duration,
} from "@mui/material";
import {
  Edit as EditIcon,
  Search as SearchIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import useCheckFileExists from "../../../../../../hooks/media-file-hooks/useCheckFileExists";
import useChunkedUpload from "../../../../../../hooks/media-file-hooks/useChunkedUpload";
import useGetMediaFile from "../../../../../../hooks/media-file-hooks/useGetMediaFile";
import useDeleteMediaFileById from "../../../../../../hooks/media-file-hooks/useDeleteMediaFileById";
import useSetCourseIdForContent from "../../../../../../hooks/media-file-hooks/useSetCourseIdForContent";
import FileOverrideDialog from "../FileOverrideDialog";
import FileUploadSection from "../FileUploadSection";
import FileLibraryTable from "../FileLibraryTable";
import ConfirmDialog from "../../../../../../components/ConfirmDialogPopup/ConfirmDialog";
import InfoDialog from "../../../../../../components/ConfirmDialogPopup/InfoDialog";
import LoadingSpinner from "../../../../../../components/LoadingSpinner";

function VideoContent({ item, onUpdate, onCancel }) {
  const { courseId } = useParams();
  const [showVideoUploadForm, setShowVideoUploadForm] = useState(!item.content);
  const [videoUploadTab, setVideoUploadTab] = useState(0);
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [videoUploadInfo, setVideoUploadInfo] = useState(null);
  const [overrideChecked, setOverrideChecked] = useState(false);
  const [uploadedContent, setUploadedContent] = useState(item.content || null);
  const [isDownloadable, setIsDownloadable] = useState(item.downloadable || false);
  const [isFreePreview, setIsFreePreview] = useState(item.isFreePreview || false);
  const [videoDuration, setVideoDuration] = useState(item.videoDuration || "00:00:00");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteContent, setPendingDeleteContent] = useState(null);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  const checkFileExists = useCheckFileExists();
  const chunkedUpload = useChunkedUpload();
  const deleteCourseContent = useDeleteMediaFileById();
  const setCourseIdForContent = useSetCourseIdForContent();
  const { data: courseContents, isLoading: isLoadingCourseContents } = useGetMediaFile();
  // Format date helper
  const formatDate = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Filter course contents based on search query and only show videos
  const filteredCourseContents = courseContents?.filter(content =>
    content.contentType?.startsWith('video/') && content.hlsStatus === 2 &&
    content.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleUploadFile = async (file, override = false) => {
    if (item.videoId) {
      await setCourseIdForContent.mutateAsync({
        contentIds: [item.videoId],
        courseId: null
      });
    }
    try {
      const result = await chunkedUpload.mutateAsync({
        file: file,
        fileHash: "",
        courseId: courseId ? parseInt(courseId) : null,
        onProgress: (progressData) => {
          // Update progress in real-time
          setVideoUploadInfo(prev => prev ? {
            ...prev,
            uploadedChunks: progressData.uploadedChunks,
            totalChunks: progressData.totalChunks,
            progressPercentage: progressData.progressPercentage,
            status: progressData.status
          } : null);
        }
      });
      if (result && result.sessionId) {
        // Update with uploaded content
        setUploadedContent(result.fileName || file.name);
        setIsDownloadable(false);
        setIsFreePreview(false);
        // Use duration from backend response (HH:MM:SS format)
        setVideoDuration(result.duration || "00:00:00");

        if (onUpdate) {
          onUpdate(item.itemId, {
            content: result.fileName || file.name,
            downloadable: false,
            isFreePreview: false,
            videoId: result.sessionId,
            videoDuration: result.duration || "00:00:00"
          });
        }
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setVideoUploadInfo(prev => prev ? { ...prev, status: "FAILED" } : null);
    }

    setVideoUploadInfo(null);
    setSelectedVideoFile(null);
    setShowVideoUploadForm(false);
  };

  const handleCheckExistFile = async (file) => {
    const exists = await checkFileExists.mutateAsync({ fileName: file.name });

    if (exists) {
      setPendingFile(file);
      setShowOverrideDialog(true);
    } else {
      setSelectedVideoFile(file);
      const totalChunks = Math.ceil(file.size / (5 * 1024 * 1024));

      setVideoUploadInfo({
        fileName: file.name,
        type: "Video",
        fileSize: file.size,
        fileType: file.type,
        uploadDate: formatDate(new Date()),
        status: "IN_PROGRESS",
        showProgress: true,
        override: false,
        uploadedChunks: 0,
        totalChunks: totalChunks,
        progressPercentage: 0,
      });

      await handleUploadFile(file, false);
    }
  };

  const handleVideoFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type - only allow video formats
      const validVideoTypes = [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-ms-wmv',
        'video/webm',
        'video/ogg',
        'video/3gpp',
        'video/x-flv'
      ];

      if (!validVideoTypes.includes(file.type) && !file.type.startsWith('video/')) {
        setInfoMessage("Invalid file format. Please select a valid video file (MP4, AVI, MOV, WMV, WebM, etc.).");
        setShowInfoDialog(true);
        e.target.value = '';
        return;
      }

      const maxSize = 512 * 1024 * 1024;

      if (file.size > maxSize) {
        setInfoMessage("File size exceeds 512MB. Please select a smaller video file.");
        setShowInfoDialog(true);
        e.target.value = '';
        return;
      }

      await handleCheckExistFile(file);
    }
    e.target.value = '';
  };

  const handleConfirmOverride = async () => {
    if (pendingFile) {
      setShowOverrideDialog(false);

      setSelectedVideoFile(pendingFile);
      const totalChunks = Math.ceil(pendingFile.size / (5 * 1024 * 1024));

      setVideoUploadInfo({
        fileName: pendingFile.name,
        type: "Video",
        fileSize: pendingFile.size,
        fileType: pendingFile.type,
        uploadDate: formatDate(new Date()),
        status: "IN_PROGRESS",
        showProgress: true,
        override: overrideChecked,
        uploadedChunks: 0,
        totalChunks: totalChunks,
        progressPercentage: 0,
      });

      await handleUploadFile(pendingFile, overrideChecked);

      setPendingFile(null);
      setOverrideChecked(false);
    }
  };

  const handleCancelOverride = () => {
    setShowOverrideDialog(false);
    setPendingFile(null);
    setOverrideChecked(false);
  };

  const handleDownloadableChange = (checked) => {
    setIsDownloadable(checked);

    if (onUpdate) {
      onUpdate(item.itemId, { downloadable: checked });
    }
  };

  const handleFreePreviewChange = (checked) => {
    setIsFreePreview(checked);

    if (onUpdate) {
      onUpdate(item.itemId, { isFreePreview: checked });
    }
  };

  const handleEditContent = () => {
    setShowVideoUploadForm(true);
  };

  const handleReplaceContentType = async () => {
    if (item.videoId) {
      await setCourseIdForContent.mutateAsync({
        contentIds: [item.videoId],
        courseId: null
      });
    }
    if (onUpdate) {
      onUpdate(item.itemId, {
        content: null,
        contentType: null,
        videoId: 0,
        videoDuration: null,
        thumbnailUrl: null
      });
    }
    if (onCancel) {
      onCancel(true); // Pass true to show content type selector
    }
  };

  const handleDeleteContent = (content) => {
    setPendingDeleteContent(content);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (pendingDeleteContent) {
      await deleteCourseContent.mutateAsync(pendingDeleteContent.id);
      setShowDeleteConfirm(false);
      setPendingDeleteContent(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setPendingDeleteContent(null);
  };

  const handleDeleteOldContent = async () => {
    if (item.videoId) {
      await setCourseIdForContent.mutateAsync({
        contentIds: [item.videoId],
        courseId: null
      });
    }
  }

  const handleSelectFromLibrary = async (content) => {
    if (courseId) {
      // Delete old content if exists
      await handleDeleteOldContent();
      await setCourseIdForContent.mutateAsync({
        contentIds: [content.id],
        courseId: parseInt(courseId)
      });

      // Set the uploaded content to display the video
      setUploadedContent(content.fileName);
      setShowVideoUploadForm(false);

      if (onUpdate) {
        onUpdate(item.itemId, {
          content: content.fileName,
          downloadable: false,
          isFreePreview: false,
          videoId: content.id,
          videoDuration: content.duration,
          thumbnailUrl: content.thumbnailUrl
        });
        setVideoDuration(content.duration);
      }
    }
  };


  if (isLoadingCourseContents) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      {/* Video Upload Form */}
      {showVideoUploadForm && (
        <Box sx={{
          mb: 2,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          pb: 2,
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              Add Video
            </Typography>
            <Button
              size="small"
              onClick={() => {
                setShowVideoUploadForm(false);
                setSelectedVideoFile(null);

                // If no content uploaded yet, cancel and go back to +Content button
                if (!uploadedContent && onCancel) {
                  onCancel();
                }
              }}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "text.secondary",
                minWidth: "auto",
              }}
            >
              <CloseIcon fontSize="small" />
            </Button>
          </Box>

          <Tabs
            value={videoUploadTab}
            onChange={(e, newValue) => setVideoUploadTab(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              mb: 2,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
              },
            }}
          >
            <Tab label="Upload Video" />
            <Tab label="Add from library (Only Hls-converted videos)" />
          </Tabs>

          {/* Upload Video Tab */}
          {videoUploadTab === 0 && (
            <FileUploadSection
              fileInfo={videoUploadInfo}
              onFileChange={handleVideoFileChange}
              acceptFileType="video/*"
              maxSizeMB={512}
              noteText="Note: All files should be less than 512 MB."
              buttonLabel="Select Video"
            />
          )}

          {/* Add from library Tab */}
          {videoUploadTab === 1 && (
            <Box>
              {/* Search Bar */}
              <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Search files by name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "background.paper",
                      height: "36px",
                    },
                  }}
                />
                <IconButton
                  sx={{
                    bgcolor: "brand.main",
                    color: "white",
                    width: "36px",
                    height: "36px",
                    borderRadius: 1,
                    "&:hover": {
                      bgcolor: "brand.dark",
                    },
                  }}
                >
                  <SearchIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Video Library Table */}
              <FileLibraryTable
                contents={filteredCourseContents}
                onSelect={handleSelectFromLibrary}
                onDelete={handleDeleteContent}
              />
            </Box>
          )}
        </Box>
      )}

      {/* Uploaded Video Display */}
      {uploadedContent && !showVideoUploadForm && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
            {/* Video Thumbnail */}
            <Box
              sx={{
                width: 150,
                height: 84,
                bgcolor: "background.alt",
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                overflow: "hidden",
                flexShrink: 0,
                position: "relative",
              }}
            >
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt="Video Thumbnail"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "text.secondary",
                  }}
                >
                  <Typography variant="caption">Processing...</Typography>
                </Box>
              )}
            </Box>

            {/* Video Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    wordBreak: "break-word",
                    fontSize: "0.95rem",
                  }}
                >
                  {uploadedContent.split(/[\\/]/).pop() || "Video"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  {videoDuration}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={handleEditContent}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    color: "brand.main",
                    justifyContent: "flex-start",
                    minWidth: "auto",
                    p: 0,
                    fontSize: "0.875rem",
                    "&:hover": {
                      bgcolor: "transparent",
                      textDecoration: "underline",
                    },
                  }}
                >
                  Edit Content
                </Button>
                <Button
                  size="small"
                  startIcon={<ArticleIcon />}
                  onClick={handleReplaceContentType}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    color: "brand.main",
                    justifyContent: "flex-start",
                    minWidth: "auto",
                    p: 0,
                    fontSize: "0.875rem",
                    "&:hover": {
                      bgcolor: "transparent",
                      textDecoration: "underline",
                    },
                  }}
                >
                  Replace content type
                </Button>
              </Box>
            </Box>

            {/* Content Toggles */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flexShrink: 0, ml: "auto" }}>
              {/* Downloadable Toggle */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "text.primary" }}>
                  Downloadable
                </Typography>
                <Switch
                  checked={isDownloadable}
                  onChange={(e) => handleDownloadableChange(e.target.checked)}
                  size="small"
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "brand.main",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      bgcolor: "brand.main",
                    },
                  }}
                />
              </Box>

              {/* Free Preview Toggle */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "text.primary" }}>
                  Free Preview
                </Typography>
                <Switch
                  checked={isFreePreview}
                  onChange={(e) => handleFreePreviewChange(e.target.checked)}
                  size="small"
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "brand.main",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      bgcolor: "brand.main",
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <FileOverrideDialog
        open={showOverrideDialog}
        fileName={pendingFile?.name}
        overrideChecked={overrideChecked}
        onOverrideChange={setOverrideChecked}
        onConfirm={handleConfirmOverride}
        onCancel={handleCancelOverride}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Video"
        message={`Are you sure you want to delete "${pendingDeleteContent?.fileName}"?`}
        onConfirm={handleConfirmDelete}
        onClose={handleCancelDelete}
      />

      <InfoDialog
        open={showInfoDialog}
        title="File Size/Extension Error"
        message={infoMessage}
        onClose={() => setShowInfoDialog(false)}
      />
    </>
  );
}

export default VideoContent;
