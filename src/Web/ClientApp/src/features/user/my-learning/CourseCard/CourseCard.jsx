import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  LinearProgress, 
  Rating,
  Button,
} from '@mui/material'
import { Col } from 'reactstrap'
import DefaultImage from '../../../../assets/images/default.jpg'
import { Link as RouterLink } from "react-router";
import { useState } from 'react';
import RatingPopup from '../../../../components/RatingPopup';

const getRandomColor = (id) => {
  const colors = ['#ff6b81', '#74b9ff', '#6c5ce7', '#fd79a8', '#00cec9', '#fdcb6e', '#e17055', '#a29bfe'];
  return colors[id % colors.length];
};

function CourseCard({ course }) {
  const { id, title, instructorName, imageUrl, price, ratings } = course;
  const progress = Math.floor(Math.random() * 100);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <>
      <Col xs={12} sm={6} md={4} lg={3} className="mb-4">
        <Card
          component={RouterLink}
          to={`/course/${id}/learn`}
          sx={{
            width: "100%",
            height: "350px",
            position: "relative",
            borderRadius: 2,
            overflow: "hidden",
            cursor: "pointer",
            transition: "transform 0.2s ease-in-out",
            bgcolor: "background.default",
            boxShadow: "none",
            textDecoration: "none",
            "&:hover": {
              "& .MuiCardMedia-root": {
                filter: "brightness(0.5)",
              },
            },
          }}
        >
        <CardMedia
          component="img"
          height="160"
          image={imageUrl || DefaultImage}
          alt={title}
          sx={{
            objectFit: "cover",
            filter: "brightness(0.8)",
            borderRadius: 1,
            flexShrink: 0,
            transition: "filter 0.3s ease, transform 0.3s ease",
          }}
        >
          {/* <Box
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              bgcolor: "white",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Typography sx={{ fontSize: "18px", fontWeight: "bold" }}>⋯</Typography>
          </Box> */}
        </CardMedia>

        <CardContent sx={{ p: 2, height: "calc(100% - 160px)", display: "flex", flexDirection: "column" }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: "0.9rem",
              fontWeight: 600,
              lineHeight: 1.3,
              mb: 1,
              color: "#333",
              wordBreak: "break-word",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </Typography>
          
          <Typography
            variant="body2"
            sx={{
              color: "#666",
              fontSize: "0.8rem",
              mb: 1,
              whiteSpace: "nowrap",     
              overflow: "hidden",        
              textOverflow: "ellipsis",  
              display: "block",
            }}
          >
            {instructorName}
          </Typography>

          <Box sx={{ mt: "auto" }}>
            
            <Box sx={{ mb: 0.5 }}> 
              <Typography
                variant="body2"
                sx={{
                  color: "#333",
                  fontSize: "0.75rem",
                  mb: 0.5,
                  fontWeight: 500,
                }}
              >
                {progress}% complete
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#e0e0e0",
                  width: "100%",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: progress > 50 ? "#4CAF50" : "#ff9800",
                    borderRadius: 3,
                  },
                }}
              />
            </Box>

            <Box sx={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "flex-end",
                borderTop: "1px solid #f0f0f0",
                pt: 1 
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}>
              <Rating 
                name="read-only" 
                value={ratings || 0} 
                size="small" 
                readOnly
                sx={{ fontSize: "1.1rem", color: "#faaf00" }} 
              />
              <Button 
                variant="caption" 
                sx={{ 
                    fontSize: "0.75rem", 
                    color: "#666", 
                    mt: 0.2, 
                    cursor: "pointer",
                    "&:hover": { color: "#333", textDecoration: "underline" } 
                }}
                onClick={() => {
                  setIsPopupOpen(true);
                }}
              >
                Leave a rating
              </Button>
            </Box>

          </Box>
        </CardContent>
      </Card>
      
      <RatingPopup 
        open={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)}
        courseId={id}
      />
    </Col>
    </>
  );
};

export default CourseCard;
