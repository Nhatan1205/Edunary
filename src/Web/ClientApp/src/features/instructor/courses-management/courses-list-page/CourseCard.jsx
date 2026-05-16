import { Card, CardContent, Typography, Box, Chip, Tooltip, IconButton } from "@mui/material";
import { Logout } from "@mui/icons-material";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router";
import DefaultImage from "../../../../assets/images/default.jpg";
import ConfirmDialog from "../../../../components/ConfirmDialogPopup/ConfirmDialog";
import useLeaveCollaboration from "../../../../hooks/course-collaborator-hooks/useLeaveCollaboration";
const CourseCard = ({ course }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isDraft = course.status === 0;
  const navigate = useNavigate();
  const [leaveOpen, setLeaveOpen] = useState(false);
  const leaveMutation = useLeaveCollaboration();

  function handleEdit() {
    navigate(`/instructor/course/${course.id}/manage`);
  }

  return (
    <>
      <Card
        onClick={handleEdit}
        variant="outlined"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          width: "100%",
          display: "flex",
          mb: 2,
          position: "relative",
          cursor: "pointer",
          borderColor: "divider",
        }}
      >
        <Box
          component="img"
          src={course.imageUrl || DefaultImage}
          alt={course.title}
          sx={{
            width: 140,
            height: 140,
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
        <CardContent
          sx={{
            flex: 1,
            py: 2,
            px: 3,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontSize: "1.1rem",
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              {course.title}
            </Typography>
            {course.isCollaborator && (
              <Chip label="Collaborator" size="small" color="primary" variant="outlined" />
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Typography
              sx={{
                fontWeight: isDraft ? 700 : 400,
                color: isDraft ? "text.primary" : "text.secondary",
                fontSize: "0.875rem",
              }}
            >
              DRAFT
            </Typography>
            <Typography
              sx={{
                fontWeight: !isDraft ? 700 : 400,
                color: !isDraft ? "text.primary" : "text.secondary",
                fontSize: "0.875rem",
              }}
            >
              Public
            </Typography>
          </Box>

          {/* Hover overlay */}
          {isHovered && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s ease",
              }}
            >
              <Typography
                component={RouterLink}
                to="/"
                sx={{
                  color: "brand.dark",
                  fontSize: "1rem",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                Edit / manage course
              </Typography>
            </Box>
          )}

          {/* Leave Course Button inside Hover Overlay */}
          {isHovered && course.isCollaborator && (
            <Tooltip title="Leave Course">
              <IconButton
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setLeaveOpen(true);
                }}
                sx={{ position: "absolute", top: 8, right: 8, zIndex: 10, backgroundColor: "rgba(255,255,255,0.9)", '&:hover': { backgroundColor: "white" } }}
              >
                <Logout />
              </IconButton>
            </Tooltip>
          )}
        </CardContent>
      </Card>

      {course.isCollaborator && (
        <ConfirmDialog
          open={leaveOpen}
          title="Leave Course"
          content={`Are you sure you want to leave the course "${course.title}"? You will lose access to manage it.`}
          onConfirm={(e) => {
            if (e && e.stopPropagation) e.stopPropagation();
            leaveMutation.mutate(course.id);
            setLeaveOpen(false);
          }}
          onClose={(e) => {
            if (e && e.stopPropagation) e.stopPropagation();
            setLeaveOpen(false);
          }}
          confirmText="Leave"
          cancelText="Cancel"
          isDanger={true}
        />
      )}
    </>
  );
};

export default CourseCard;
