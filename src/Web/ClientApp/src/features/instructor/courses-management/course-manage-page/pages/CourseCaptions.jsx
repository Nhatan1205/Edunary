import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Container } from "reactstrap";
import AlertBox from "../../../../../components/AlertBox";
import InfoDialog from "../../../../../components/ConfirmDialogPopup/InfoDialog";
import ConfirmDialog from "../../../../../components/ConfirmDialogPopup/ConfirmDialog";
import DefaultSelect from "../../../../../components/drop-down/DefaultSelect";
import LoadingSpinner from "../../../../../components/LoadingSpinner";
import NoData from "../../../../../components/NoData";
import { useParams } from "react-router";
import useGetHlsVideoByCourseId from "../../../../../hooks/media-file-hooks/useGetHlsVideoByCourseId";
import useGetCaptionLanguage from "../../../../../hooks/video-caption-hooks/useGetCaptionLanguage";
import useUpsertVideoCaption from "../../../../../hooks/video-caption-hooks/useUpsertVideoCaption";
import useDeleteVideoCaption from "../../../../../hooks/video-caption-hooks/useDeleteVideoCaption";
import useGenerateAICaption from "../../../../../hooks/video-caption-hooks/useGenerateAICaption";
import useCaptionGenerateProgress from "../../../../../hooks/video-caption-hooks/useCaptionGenerateProgress";
import queryClient from "../../../../../configs/reactQuery";
import {
  ALL_CAPTION_LANGUAGES,
  DEFAULT_CAPTION_LANGUAGE,
  getCaptionLanguageLabel,
} from "../../../../../utils/captionLanguageHelper";
import emptyCoursesImg from "../../../../../assets/images/empty-videos.png";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Chip,
  Divider,
  useTheme,
  Popover,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import Tooltip from "@mui/material/Tooltip";
import LinearProgress from "@mui/material/LinearProgress";
import { toast } from "react-toastify";

const FILTER_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Captioned", value: "captioned" },
  { label: "Uncaptioned", value: "uncaptioned" }
];

