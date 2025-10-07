import { Controller, useForm } from "react-hook-form";
import { Row, Col, Container } from "reactstrap";
import defaultImage from "../../../../../assets/images/default.jpg";
import {
  TextField,
  Button,
  Alert,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import useGetCategories from "../../../../../hooks/useGetCategories";
import useGetCourseById from "../../../../../hooks/useGetCourseById";

import { useParams } from "react-router";
import LoadingSpinner from "../../../../../components/LoadingSpinner";
import useUpdateCourse from "../../../../../hooks/useUpdateCourse";
const CourseLandingPage = () => {
  const { courseId } = useParams();
  const { data: courseData, isLoading: isCourseDataLoading } =
    useGetCourseById(courseId);
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    values: courseData || {
      title: "",
      subtitle: "",
      description: "",
      level: "",
      categoryId: "",
      topic: "",
    },
  });

  const updatecourseMutation = useUpdateCourse();

  const { data: categoryData, isLoading: isCategoryDataLoading } =
    useGetCategories(1, 20);

  const onSubmit = (data) => {
    updatecourseMutation.mutate({
      ...data,
    });
  };

  if (isCourseDataLoading || isCategoryDataLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Container className="py-4">
      <Alert
        severity="info"
        sx={{ mb: 3, py: 3, backgroundColor: "background.muted" }}
      >
        <Typography variant="body2" sx={{ mb: 1, color: "text.primary" }}>
          Your course landing page is crucial to your success on Edunary. If
          it's done right, it can also help you gain visibility in search
          engines like Google. As you complete this section, think about
          creating a compelling Course Landing Page that demonstrates why
          someone would want to enroll in your course. Learn more about.
        </Typography>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Course Title */}
        <Box sx={{ mb: 3 }}>
          <TextField
            {...register("title", {
              required: "Course title is required",
              minLength: {
                value: 5,
                message: "Title must be at least 5 characters long",
              },
            })}
            fullWidth
            label="Course title"
            placeholder="Enter your course title"
            error={!!errors.title}
            helperText={
              errors.title
                ? errors.title.message
                : "Your title should be a mix of attention-grabbing, informative, and optimized for search"
            }
            slotProps={{
              htmlInput: { maxLength: 60 },
              input: {
                endAdornment: (
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", whiteSpace: "nowrap" }}
                  >
                    {watch("title")?.length || 0}/60
                  </Typography>
                ),
              },
            }}
            sx={{
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
        {/* Course Subtitle */}
        <Box sx={{ mb: 3 }}>
          <TextField
            {...register("subtitle", {
              maxLength: {
                value: 120,
                message: "Maximum 120 characters allowed",
              },
            })}
            fullWidth
            label="Course subtitle"
            placeholder="Insert your course subtitle"
            error={!!errors.subtitle}
            helperText={
              errors.subtitle
                ? errors.subtitle.message
                : "Use 1 or 2 related keywords, and mention 3-4 of the most important areas that you've covered during your course."
            }
            slotProps={{
              htmlInput: { maxLength: 120 },
              input: {
                endAdornment: (
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", whiteSpace: "nowrap" }}
                  >
                    {watch("subtitle")?.length || 0}/120
                  </Typography>
                ),
              },
            }}
            sx={{
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
        {/* Course Description */}
        <Box sx={{ mb: 3 }}>
          <TextField
            {...register("description", {
              minLength: {
                value: 200,
                message: "Minimum 200 characters required",
              },
            })}
            fullWidth
            multiline
            rows={5}
            label="Course description"
            placeholder="Insert your course description."
            error={!!errors.description}
            helperText={
              errors.description
                ? errors.description.message
                : "Description should have minimum 200 words."
            }
            sx={{
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
        {/* Basic Info */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          Basic info
        </Typography>
        <Row>
          <Col md={6}>
            <Box sx={{ mb: 3 }}>
              <Controller
                name="level"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    sx={{
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
                  >
                    <InputLabel>Level</InputLabel>
                    <Select {...field} label="Level">
                      <MenuItem value="">-- Select Level --</MenuItem>
                      <MenuItem value={0}>Beginner</MenuItem>
                      <MenuItem value={1}>Intermediate</MenuItem>
                      <MenuItem value={2}>Advanced</MenuItem>
                      <MenuItem value={3}>All Levels</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Box>
          </Col>
          <Col md={6}>
            <Box sx={{ mb: 3 }}>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    sx={{
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
                  >
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      {categoryData?.items?.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Box>
          </Col>
        </Row>
        {/* Primary Taught */}
        <Box sx={{ mb: 3 }}>
          <TextField
            {...register("topic")}
            fullWidth
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                What is primarily taught in your course?
                <InfoOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
            }
            placeholder="e.g. Landscape Photography"
            sx={{
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
        {/* Course Image */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
            Course image
          </Typography>
          <Row>
            <Col md={5}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  minHeight: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "grey.50",
                }}
              >
                <Box
                  component="img"
                  sx={{
                    textAlign: "center",
                    objectFit: "cover",
                    height: 200,
                  }}
                  src={defaultImage}
                />
              </Paper>
            </Col>
            <Col md={7}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Upload your course image here. It must meet our course image
                quality standards to be accepted. Important guidelines: 750x422
                pixels; .jpg, .jpeg, .gif, or .png. no text on the image.
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                {/* <Controller
                  name="courseImage"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <>
                      <input
                        {...field}
                        id="courseImageInput"
                        type="file"
                        accept=".jpg,.jpeg,.gif,.png"
                        style={{ display: "none" }}
                        onChange={(e) => handleImageChange(e, onChange)}
                      />
                      <TextField
                        value={fileName}
                        fullWidth
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <Button
                        variant="contained"
                        startIcon={<FileUploadIcon />}
                        sx={{ whiteSpace: "nowrap", bgcolor: "brand.main" }}
                      >
                        Upload File
                      </Button>
                    </>
                  )}
                /> */}
              </Box>
            </Col>
          </Row>
        </Box>
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
            }}
          >
            Save
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default CourseLandingPage;
