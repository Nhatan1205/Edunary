import { Star } from '@mui/icons-material';
import { Box, Button, Card, CardContent, CardMedia, Typography, useMediaQuery, useTheme } from '@mui/material';
import DefaultImage from "../../../../assets/images/default.jpg";
import MetaChip from '../../../../components/MetaChip';
import { getLevelLabel } from '../../../../utils/helpers';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import { usePopover } from '../../../../context/PopoverContext';
import { useRef } from 'react';
import { getPopoverOrigin } from '../../../../utils/getPopoverOrigin';
import { Link as RouterLink } from "react-router";
import CoursePopoverMin from '../../../../components/course-popover/CoursePopoverMin';

export default function SearchCourseCard({ course }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const cardRef = useRef(null);
  const {
      anchorEl,
      isPopoverActive,
      handleMouseEnter,
      handleMouseLeave,
      handlePopoverMouseEnter,
      handlePopoverMouseLeave,
    } = usePopover();

  const isThisPopoverActive = isPopoverActive(course.id);
  const open = Boolean(anchorEl) && isThisPopoverActive;

  function onMouseEnter(event) {
    handleMouseEnter(course.id, cardRef.current || event.currentTarget);
  }

  const popoverOrigins = getPopoverOrigin(isMobile, cardRef);

  return (
    <>
    <Card
      component={RouterLink}
      to={`/course/${course.id}`}
      ref={cardRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #d1d7dc',
        borderRadius: '8px',
        boxShadow: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        padding: 2,
        height: 480,
        textDecoration: "none",
        '&:hover': {
          backgroundColor: '#f7f9fa'
        }
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={course.imageUrl || DefaultImage}
        alt={course.title}
        sx={{ objectFit: 'cover', borderRadius: '8px', mb: 2 }}
      />
      <CardContent
        sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexGrow: 1,
            padding: "0 !important",
        }}
      >
        <div>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontSize: '18px',
            fontWeight: 700,
            mb: 1,
            lineHeight: 1.4,
            color: 'text.primary',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: "2.6em",
          }}
        >
          {course.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#6a6f73',
            fontSize: '15px',
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {course.subtitle}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#6a6f73',
            fontSize: '12px',
            mb: 1.5
          }}
        >
          {course.instructor}
        </Typography>
        </div>

        <div>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1, flexWrap: 'wrap' }}>
          {course.totalStudents > 0 && (
            <MetaChip
                label={"Bestseller"}
                backgroundColor={"#eceb98"}
                color={"#3d3c0a"}
                borderColor={"#eceb98"}
            />
          )}
          <MetaChip
                icon = {<Star sx={{ color: '#b4690e !important  ' }} />}
                label={course.ratings}
            />
          <MetaChip
                icon = {<PeopleAltOutlinedIcon />}
                label={course.totalStudents}
            />
          <MetaChip
              label={getLevelLabel(course.level)}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '16px',
                color: '#1c1d1f'
              }}
            >
              ${course.price}
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlines"
              sx={{
                border: "2px solid",
                borderColor: "brand.main",
                fontWeight: "600",
                color: "brand.main",
                "&:hover": {
                  backgroundColor: "background.muted",
                },
              }}
            >
              Add to cart
            </Button>
          </Box>
        </Box>
        </div>
      </CardContent>
    </Card>
    <CoursePopoverMin
        open={open}
        anchorEl={anchorEl}
        course={course}
        onMouseEnter={handlePopoverMouseEnter}
        onMouseLeave={handlePopoverMouseLeave}
        anchorOrigin={popoverOrigins.anchorOrigin}
        transformOrigin={popoverOrigins.transformOrigin}
      />
    </>
  );
}
