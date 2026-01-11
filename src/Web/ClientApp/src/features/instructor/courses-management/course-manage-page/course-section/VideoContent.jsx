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
} from "@mui/material";
import {
  Edit as EditIcon,
  Search as SearchIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import useCheckContentExists from "../../../../../hooks/useCheckContentExists";
import useCreateCourseContent from "../../../../../hooks/useCreateCourseContent";
import useGetCourseContent from "../../../../../hooks/useGetCourseContent";
import useDeleteCourseContentById from "../../../../../hooks/useDeleteCourseContentById";
import useSetCourseIdForContent from "../../../../../hooks/useSetCourseIdForContent";
import useGenerateUploadUrl from "../../../../../hooks/useGenerateUploadUrl";
import useUploadToSpaces from "../../../../../hooks/useUploadToSpaces";
import useAddLinkToCC from "../../../../../hooks/useAddLinkToCC";
import FileOverrideDialog from "./FileOverrideDialog";
import FileUploadSection from "./FileUploadSection";
import FileLibraryTable from "./FileLibraryTable";
import ConfirmDialog from "../../../../../components/ConfirmDialogPopup/ConfirmDialog";
import InfoDialog from "../../../../../components/ConfirmDialogPopup/InfoDialog";
import LoadingSpinner from "../../../../../components/LoadingSpinner";

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
  const [videoDuration, setVideoDuration] = useState("00:00");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteContent, setPendingDeleteContent] = useState(null);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  const checkContentExists = useCheckContentExists();
  const createCourseContent = useCreateCourseContent();
  const deleteCourseContent = useDeleteCourseContentById();
  const setCourseIdForContent = useSetCourseIdForContent();
  const generateUploadUrl = useGenerateUploadUrl();
  const uploadToSpaces = useUploadToSpaces();
  const addLinkToCC = useAddLinkToCC();
  const { data: courseContents, isLoading : isLoadingCourseContents } = useGetCourseContent();

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
    content.contentType?.startsWith('video/') &&
    content.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleVideoMetadataLoad = (e) => {
    const video = e.target;
    const duration = video.duration;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    setVideoDuration(formattedDuration);
    if (onUpdate) {
      onUpdate(item.itemId, { 
        videoDuration: formattedDuration
      });
    }
  };

  const handleUploadFile = async (file, override = false) => {
    if (item.videoId) {
      await setCourseIdForContent.mutateAsync({ 
        contentIds: [item.videoId],
        courseId: null
      });
    }
    setVideoUploadInfo(prev => prev ? { ...prev, status: "Uploading..." } : null);
    const fileSize = file.size;
    const maxSize = 5 * 1024 * 1024;
    if (fileSize > maxSize) {
      const data = await generateUploadUrl.mutateAsync({ 
        fileName: file.name, 
        contentType: file.type
      });
      const { uploadUrl, fileName, fileUrl } = data.result;
      const uploadResult = await uploadToSpaces.mutateAsync({ uploadUrl, file });
      if (!uploadResult.ok) {
        setVideoUploadInfo(prev => prev ? { ...prev, status: "Upload failed" } : null);
        return;
      }
      const result = await addLinkToCC.mutateAsync({ 
        title: fileName, 
        url: fileUrl,
        isOverride: override,
        courseId: courseId ? parseInt(courseId) : null,
        contentType: file.type
      });
      if (result && result.result) {
        setUploadedContent(result.result.fileUrl);
        setIsDownloadable(false);
        
        if (onUpdate) {
          onUpdate(item.itemId, { 
            content: result.result.fileUrl,
            downloadable: false,
            videoId : result.result.id
          });
        }
      }
    }
    else {
      const result = await createCourseContent.mutateAsync({ 
        file, 
        isOverride: override,
        courseId: courseId ? parseInt(courseId) : null
      });
      if (result && result.result) {
        setUploadedContent(result.result.fileUrl);
        setIsDownloadable(false);
        
        if (onUpdate) {
          onUpdate(item.itemId, { 
            content: result.result.fileUrl,
            downloadable: false,
            videoId : result.result.id
          });
        }
      }
    }
    setVideoUploadInfo(null);
    setSelectedVideoFile(null);
    setShowVideoUploadForm(false);
  };

  const handleCheckExistFile = async (file) => {
    const exists = await checkContentExists.mutateAsync({ fileName: file.name });
    
    if (exists) {
      setPendingFile(file);
      setShowOverrideDialog(true);
    } else {
      setSelectedVideoFile(file);
      setVideoUploadInfo({
        fileName: file.name,
        type: "Video",
        fileSize: file.size,
        fileType: file.type,
        uploadDate: formatDate(new Date()),
        status: "Uploading...",
        showProgress: true,
        override: false,
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
      setVideoUploadInfo({
        fileName: pendingFile.name,
        type: "Video",
        fileSize: pendingFile.size,
        fileType: pendingFile.type,
        uploadDate: formatDate(new Date()),
        status: "Uploading...",
        showProgress: true,
        override: overrideChecked,
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

  const handleEditContent = () => {
    setShowVideoUploadForm(true);
  };

  const handleReplaceContentType = async() => {
    if (item.videoId ) {
      await setCourseIdForContent.mutateAsync({ 
        contentIds: [item.videoId], 
        courseId: null 
      });
    }
    if (onUpdate) {
      onUpdate(item.itemId, { 
        content: null,
        contentType: null,
        videoId: null,
        videoDuration: null
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
    if (item.videoId ) {
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
      setUploadedContent(content.fileUrl);
      setShowVideoUploadForm(false);
      
      if (onUpdate) {
        onUpdate(item.itemId, { 
          content: content.fileUrl,
          downloadable: false,
          videoId : content.id
        });
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
            <Tab label="Add from library" />
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
              <video 
                src={uploadedContent}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                preload="metadata"
                onLoadedMetadata={handleVideoMetadataLoad}
                onContextMenu={(e) => e.preventDefault()}
                controlsList="nodownload"
              />
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
                  {uploadedContent.split('/').pop() || "Video"}
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

            {/* Downloadable Toggle */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
              <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "text.primary" }}>
                Downloadable:
              </Typography>
              <Switch
                checked={isDownloadable}
                onChange={(e) => handleDownloadableChange(e.target.checked)}
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
