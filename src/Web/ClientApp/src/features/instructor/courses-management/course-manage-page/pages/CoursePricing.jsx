import { Box, Button, InputAdornment, TextField, Typography } from "@mui/material";
import { useParams } from "react-router";
import { Container } from "reactstrap";
import useGetCourseById from "../../../../../hooks/useGetCourseById";
import { useForm } from "react-hook-form";
import useUpdateCourse from "../../../../../hooks/useUpdateCourse";
import LoadingSpinner from "../../../../../components/LoadingSpinner";

function CoursePricing() {
  const { courseId } = useParams();
  console.log(courseId);
  const { data: courseData, isLoading: isCourseDataLoading } =
      useGetCourseById(courseId);
  const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm({
      values: courseData || {
        price: "",
      },
    });
    const updatecourseMutation = useUpdateCourse();

  const onSubmit = (data) => {
    updatecourseMutation.mutate({
      ...data,
    });
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
    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Set a price for your course
    </Typography>
    <Typography variant="body2" sx={{ color: "text.primary",textAlign: "justify",mb: 3 }}>
          Please set your course price below. If you’d like to make your course free, remember that its total video content must be under 2 hours, and courses containing practice tests are not eligible for free enrollment.
    </Typography>
    <form onSubmit={handleSubmit(onSubmit)}>
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
            Course Price
    </Typography>
          <TextField
          type="number"
            {...register("price", {
              required: "Please enter a price",
              validate: (value) => !isNaN(value) || "Price must be a number",
            })}
            placeholder="Price of the course"
            error={!!errors.price}
            slotProps={{
              htmlInput: { maxLength: 60 },
              input: {
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              },
            }}
            sx={{
              width: "200px",
              "& label.Mui-focused": {
                color: "brand.dark",
              },
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "brand.main",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "brand.main",
                  borderWidth: "3px",
                },
              },
            }}
          />
        </Box>
        <Box>
                  <Button
                    variant="contained"
                    type="submit"
                    size="large"
                    sx={{
                      width: "100px",
                      bgcolor: "brand.main",
                      "&:hover": {
                        backgroundColor: "brand.dark",
                      },
                    }}
                  >
                    Save
                  </Button>
          </Box>
      </form>
  </Container>
  );
}

export default CoursePricing;