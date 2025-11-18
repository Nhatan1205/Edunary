import { useState } from "react";
import { 
  Box, 
  Button, 
  Typography,
} from "@mui/material";
import {
  Edit as EditIcon,
  VideoLibrary as VideoIcon,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import TextEditor from "../../../../../components/TextEditor";

function ArticleContent({ item, onUpdate, onCancel }) {
  const [articleContent, setArticleContent] = useState(item.content || "");
  const [showEditor, setShowEditor] = useState(!item.content);

  const handleSave = () => {
    // Strip HTML tags to check if content is actually empty
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = articleContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    
    if (onUpdate && textContent.trim()) {
      onUpdate(item.itemId, { 
        content: articleContent,
        contentType: 'article'
      });
    }
    setShowEditor(false);
  };

  const handleClose = () => {
    if (!item.content && onCancel) {
      // If no content saved yet, cancel and go back
      onCancel();
    } else {
      // Just close the editor
      setArticleContent(item.content || "");
      setShowEditor(false);
    }
  };

  const handleEdit = () => {
    setShowEditor(true);
  };

  const handleReplaceContentType = () => {
    if (onUpdate) {
      onUpdate(item.itemId, { 
        content: null,
        contentType: null
      });
    }
    if (onCancel) {
      onCancel(true); // Pass true to show content type selector
    }
  };

  // Show editor form
  if (showEditor) {
    return (
      <Box 
        sx={{ 
          mb: 2,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          pt: 2,
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            Add Article
          </Typography>
          <Button
            size="small"
            onClick={handleClose}
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
        
        <TextEditor
          value={articleContent}
          onChange={setArticleContent}
          buttons={['bold', 'italic', 'underline', '|', 'ul', 'ol', '|', 'link', 'image', '|', 'source']}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!articleContent.trim()}
            sx={{
              bgcolor: "brand.main",
              color: "white",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              "&:hover": {
                bgcolor: "brand.dark",
              },
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    );
  }

  // Show article content display (similar to video uploaded display)
  return (
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
        {/* Article Preview Thumbnail */}
        <Box
          sx={{
            width: 150,
            height: 84,
            bgcolor: "background.paper",
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            flexShrink: 0,
            overflow: "hidden",
            position: "relative",
            p: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.65rem",
              lineHeight: 1.3,
              color: "text.secondary",
              display: "-webkit-box",
              WebkitLineClamp: 6,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              wordBreak: "break-word",
              "& *": {
                fontSize: "inherit !important",
                lineHeight: "inherit !important",
                margin: "0 !important",
                padding: "0 !important",
              }
            }}
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        </Box>

        {/* Article Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              mb: 1,
              wordBreak: "break-word",
              fontSize: "0.95rem",
            }}
          >
            Article
          </Typography>
          
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={handleEdit}
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
              startIcon={<VideoIcon />}
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
      </Box>
    </Box>
  );
}

export default ArticleContent;
