import { useState } from "react";
import { Box, Typography, Collapse, Button, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import DOMPurify from "dompurify";
import AdminCurriculumItem from "./AdminCurriculumItem";

export default function AdminCurriculumSection({ section, sectionIndex, courseId, globalIndexStart }) {
  const [expanded, setExpanded] = useState(sectionIndex === 0);
  const [objectivesDialogOpen, setObjectivesDialogOpen] = useState(false);

  const itemCount = section.items?.length ?? 0;

  return (
    <Box sx={{ mb: 3 }}>
      {/* Section header - clean, flat, matching CurriculumComparison */}
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          p: 2,
          bgcolor: "grey.50",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          borderBottom: expanded ? "1px solid #E5E7EB" : "none",
          userSelect: "none",
        }}
      >
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <FolderIcon sx={{ color: "text.secondary" }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.tertiary" }}>
                SECTION #{sectionIndex + 1}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                {section.title}
              </Typography>
            </Box>
            {section.learningObjectives && (
              <Button
                variant="contained"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setObjectivesDialogOpen(true);
                }}
                sx={{
                  bgcolor: "brand.main",
                  color: "#FFFFFF",
                  textTransform: "none",
                  fontWeight: 600,
                  height: 24,
                  fontSize: "0.75rem",
                  borderRadius: "6px",
                  "&:hover": { bgcolor: "brand.dark" }
                }}
              >
                Objectives
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </Typography>
          <ExpandMoreIcon
            sx={{
              color: "text.secondary",
              transform: expanded ? "rotate(180deg)" : "none",
              transition: "transform 0.2s"
            }}
          />
        </Box>
      </Box>

      {/* Section items */}
      <Collapse in={expanded}>
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5, bgcolor: "#FAFAFA" }}>
          {(section.items ?? []).map((item, ii) => (
            <AdminCurriculumItem
              key={item.itemId ?? ii}
              item={item}
              globalIndex={globalIndexStart + ii}
              courseId={courseId}
            />
          ))}
          {itemCount === 0 && (
            <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic", p: 1 }}>
              No items in this section.
            </Typography>
          )}
        </Box>
      </Collapse>

      {/* Learning Objectives Dialog */}
      <Dialog
        open={objectivesDialogOpen}
        onClose={() => setObjectivesDialogOpen(false)}
        onClick={(e) => e.stopPropagation()}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
            border: "1px solid #E5E7EB",
            p: 0.5
          }
        }}
      >
        <Box sx={{ px: 3, pt: 3, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "brand.main", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Section {sectionIndex + 1}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mt: 0.5 }}>
              Learning Objectives
            </Typography>
          </Box>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setObjectivesDialogOpen(false);
            }}
            sx={{ color: "text.secondary", "&:hover": { bgcolor: "action.hover" } }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ px: 3, pb: 3, pt: 1.5 }}>
          <Box
            sx={{
              p: 2.5,
              bgcolor: "#F9FAFB",
              borderRadius: "12px",
              border: "1px solid #F3F4F6",
              "& ul": { pl: 3, m: 0 },
              "& li": { mb: 1, color: "text.secondary", fontSize: "0.9rem", lineHeight: 1.5 },
              "& p": { m: 0, color: "text.secondary", fontSize: "0.9rem", lineHeight: 1.6 }
            }}
          >
            <Box
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.learningObjectives || "") }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
