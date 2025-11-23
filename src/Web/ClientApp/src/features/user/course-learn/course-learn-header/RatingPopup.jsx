import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Rating,
  TextField,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const MAX_FEEDBACK = 500;

const RatingPopup = ({ open, onClose }) => {
  const [ratingValue, setRatingValue] = useState(5);
  const [feedback, setFeedback] = useState('');

  // Label mapping for each star value
  const ratingLabels = {
    1: "Awful, not what I expected at all",
    2: "Poor, pretty disappointed",
    3: "Average, could be better",
    4: "Good, what I expected",
    5: "Amazing, above expectations!"
  };

  const currentLabel = ratingLabels[ratingValue] || '';

  const handleFeedbackChange = (e) => {
    const val = e.target.value.slice(0, MAX_FEEDBACK);
    setFeedback(val);
  };

  const remaining = MAX_FEEDBACK - feedback.length;
  const nearLimit = remaining <= 20;

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
              color: 'brand.main', 
              fontWeight: 'bold',
              fontSize: '0.8rem',
              minWidth: 0,
              padding: 0
            }}
          >
            Back
          </Button>
          <IconButton size="small" onClick={onClose} aria-label="close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Centered Text Content */}
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Why did you leave this rating?
          </Typography>
          
          {/* dynamic label based on rating */}
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {currentLabel}
          </Typography>

          {/* Star Rating */}
          <Box mt={1} mb={3}>
            <Rating 
              name="course-rating" 
              value={ratingValue}
              onChange={(event, newValue) => {
                setRatingValue(newValue ?? 0);
              }}
              size="large"
              sx={{
                fontSize: '3rem'
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
            onChange={handleFeedbackChange}
            inputProps={{
              maxLength: MAX_FEEDBACK,
              'aria-label': 'course-feedback'
            }}
            InputProps={{
              sx: {
                fontSize: '0.9rem'
              }
            }}
          />

          {/* Character counter / remaining */}
          <Box sx={{ width: '100%', mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Typography
              variant="caption"
              sx={{
                color: nearLimit ? 'error.main' : 'text.secondary',
                fontSize: '0.8rem'
              }}
            >
              {feedback.length}/{MAX_FEEDBACK}
            </Typography>
          </Box>
        </Box>

        {/* Footer Action Button */}
        <Box display="flex" justifyContent="flex-end" mt={1}>
          <Button 
            variant="contained"
            onClick={() => console.log("Saved:", { ratingValue, feedback })}
            sx={{
              backgroundColor: 'brand.main',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              padding: '10px 24px',
              '&:hover': {
                backgroundColor: 'brand.dark',
              },
            }}
          >
            Save and Continue
          </Button>
        </Box>

      </DialogContent>
    </Dialog>
  );
};

export default RatingPopup;