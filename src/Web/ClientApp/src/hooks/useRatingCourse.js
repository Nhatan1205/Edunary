import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { RatingCourseClient, UpsertRatingCourseCommand } from '../web-api-client.ts';

// Get RatingCourse by user_id and course_id
export const useGetRatingCourseByUser = (courseId, userId) => {
  return useQuery({
    queryKey: ['ratingCourse', courseId, userId],
    queryFn: async () => {
      const client = new RatingCourseClient();
      const result = await client.getRatingCourseByUser(courseId, userId);
      return result;
    },
    enabled: !!courseId && !!userId,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

// Add new or update RatingCourse by user
export const useUpsertRatingCourse = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ courseId, userId, rating, review }) => {
      const client = new RatingCourseClient();
      const command = new UpsertRatingCourseCommand({
        courseId,
        userId,
        rating,
        review
      });
      return await client.upsertRatingCourse(command);
    },
    onSuccess: (result, variables) => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['ratingCourse', variables.courseId, variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['ratingCourses', variables.courseId] });
      
      toast.success('Rating saved successfully');
    },
    onError: (err) => {
      console.error('Error saving rating:', err);
      
      // Extract error message from SwaggerException
      let errorMessage = 'Failed to save rating';
      if (err.response) {
        try {
          const errorData = JSON.parse(err.response);
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData && errorData.errors && errorData.errors.length > 0) {
            errorMessage = errorData.errors[0];
          }
        } catch (parseError) {
          if (typeof err.response === 'string') {
            errorMessage = err.response;
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    }
  });

  const upsertRating = async (data) => {
    try {
      await mutation.mutateAsync(data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    upsertRating,
    loading: mutation.isPending,
    error: mutation.error
  };
};
