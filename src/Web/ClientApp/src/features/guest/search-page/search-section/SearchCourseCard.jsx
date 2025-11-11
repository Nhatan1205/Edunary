import { Star } from '@mui/icons-material';
import { Box, Card, CardContent, CardMedia, Typography } from '@mui/material';
import MetaChip from '../../../../components/MetaChip';

export default function SearchCourseCard({ course }) {

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #d1d7dc',
        borderRadius: '8px',
        boxShadow: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        padding: 2,
        height: 520,
        '&:hover': {
          backgroundColor: '#f7f9fa'
        }
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={course.image}
        alt={course.title}
        sx={{ objectFit: 'cover', borderRadius: '8px', mb: 2 }}
      />
      <CardContent
        sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',   // ✅ THÊM
            flexGrow: 1,
            p: 0,
            '&:last-child': { pb: 2 }
        }}
      >
        <div>
        <Typography
          variant="h6"
          component="h3"
          sx={{ 
            fontSize: '16px',
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
            fontSize: '13px',
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {course.description}
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
          {course.isBestseller && (
            <MetaChip
                label={"Bestseller"}
                backgroundColor={"#eceb98"}
                color={"#3d3c0a"}
                borderColor={"#eceb98"}
            />
          )}
          <MetaChip
                icon = {<Star sx={{ color: '#b4690e !important  ' }} />}
                label={course.rating}
            />
          <MetaChip
                label={course.ratingsCount}
            />
            <MetaChip
                label={course.level}
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
        </Box>
        </div>
      </CardContent>
    </Card>
  );
}
