import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Rating,
  TextField,
  Button,
  styled
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Custom styled button to match the specific purple in the image
const PurpleButton = styled(Button)({
  backgroundColor: '#6200EA', // Deep purple color
  color: '#fff',
  textTransform: 'none',
  fontWeight: 600,
  padding: '10px 24px',
  '&:hover': {
    backgroundColor: '#4500b5',
  },
});

const RatingPopup = ({ open, onClose }) => {
  const [ratingValue, setRatingValue] = useState(5);
  const [feedback, setFeedback] = useState('');

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3, // Rounded corners like the image
          padding: 2,
          maxWidth: '500px' // Constrain width slightly
        }
      }}
    >
      <DialogContent>
        {/* Header Row: Back button and Close Icon */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Button 
            onClick={onClose}
            sx={{ 
              textTransform: 'none', 
              color: '#6200EA', 
              fontWeight: 'bold',
              fontSize: '0.8rem',
              minWidth: 0,
              padding: 0
            }}
          >
            Back
          </Button>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Centered Text Content */}
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Why did you leave this rating?
          </Typography>
          
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Amazing, above expectations!
          </Typography>

          {/* Star Rating */}
          <Box mt={1} mb={3}>
            <Rating 
              name="course-rating" 
              value={ratingValue}
              onChange={(event, newValue) => {
                setRatingValue(newValue);
              }}
              size="large"
              sx={{
                fontSize: '3rem', // Make stars large like image
                color: '#FFA000'  // Gold color
              }}
            />
          </Box>

          {/* Text Area */}
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Tell us about your own personal experience taking this course. Was it a good match for you?"
            variant="outlined"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            InputProps={{
              sx: {
                fontSize: '0.9rem',
                color: '#555'
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#e0e0e0', // Light gray border
                },
              },
            }}
          />
        </Box>

        {/* Footer Action Button */}
        <Box display="flex" justifyContent="flex-end" mt={1}>
          <PurpleButton onClick={() => console.log("Saved:", { ratingValue, feedback })}>
            Save and Continue
          </PurpleButton>
        </Box>

      </DialogContent>
    </Dialog>
  );
};

export default RatingPopup;