import {
  Box,
  Typography,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
} from '@mui/material'
import { FavoriteBorder, Schedule, Language, MenuBook, VideoLibrary } from '@mui/icons-material'

const CourseSidebar = ({ courseData }) => {
  return (
    <Box sx={{ width: 320 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Pricing */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              US${courseData.currentPrice}
            </Typography>
            <Typography variant="body1" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
              ${courseData.originalPrice}
            </Typography>
          </Box>
          <Chip
            label={`${courseData.discount}% OFF`}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              fontWeight: 'bold',
              mb: 2,
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              py: 1.5,
              mb: 2,
              fontWeight: 'bold',
            }}
          >
            Buy
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<FavoriteBorder />}
            color="primary"
          >
            Wishlist
          </Button>
        </Box>

        {/* Course Details */}
        <List dense>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <MenuBook sx={{ color: 'text.secondary' }} />
            </ListItemIcon>
            <ListItemText primary={`${courseData.sections} Section`} />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <VideoLibrary sx={{ color: 'text.secondary' }} />
            </ListItemIcon>
            <ListItemText primary={`${courseData.lectures} Lectures`} />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Schedule sx={{ color: 'text.secondary' }} />
            </ListItemIcon>
            <ListItemText primary={`${courseData.duration} total length`} />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Language sx={{ color: 'text.secondary' }} />
            </ListItemIcon>
            <ListItemText primary={courseData.language} />
          </ListItem>
        </List>
      </Paper>
    </Box>
  )
}

export default CourseSidebar