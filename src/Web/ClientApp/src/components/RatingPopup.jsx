import React, { useState, useEffect } from 'react';
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
import { useUpsertRatingCourse, useGetRatingCourseByUser } from '../hooks/useRatingCourse';
import { formatTimeAgo } from '../utils/helpers';

const MAX_FEEDBACK = 500;

const RatingPopup = ({ open, onClose, courseId }) => {
  const [ratingValue, setRatingValue] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isEditing, setIsEditing] = useState();
  
  // Get existing rating if any
  const { data: existingRating } = useGetRatingCourseByUser(courseId);
  const { upsertRating, loading } = useUpsertRatingCourse();

  // Load existing rating when available
  useEffect(() => {
    if (existingRating?.id) {
      setRatingValue(existingRating.rating || 5);
      setFeedback(existingRating.review || '');
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, [existingRating, courseId]);

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

  const handleSaveButton = async (rating, review) => {
    if (!courseId) {
      console.error('Missing userId or courseId');
      return;
    }

    const result = await upsertRating({
      courseId: parseInt(courseId),
      rating,
      review
    });

    if (result.success) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      paper={{
        sx: {
          borderRadius: 3,
          padding: 2,
          maxWidth: '500px'
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

        {/* View Mode - Show existing rating */}
        {!isEditing && existingRating ? (
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Your Review
            </Typography>

            {/* Star Rating - Read only */}
            <Box my={2}>
              <Rating 
                name="course-rating-readonly" 
                value={ratingValue}
                readOnly
                size="large"
                sx={{
                  fontSize: '3rem'
                }}
              />
            </Box>

            {/* Review Text */}
            {feedback && (
              <Box 
                sx={{ 
                  width: '100%', 
                  p: 2, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 2,
                  mb: 2
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {feedback}
                </Typography>
              </Box>
            )}

            {/* Last updated time */}
            {existingRating?.lastModified && (
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                Last updated: {formatTimeAgo(existingRating.lastModified)}
              </Typography>
            )}

            {/* Action Buttons */}
            <Box display="flex" gap={2} mt={2}>
              <Button 
                variant="contained"
                onClick={() => setIsEditing(true)}
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
                Edit Review
              </Button>
            </Box>
          </Box>
        ) : (
          /* Edit Mode - Create or edit rating */
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Why did you leave this rating?
            </Typography>
            
            {/* dynamic label based on rating */}
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {currentLabel}
            </Typography>

            {/* Star Rating - Editable */}
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
              input={{
                maxLength: MAX_FEEDBACK,
                'aria-label': 'course-feedback'
              }}
              sx={{
                  fontSize: '0.9rem'
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

            {/* Footer Action Button */}
            <Box display="flex" justifyContent="flex-end" width="100%" mt={2}>
              <Button 
                variant="contained"
                onClick={() => handleSaveButton(ratingValue, feedback)}
                disabled={loading}
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
                {loading ? 'Saving...' : 'Save and Continue'}
              </Button>
            </Box>
          </Box>
        )}

      </DialogContent>
    </Dialog>
  );
};

export default RatingPopup;