function CourseCaptions() {
  const { courseId } = useParams();
  const numericCourseId = Number(courseId);
  const theme = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState(DEFAULT_CAPTION_LANGUAGE);
  const [addedLanguages, setAddedLanguages] = useState([]);

  // Popover state (language selector)
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverView, setPopoverView] = useState("list"); // 'list' | 'add'

  // "⋮" menu state per row
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuRow, setMenuRow] = useState(null);

  // Delete confirm state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteRow, setPendingDeleteRow] = useState(null);

  // Uploading rows tracker
  const [uploadingRows, setUploadingRows] = useState({}); // { videoId: true }

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isInvalidFormatDialogOpen, setIsInvalidFormatDialogOpen] = useState(false);

  const {
    data: fetchedLanguages = [],
    isLoading: isLanguageLoading,
  } = useGetCaptionLanguage(numericCourseId);

  const languages = useMemo(() => {
    const fromApi = (fetchedLanguages || [])
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
    return [...new Set([...fromApi, ...addedLanguages])];
  }, [fetchedLanguages, addedLanguages]);

  useEffect(() => {
    if (languages.length > 0 && !languages.includes(selectedLanguage)) {
      setSelectedLanguage(languages[0]);
    }
  }, [languages, selectedLanguage]);

  const {
    data: captionVideos = [],
    isLoading: isVideoLoading,
    isError: isVideoError,
  } = useGetHlsVideoByCourseId(numericCourseId, selectedLanguage);

  const upsertCaption = useUpsertVideoCaption();
  const deleteCaption = useDeleteVideoCaption();
  const generateAICaption = useGenerateAICaption();

  const handleComplete = useCallback((mediaFileId) => {
    queryClient.invalidateQueries(["hlsVideos"]);
    queryClient.invalidateQueries(["captionLanguages"]);
  }, []);

  const handleError = useCallback((mediaFileId, message) => {
    toast.error(message || "Failed to generate AI captions.");
  }, []);

  const { generatingRows, setGeneratingRows } = useCaptionGenerateProgress(handleComplete, handleError);

  const handleGenerateAI = async (videoId) => {
    setGeneratingRows((prev) => ({
      ...prev,
      [videoId]: { percent: 0, message: "Starting..." },
    }));
    try {
      await generateAICaption.mutateAsync({
        mediaFileId: videoId,
        targetLanguage: selectedLanguage,
      });
    } catch (err) {
      setGeneratingRows((prev) => {
        const next = { ...prev };
        delete next[videoId];
        return next;
      });
    }
  };

  const handleOpenPopover = (event) => {
    setAnchorEl(event.currentTarget);
    setPopoverView("list");
  };

  const handleClosePopover = () => setAnchorEl(null);

  const handleSelectLanguage = (langValue) => {
    setSelectedLanguage(langValue);
    handleClosePopover();
  };

  const handleAddLanguage = (langValue) => {
    if (!languages.includes(langValue)) {
      setAddedLanguages((prev) => [...prev, langValue]);
      setSelectedLanguage(langValue);
    }
    handleClosePopover();
  };

  const handleFileUpload = async (event, videoId) => {
    const file = event.target.files[0];
    event.target.value = "";

    const isValidVtt = file?.name?.toLowerCase().endsWith(".vtt");
    if (file && !isValidVtt) {
      setIsInvalidFormatDialogOpen(true);
      return;
    }
    if (!file) return;

    setUploadingRows((prev) => ({ ...prev, [videoId]: true }));
    try {
      await upsertCaption.mutateAsync({
        mediaFileId: videoId,   // videoId === MediaFile.Id === MediaFileId
        language: selectedLanguage,
        file,
      });
    } catch (err) {
      // Error is handled and toasted by the hook's onError
    } finally {
      setUploadingRows((prev) => {
        const next = { ...prev };
        delete next[videoId];
        return next;
      });
    }
  };

  const handleOpenMenu = (event, row) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuRow(row);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuRow(null);
  };

  const handleDeleteRequest = () => {
    setPendingDeleteRow(menuRow);
    setShowDeleteConfirm(true);
    handleCloseMenu();
  };

  const handleConfirmDelete = async () => {
    if (pendingDeleteRow?.captionId) {
      try {
        await deleteCaption.mutateAsync(pendingDeleteRow.captionId);
      } catch (err) {
        // Error is handled and toasted by the hook's onError
      }
    }
    setShowDeleteConfirm(false);
    setPendingDeleteRow(null);
  };

  const currentVideos = (captionVideos || []).map((video) => ({
    id: video.videoId,
    videoTitle: video.videoTitle,
    fileName: video.captionFileName,
    status: video.isCaptioned ? "Captioned" : "Uncaptioned",
    captionId: video.captionId,
    uploadStatus: video.uploadStatus,
  }));

  const availableToAdd = ALL_CAPTION_LANGUAGES.filter(
    (language) => !languages.includes(language.value)
  );

  const filteredVideos = currentVideos.filter((video) => {
    const matchesSearch = (video.videoTitle || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all"
        ? true
        : filterStatus === "captioned"
          ? video.status === "Captioned"
          : video.status === "Uncaptioned";
    return matchesSearch && matchesFilter;
  });

  const isVideoApiEmpty = !isVideoError && (captionVideos?.length || 0) === 0;

  if (isLanguageLoading || isVideoLoading) {
    return (
      <Box sx={{ minHeight: "40vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <Container className="py-2">
      <AlertBox severity="info" sx={{ mb: 4 }}>
        Learners of all levels of language proficiency highly value subtitles as it helps follow, understand and memorize the content. Also having subtitles to ensure the content is accessible for those that are deaf or hard of hearing is crucial.
      </AlertBox>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        {/* Left: Title & Language Selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Captions
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={handleOpenPopover}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{
                color: 'text.primary',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                textTransform: 'none',
                fontWeight: 500,
                minWidth: 150,
                justifyContent: 'space-between',
              }}
            >
              {getCaptionLanguageLabel(selectedLanguage)}
            </Button>

            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handleClosePopover}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{ paper: {
                sx: {
                  mt: 1,
                  minWidth: 220,
                  borderRadius: 2,
                  boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
                }
              } }}
            >
              {popoverView === "list" ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: 350 }}>
                  <Box sx={{ overflowY: 'auto', py: 1 }}>
                    {languages.map((langValue) => (
                      <MenuItem
                        key={langValue}
                        selected={langValue === selectedLanguage}
                        onClick={() => handleSelectLanguage(langValue)}
                        sx={{
                          fontWeight: 500,
                          '&.Mui-selected': {
                            bgcolor: 'brand.lighter',
                            color: 'brand.darker',
                            '&:hover': { bgcolor: 'brand.light', color: 'brand.darker' }
                          }
                        }}
                      >
                        {getCaptionLanguageLabel(langValue)}
                      </MenuItem>
                    ))}
                    {languages.length === 0 && (
                      <Typography variant="body2" sx={{ p: 2, color: "text.secondary", textAlign: "center" }}>
                        No caption language yet
                      </Typography>
                    )}
                  </Box>
                  <Divider sx={{ m: 0 }} />
                  <Box sx={{ p: 1 }}>
                    <MenuItem
                      onClick={() => setPopoverView("add")}
                      sx={{ color: 'brand.main', fontWeight: 600, borderRadius: 1 }}
                    >
                      <AddIcon fontSize="small" sx={{ mr: 1 }} /> Add new language
                    </MenuItem>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: 350 }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Add Language</Typography>
                    <Button size="small" onClick={() => setPopoverView("list")} sx={{ color: 'text.secondary', textTransform: 'none' }}>
                      Cancel
                    </Button>
                  </Box>
                  <Box sx={{ overflowY: 'auto', py: 1 }}>
                    {availableToAdd.length > 0 ? (
                      availableToAdd.map((lang) => (
                        <MenuItem key={lang.value} onClick={() => handleAddLanguage(lang.value)} sx={{ fontWeight: 500 }}>
                          {lang.label}
                        </MenuItem>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>
                        All languages added
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Popover>
          </Box>
        </Box>

        {/* Right: Search & Filter */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            placeholder="Search video..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              minWidth: 200,
              backgroundColor: "white",
              "& .MuiOutlinedInput-root": {
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
              },
            }}
            slotProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <DefaultSelect
            data={FILTER_OPTIONS}
            value={FILTER_OPTIONS.filter(item => item.value === filterStatus)}
            onChange={(selected) => setFilterStatus(selected.length > 0 ? selected[0].value : "all")}
            defaultLabel="All Status"
          />
        </Box>
      </Box>

      {isVideoError && (
        <Typography variant="body2" sx={{ mb: 2, color: "error.main" }}>
          Failed to load captions. Please refresh and try again.
        </Typography>
      )}

      {isVideoApiEmpty ? (
        <NoData
          image={emptyCoursesImg}
          title="No videos available for captions"
          description="Add HLS-ready videos to this course first, then upload captions by language."
          minHeight="320px"
        />
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 2,
            boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: 'grey.200' }}>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem', letterSpacing: 0.5 }}>VIDEO</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem', letterSpacing: 0.5 }}>STATUS</TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem', letterSpacing: 0.5 }}>ACTIONS</TableCell>
                <TableCell sx={{ width: 48 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVideos.length > 0 ? (
                filteredVideos.map((row) => {
                  const isUploading = Boolean(uploadingRows[row.id]);
                  return (
                    <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {/* Video info */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {row.videoTitle}
                        </Typography>
                        {row.fileName ? (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {row.fileName}
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            No file uploaded
                          </Typography>
                        )}
                      </TableCell>

                      {/* Status chip */}
                      {(() => {
                        const aiState = generatingRows[row.id];
                        return (
                          <TableCell>
                            {isUploading ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={14} sx={{ color: 'brand.main' }} />
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Uploading...</Typography>
                              </Box>
                            ) : aiState ? (
                              <Box sx={{ minWidth: 140 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <CircularProgress size={12} sx={{ color: 'brand.main' }} />
                                  <Typography variant="caption" sx={{ color: 'brand.main', fontWeight: 600 }}>
                                    {aiState.message}
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={aiState.percent}
                                  sx={{
                                    height: 4,
                                    borderRadius: 2,
                                    bgcolor: 'grey.200',
                                    '& .MuiLinearProgress-bar': { bgcolor: 'brand.main' }
                                  }}
                                />
                              </Box>
                            ) : (
                              <Chip
                                label={row.status}
                                size="small"
                                sx={{
                                  bgcolor: row.status === "Captioned" ? 'success.lighter' : 'warning.lighter',
                                  color: row.status === "Captioned" ? 'success.darker' : 'warning.darker',
                                  fontWeight: 700,
                                  borderRadius: 1,
                                  px: 0.5
                                }}
                              />
                            )}
                          </TableCell>
                        );
                      })()}

                      {/* Actions: AI Generate + Upload .vtt */}
                      {(() => {
                        const aiState = generatingRows[row.id];
                        const isGenerating = Boolean(aiState);
                        return (
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              {/* AI Generate button — always visible */}
                              <Tooltip title={isGenerating ? aiState.message : "Generate caption with AI (Whisper STT)"}>
                                <span>
                                  <Button
                                    variant="outlined"
                                    startIcon={isGenerating ? <CircularProgress size={14} /> : <SmartToyOutlinedIcon />}
                                    size="small"
                                    disabled={isGenerating || isUploading}
                                    onClick={() => handleGenerateAI(row.id)}
                                    id={`ai-generate-btn-${row.id}`}
                                    sx={{
                                      color: 'brand.main',
                                      borderColor: 'brand.main',
                                      textTransform: 'none',
                                      '&:hover': { borderColor: 'brand.dark', bgcolor: 'brand.lighter' },
                                    }}
                                  >
                                    {isGenerating ? "Generating..." : "AI Generate"}
                                  </Button>
                                </span>
                              </Tooltip>

                              {/* Upload .vtt button */}
                              <Button
                                component="label"
                                variant="outlined"
                                startIcon={isUploading ? <CircularProgress size={14} /> : <CloudUploadIcon />}
                                size="small"
                                disabled={isUploading || isGenerating}
                                sx={{
                                  color: 'brand.main',
                                  borderColor: 'brand.main',
                                  textTransform: 'none',
                                  '&:hover': { borderColor: 'brand.dark', bgcolor: 'brand.lighter' }
                                }}
                              >
                                {isUploading ? "Uploading..." : "Upload .vtt"}
                                <input
                                  type="file"
                                  style={{ display: 'none' }}
                                  accept=".vtt"
                                  onChange={(e) => handleFileUpload(e, row.id)}
                                />
                              </Button>
                            </Box>
                          </TableCell>
                        );
                      })()}

                      {/* "⋮" menu — chỉ hiện khi đã có caption */}
                      <TableCell sx={{ width: 48, p: 0.5 }}>
                        {row.status === "Captioned" && (
                          <IconButton
                            size="small"
                            onClick={(e) => handleOpenMenu(e, row)}
                            id={`caption-menu-btn-${row.id}`}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No videos found matching your criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* "⋮" Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: {
          sx: {
            minWidth: 180,
            borderRadius: 2,
            boxShadow: '0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)',
          }
        } }}
      >
        <MenuItem
          onClick={handleDeleteRequest}
          sx={{ color: 'error.main', gap: 1 }}
        >
          <DeleteOutlineIcon fontSize="small" />
          Delete caption
        </MenuItem>
      </Menu>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Caption"
        message={`Are you sure you want to delete the caption file for "${pendingDeleteRow?.videoTitle}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onClose={() => { setShowDeleteConfirm(false); setPendingDeleteRow(null); }}
      />

      {/* Invalid format dialog */}
      <InfoDialog
        open={isInvalidFormatDialogOpen}
        onClose={() => setIsInvalidFormatDialogOpen(false)}
        title="Invalid subtitle format"
        message="Please upload a valid subtitle file with the .vtt extension only."
      />
    </Container>
  );
}

export default CourseCaptions;
