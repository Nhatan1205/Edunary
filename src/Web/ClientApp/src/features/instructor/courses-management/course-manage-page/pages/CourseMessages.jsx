import { Box, Button, Typography } from "@mui/material";
import { Container } from "reactstrap";
import TextEditor from "../../../../../components/TextEditor";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router";
import useGetCourseById from "../../../../../hooks/useGetCourseById";
import LoadingSpinner from "../../../../../components/LoadingSpinner";
import useUpdateCourse from "../../../../../hooks/useUpdateCourse";

function CourseMessages() {

  const { courseId } = useParams();
  const { data: courseData, isLoading: isCourseDataLoading } =
    useGetCourseById(courseId);
  const {control,handleSubmit} = useForm({
    values: courseData || {
      welcomeMessage: "",
      congratulationsMessage: "",
    },
  });
  const updatecourseMutation = useUpdateCourse();
  const isUpdating = updatecourseMutation.isPending || updatecourseMutation.isLoading;

  const onSubmit = (data) => {
      const updateData = {
        ...courseData,
        welcomeMessage: data.welcomeMessage,
        congratulationsMessage: data.congratulationsMessage,
      };
      updatecourseMutation.mutate(updateData);
    };

  if (isCourseDataLoading) {
      return (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <LoadingSpinner />
        </div>
      );
    }

  return (
    <Container className="py-4">
      <form onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="body2" sx={{ color: "text.primary",textAlign: "justify",mb: 3 }}>
            Write messages to your students (optional) that will be sent automatically when they join or complete your course to encourage students to engage with course content. If you do not wish to send a welcome or congratulations message, leave the text box blank.
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
            Welcome Message
      </Typography>
       <Controller
            name="welcomeMessage"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <TextEditor value={value} onChange={onChange} />
                {error && (
                  <Typography variant="caption" color="error">
                    {error.message}
                  </Typography>
                )}
              </>
            )}
          />
       <Typography variant="subtitle1" sx={{ mt: 3,mb: 1, fontWeight: 700 }}>
            Congratulations Message
      </Typography>
        <Controller
            name="congratulationsMessage"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <TextEditor value={value} onChange={onChange} />
                {error && (
                  <Typography variant="caption" color="error">
                    {error.message}
                  </Typography>
                )}
              </>
            )}
          />
          <Box sx={{ mt: 10 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      type="submit"
                      size="large"
                      sx={{
                        bgcolor: "brand.main",
                        "&:hover": {
                          backgroundColor: "brand.dark",
                        },
                        position: "relative",
                      }}
                      disabled={isCourseDataLoading || isUpdating}
                    >
                      {isUpdating ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <LoadingSpinner size={24} />
                          <span>Saving...</span>
                        </Box>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </Box>
          </form>
    </Container>
  );
}

export default CourseMessages;
