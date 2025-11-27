import React from "react";
import {
  Box,
  Typography,
  Grid,
  Chip,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Paper,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import StarIcon from "@mui/icons-material/Star";
import DOMPurify from "dompurify";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import useGetPublicCourseById from "../../../../hooks/useGetPublicCourseById";
import { formatMonthYear } from "../../../../utils/helpers";
import defaultAvatar from '../../../../assets/images/avatar.jpg';

function OverviewTab({ courseId }) {
  const { data: courseData, isLoading, isError } = useGetPublicCourseById(courseId);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !courseData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" sx={{ fontSize: "0.875rem" }}>
          Không thể tải thông tin khóa học.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ fontSize: "0.875rem" }}>
      <Box sx={{ mb: 3 }}>
        <Typography component="h2" sx={{ fontSize: "1.5rem", fontWeight: 700, mb: 1, color: "text.primary" }}>
          {courseData.title}
        </Typography>
        
        {courseData.subtitle && (
           <Typography sx={{ fontSize: "1rem", mb: 2, color: "text.secondary", fontWeight: 400 }}>
             {courseData.subtitle}
           </Typography>
        )}

        <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center" sx={{ gap: 1 }}>
          <Chip 
            label={courseData.categoryTitle} 
            size="small"
            sx={{ 
              bgcolor: "brand.light", 
              color: "brand.darker", 
              fontWeight: 600, 
              fontSize: "0.75rem",
              height: "24px"
            }} 
          />
          
          <Box sx={{ display: "flex", alignItems: "center", color: "warning.main" }}>
             <StarIcon sx={{ fontSize: "1rem", mr: 0.5 }} />
             <Typography sx={{ fontSize: "0.8rem", fontWeight: "bold" }}>{courseData.ratings || 0} rating</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
             <PeopleAltIcon sx={{ fontSize: "1rem", mr: 0.5 }} />
             <Typography sx={{ fontSize: "0.8rem" }}>{courseData.totalStudents} students</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", color: "text.secondary" }}>
            <AccessTimeIcon sx={{ fontSize: "1rem", mr: 0.5 }} />
            <Typography sx={{ fontSize: "0.8rem" }}>Last updated {formatMonthYear(courseData.lastModified)}</Typography>
          </Box>
        </Stack>
      </Box>

      {courseData.learningObjectives && courseData.learningObjectives.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.surface",
          }}
          >
          <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, mb: 2, color: "text.primary" }}>
              What you'll learn
          </Typography>
          <Grid container spacing={1}>
            {courseData.learningObjectives.map((item, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, ml: 0.5 }}>
                  <CheckCircleOutlineIcon
                    sx={{
                      color: "brand.main",
                      fontSize: "1rem",
                      flexShrink: 0,
                      mt: "2px",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      color: "text.primary",
                      lineHeight: 1.5,
                    }}
                  >
                    {item}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, mb: 1.5, color: "text.primary" }}>
          Description
        </Typography>
        <Box
          sx={{
            color: "text.primary",
            "& p": { lineHeight: 1.5, mb: 1.5 },
            "& ul, & ol": { pl: 3, mb: 1.5 },
            fontSize: "0.875rem",
          }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(courseData.description || "<p>No description available.</p>"),
          }}
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      {courseData.requirements && courseData.requirements.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, mb: 1.5, color: "text.primary" }}>
            Requirements
          </Typography>
          <List dense sx={{ py: 0 }}>
            {courseData.requirements.map((req, index) => (
              <ListItem key={index} alignItems="flex-start" sx={{ pl: 0, py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 24, mt: 0.8 }}>
                  <FiberManualRecordIcon sx={{ fontSize: 8, color: "text.secondary" }} />
                </ListItemIcon>
                <ListItemText 
                  primary={req} 
                  slotProps={{ 
                    primary: { fontSize: "0.875rem", color: "text.primary" } 
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

       {courseData.targetAudience && courseData.targetAudience.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, mb: 1.5, color: "text.primary" }}>
            Who this course is for
          </Typography>
          <Box component="ul" sx={{ py: 0 }}>
            {courseData.targetAudience.map((audience, index) => (
               <Typography
                key={index}
                component="li"
                variant="body1"
                sx={{ lineHeight: 1.7, mb: 1 }}
              >
                {audience}
              </Typography>
            ))}
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, mb: 2, color: "text.primary" }}>
          Instructor
        </Typography>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar 
            sx={{ width: 56, height: 56, bgcolor: "brand.main", fontSize: "1.25rem" }}
            src={courseData.instructorAvatar || defaultAvatar}
          >
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "brand.dark" }}>
               <Box component="span" sx={{ wordBreak: "break-word" }}>
                  {courseData.instructorName}
               </Box>
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", mb: 0.5 }}>
              Instructor
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "text.primary", whiteSpace: "pre-line" }}>
              Detailed bio about the instructor would go here. Experienced in teaching modern web development.
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

export default OverviewTab;