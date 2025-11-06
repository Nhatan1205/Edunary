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
import TextEditor from "../../../../../components/TextEditor";
import { toast } from "react-toastify";
import { useState } from "react";
function CourseLandingPage() {
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
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
      imageUrl: "",
    },
  });

  const updatecourseMutation = useUpdateCourse();

  const { data: categoryData, isLoading: isCategoryDataLoading } =
    useGetCategories(1, 20);

  const isUpdating = updatecourseMutation.isPending || updatecourseMutation.isLoading;

  const onSubmit = (data) => {
    const updateData = {
      ...data,
    };
    
    if (selectedImageUrl) {
      updateData.imageUrl = selectedImageUrl;
    }
    
    updatecourseMutation.mutate(updateData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const mimeType = file.type;
    if (!mimeType.includes("image")) {
      toast.error("Only image files are allowed!");
      return;
    }
    
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG and PNG images are allowed!");
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (_event) => {
      setSelectedImageUrl(reader.result.toString());
    };
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
          <Typography
            variant="subtitle1"
            sx={{ mb: 1, fontWeight: 500 }}
          >
            Course Description
          </Typography>

          <Controller
            name="description"
            control={control}
            rules={{
              minLength: {
                value: 200,
                message: "Minimum 200 characters required",
              },
            }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <TextEditor value={value} onChange={onChange} buttons={['bold','italic','|','ul','ol']}/>
                {error ? (
                  <Typography variant="caption" color="error">
                    {error.message}
                  </Typography>
                ) : (
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Description should have minimum 200 words.
                  </Typography>
                )}
              </>
            )}
          />
        </Box>

        {/* Basic Info */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: "semibold" }}>
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
        {/* Course Image */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "semibold" }}>
            Course image
          </Typography>
          <Row>
            <Col md={6}>
              <Paper
                variant="outlined"
                sx={{
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
                    height: 320,
                    width: "100%",
                  }}
                  src={selectedImageUrl || courseData.imageUrl || defaultImage}
                />
              </Paper>
            </Col>
            <Col md={6}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Upload your course image here. It must meet our course image
                quality standards to be accepted. Important guidelines: 750x422
                pixels; .jpg, .jpeg, .gif, or .png. no text on the image.
              </Typography>

              <input
                type="file"
                accept="image/*"
                id="upload-image"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                component="label"
                htmlFor="upload-image"
                fullWidth
                sx={{
                  borderColor: "brand.main",
                  border: "1px solid",
                  color: "brand.main",
                  backgroundColor: "background.default",
                  "&:hover": {
                    borderColor: "brand.dark",
                    color: "brand.dark",
                  },
                }}
              >
                Choose Image
              </Button>
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
              position: "relative",
            }}
            disabled={isCourseDataLoading || isCategoryDataLoading || isUpdating}
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
};

export default CourseLandingPage;
