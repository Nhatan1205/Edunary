import { Box, Button, Typography } from "@mui/material";
import { Container } from "reactstrap";
import TextList from "../../../../../components/text-list/TextList";
import { useParams } from "react-router";
import useGetCourseById from "../../../../../hooks/useGetCourseById";
import LoadingSpinner from "../../../../../components/LoadingSpinner";
import useUpdateCourse from "../../../../../hooks/useUpdateCourse";
import { Controller, useForm } from "react-hook-form";

function CourseIntenedLearners() {
    const { courseId } = useParams();
    const { data: courseData, isLoading: isCourseDataLoading } =
      useGetCourseById(courseId);
    const updatecourseMutation = useUpdateCourse();
    const isUpdating = updatecourseMutation.isPending || updatecourseMutation.isLoading;

    const { control, handleSubmit} = useForm({
      values: courseData || {
        learningObjectives: [],
        requirements: [],
        targetAudience: []
      },
    });


    const onSubmit = (data) => {
      const updateData = {
        ...courseData,
        learningObjectives: data.learningObjectives,
        requirements: data.requirements,
        targetAudience: data.targetAudience,
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
        <Typography variant="body2" sx={{ color: "text.primary", textAlign: "justify", mb: 4 }}>
          The following descriptions will be publicly visible on your Course Landing Page and will have a direct impact on your course performance. These descriptions will help learners decide if your course is right for them.
        </Typography>
        {/* learning Objectives */}
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
          What will students learn in your course?
        </Typography>
        <Typography variant="body2" sx={{ color: "text.primary", textAlign: "justify", mb: 3 }}>
          You must enter at least 4 learning objectives or outcomes that learners can expect to achieve after completing your course.
        </Typography>
         <Controller
          name="learningObjectives"
          control={control}
          rules={{
            validate: (value) => {
              if (!value || value.length < 4) {
                return "At least 4 learning objectives are required";
              }
              const allFilled = value.every((text) => text.trim() !== "");
              if (!allFilled) {
                return "All learning objectives must be filled";
              }
              return true;
            },
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <TextList
                items={value || []}
                onChange={onChange}
                minLength={4}
              />
              {error && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                  {error.message}
                </Typography>
              )}
            </>
          )}
        />
        {/* requirements */}
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
          What are the requirements or prerequisites for taking your course?
        </Typography>
        <Typography variant="body2" sx={{ color: "text.primary", textAlign: "justify", mb: 3 }}>
          List the required skills, experience, tools or equipment learners should have prior to taking your course.
If there are no requirements, use this space as an opportunity to lower the barrier for beginners.
        </Typography>
        <Controller
          name="requirements"
          control={control}
          rules={{
            validate: (value) => {
              if (!value || value.length < 2) {
                return "At least 2 requirements are required";
              }
              const allFilled = value.every((text) => text.trim() !== "");
              if (!allFilled) {
                return "All requirements must be filled";
              }
              return true;
            },
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <TextList
                items={value || []}
                onChange={onChange}
                minLength={2}
              />
              {error && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                  {error.message}
                </Typography>
              )}
            </>
          )}
        />
                {/* Target audience */}
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
          Who is this course for?
        </Typography>
        <Typography variant="body2" sx={{ color: "text.primary", textAlign: "justify", mb: 3 }}>
          Write a clear description of the intended learners for your course who will find your course content valuable. This will help you attract the right learners to your course
        </Typography>
        <Controller
          name="targetAudience"
          control={control}
          rules={{
            validate: (value) => {
              if (!value || value.length < 1) {
                return "At least 1 target audience are required";
              }
              const allFilled = value.every((text) => text.trim() !== "");
              if (!allFilled) {
                return "All target audiences must be filled";
              }
              return true;
            },
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <TextList
                items={value || []}
                onChange={onChange}
                minLength={1}
              />
              {error && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
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

export default CourseIntenedLearners;