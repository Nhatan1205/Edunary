import { useState } from "react";
import { useParams } from "react-router";
import {
  Box,
  Button,
  Typography,
  Tabs,
  Tab,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useCheckContentExists from "../../../../../hooks/useCheckContentExists";
import useCreateCourseContent from "../../../../../hooks/useCreateCourseContent";
import useAddLinkToCC from "../../../../../hooks/useAddLinkToCC";
import useGetCourseContent from "../../../../../hooks/useGetCourseContent";
import useDeleteCourseContentById from "../../../../../hooks/useDeleteCourseContentById";
import useSetCourseIdForContent from "../../../../../hooks/useSetCourseIdForContent";
import FileOverrideDialog from "./FileOverrideDialog";
import FileUploadSection from "./FileUploadSection";
import FileLibraryTable from "./FileLibraryTable";
import ConfirmDialog from "../../../../../components/ConfirmDialogPopup/ConfirmDialog";
import InfoDialog from "../../../../../components/ConfirmDialogPopup/InfoDialog";
import LoadingSpinner from "../../../../../components/LoadingSpinner";

function ResourceContent({ item, onUpdate, onClose }) {
  const { courseId } = useParams();
  const [resourceTab, setResourceTab] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [fileUploadInfo, setFileUploadInfo] = useState(null);
  const [overrideChecked, setOverrideChecked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteContent, setPendingDeleteContent] = useState(null);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [pendingLink, setPendingLink] = useState(null);

  const checkContentExists = useCheckContentExists();
  const createCourseContent = useCreateCourseContent();
  const addLinkToCC = useAddLinkToCC();
  const deleteCourseContent = useDeleteCourseContentById();
  const setCourseIdForContent = useSetCourseIdForContent();
  const { data: courseContents, isLoading: isLoadingCourseContents } = useGetCourseContent();

  // Format date helper
  const formatDate = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Filter course contents - all file types for resources
  const filteredCourseContents = courseContents?.filter(content =>
    content.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleUploadFile = async (file, override = false) => {
    setFileUploadInfo(prev => prev ? { ...prev, status: "Uploading..." } : null);

    const result = await createCourseContent.mutateAsync({
      file,
      isOverride: override,
      courseId: courseId ? parseInt(courseId) : null
    });

    if (result && result.result) {
      // Add to resources list
      if (onUpdate) {
        onUpdate(item.itemId, {
          resources: [...(item.resources || []), {
            id: result.result.id,
            fileName: result.result.fileName,
            fileUrl: result.result.fileUrl
          }]
        });
      }
    }

    setFileUploadInfo(null);
    setSelectedFile(null);
  };

  const handleCheckExistFile = async (file) => {
    const exists = await checkContentExists.mutateAsync({ fileName: file.name });

    if (exists) {
      setPendingFile(file);
      setShowOverrideDialog(true);
    } else {
      setSelectedFile(file);
      setFileUploadInfo({
        fileName: file.name,
        type: "File",
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

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 1024 * 1024 * 1024; // 1GB

      if (file.size > maxSize) {
        setInfoMessage("File size exceeds 1GB limit. Please select a smaller file.");
        setShowInfoDialog(true);
        e.target.value = '';
        return;
      }

      await handleCheckExistFile(file);
    }
    e.target.value = '';
  };

  const handleOverrideConfirm = async () => {
    if (pendingFile) {
      setSelectedFile(pendingFile);
      setFileUploadInfo({
        fileName: pendingFile.name,
        type: "File",
        fileSize: pendingFile.size,
        fileType: pendingFile.type,
        uploadDate: formatDate(new Date()),
        status: "Uploading...",
        showProgress: true,
        override: true,
      });

      await handleUploadFile(pendingFile, true);
    } else if (pendingLink) {
      await handleSaveLink(pendingLink.title, pendingLink.url, overrideChecked);
    }
    setShowOverrideDialog(false);
    setPendingFile(null);
    setPendingLink(null);
    setOverrideChecked(false);
  };

  const handleOverrideCancel = () => {
    setShowOverrideDialog(false);
    setPendingFile(null);
    setPendingLink(null);
    setOverrideChecked(false);
  };

  const handleSelectFromLibrary = async (content) => {
    if (courseId) {
      await setCourseIdForContent.mutateAsync({
        contentIds: [content.id],
        courseId: parseInt(courseId)
      });

      // Add to resources list
      if (onUpdate) {
        onUpdate(item.itemId, {
          resources: [...(item.resources || []), {
            id: content.id,
            fileName: content.fileName,
            fileUrl: content.fileUrl
          }]
        });
      }

      if (onClose) {
        onClose();
      }
    }
  };

  const handleAddLink = async () => {
    if (!linkTitle.trim() || !linkUrl.trim()) return;

    const exists = await checkContentExists.mutateAsync({ fileName: linkTitle });

    if (exists) {
      setPendingLink({ title: linkTitle, url: linkUrl });
      setShowOverrideDialog(true);
    } else {
      await handleSaveLink(linkTitle, linkUrl, false);
    }
  };

  const handleSaveLink = async (title, url, override = false) => {
    const result = await addLinkToCC.mutateAsync({
      title,
      url,
      isOverride: override,
      courseId: courseId ? parseInt(courseId) : null
    });

    if (result && result.result) {
      // Add to resources list
      if (onUpdate) {
        onUpdate(item.itemId, {
          resources: [...(item.resources || []), {
            id: result.result.id,
            fileName: result.result.fileName,
            fileUrl: result.result.fileUrl
          }]
        });
      }
    }

    // Reset form
    setLinkTitle("");
    setLinkUrl("");
    setPendingLink(null);
    
    if (onClose) {
      onClose();
    }
  };

  const handleDeleteContent = (content) => {
    setPendingDeleteContent(content);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (pendingDeleteContent) {
      await deleteCourseContent.mutateAsync(pendingDeleteContent.id);
    }
    setShowDeleteConfirm(false);
    setPendingDeleteContent(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setPendingDeleteContent(null);
  };

  if (isLoadingCourseContents) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Box sx={{
        mt: 2,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        pt: 2,                       
        }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            Add Resources
          </Typography>
          <Button
            size="small"
            onClick={() => {
              if (onClose) {
                onClose();
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
            value={resourceTab}
            onChange={(e, newValue) => setResourceTab(newValue)}
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
            <Tab label="Downloadable File" />
            <Tab label="Add from library" />
            <Tab label="External Resource" />
          </Tabs>

          {/* Downloadable File Tab */}
          {resourceTab === 0 && (
            <FileUploadSection
              fileInfo={fileUploadInfo}
              onFileChange={handleFileChange}
              acceptFileType="*/*"
              maxSizeMB={1024}
              noteText="Note: A resource is for any type of document that can be used to help students in the lecture. This file is going to be seen as a lecture extra. Make sure everything is legible and the file size is less than 512MB."
              buttonLabel="Select File"
            />
          )}

          {/* Add from library Tab */}
          {resourceTab === 1 && (
            <Box>
              {/* Search Bar */}
              <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Search files by name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                />
              </Box>

              {/* Library Table */}
              <FileLibraryTable
                contents={filteredCourseContents}
                onSelect={handleSelectFromLibrary}
                onDelete={handleDeleteContent}
              />
            </Box>
          )}

          {/* External Resource Tab */}
          {resourceTab === 2 && (
            <Box>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "text.primary"
                }}
              >
                Title
              </Typography>
              <TextField
                fullWidth
                placeholder="A descriptive title"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                sx={{ 
                  mb: 2.5,
                  "& .MuiOutlinedInput-root": {
                    padding: "12px 16px",
                    fontSize: "14px",
                    "&:hover fieldset": {
                      borderColor: "brand.main",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "brand.main",
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiInputBase-input": {
                    padding: 0,
                  },
                }}
              />
              
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "text.primary"
                }}
              >
                URL
              </Typography>
              <TextField
                fullWidth
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                sx={{ 
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    padding: "12px 16px",
                    fontSize: "14px",
                    "&:hover fieldset": {
                      borderColor: "brand.main",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "brand.main",
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiInputBase-input": {
                    padding: 0,
                  },
                }}
              />
              
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  onClick={handleAddLink}
                  disabled={!linkTitle.trim() || !linkUrl.trim()}
                  sx={{
                    bgcolor: "brand.main",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    "&:hover": {
                      bgcolor: "brand.dark",
                    },
                  }}
                >
                  Add link
                </Button>
              </Box>
            </Box>
          )}
      </Box>

      {/* Dialogs */}
      <FileOverrideDialog
        open={showOverrideDialog}
        fileName={pendingFile?.name || pendingLink?.title}
        checked={overrideChecked}
        onCheckedChange={(e) => setOverrideChecked(e.target.checked)}
        onConfirm={handleOverrideConfirm}
        onCancel={handleOverrideCancel}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Content"
        message={`Are you sure you want to delete "${pendingDeleteContent?.fileName}"?`}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />

      <InfoDialog
        open={showInfoDialog}
        title="File Size Error"
        message={infoMessage}
        onClose={() => setShowInfoDialog(false)}
      />
    </>
  );
}

export default ResourceContent;
