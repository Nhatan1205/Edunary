import { Controller, useForm } from "react-hook-form";
import { Row, Col, Container } from "reactstrap";
import defaultImage from "../../../../../assets/images/default.jpg";
import {
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Autocomplete,
  Chip,
} from "@mui/material";
import useGetCategories from "../../../../../hooks/category-hooks/useGetCategories";
import useGetCourseById from "../../../../../hooks/course-hooks/useGetCourseById";
import { useParams } from "react-router";
import LoadingSpinner from "../../../../../components/LoadingSpinner";
import useUpdateCourse from "../../../../../hooks/course-hooks/useUpdateCourse";
import useGetCourseTopics from "../../../../../hooks/course-topic-hooks/useGetCourseTopics";
import TextEditor from "../../../../../components/TextEditor";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import AlertBox from "../../../../../components/AlertBox";
import { getLevelLabel } from "../../../../../utils/helpers";
import useDebounce from "../../../../../hooks/common/useDebounce";

function CourseLandingPage() {
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [topicInput, setTopicInput] = useState("");
  const debouncedInput = useDebounce(topicInput, 400);

  const { courseId } = useParams();
  const { data: courseData, isLoading: isCourseDataLoading } = useGetCourseById(courseId);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      level: "",
      categoryId: "",
      topicIds: [],
      imageUrl: "",
    },
  });

  // Seed form + selectedTopics
  useEffect(() => {
    if (!courseData) return;
    reset({
      ...courseData,
      topicIds: (courseData.topics || []).map((t) => t.id),
    });
    setSelectedTopics(courseData.topics || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseData?.id]);

  const updatecourseMutation = useUpdateCourse();

  const { data: categoryData, isLoading: isCategoryDataLoading } = useGetCategories(1, 20);

  const { data: topicsData, isFetching: isTopicsFetching } = useGetCourseTopics(debouncedInput, 1, 20);

  // Options = selected objects + search results, deduplicated by id
  const topicOptions = Array.from(
    new Map([
      ...selectedTopics.map((t) => [t.id, t]),
      ...(topicsData?.items ?? []).map((t) => [t.id, t]),
    ]).values()
  );

  const isUpdating = updatecourseMutation.isPending || updatecourseMutation.isLoading;

  const onSubmit = (data) => {
    const updateData = { ...data };
    if (selectedImageUrl) updateData.imageUrl = selectedImageUrl;
    updatecourseMutation.mutate(updateData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.includes("image")) {
      toast.error("Only image files are allowed!");
      return;
    }
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      toast.error("Only JPG and PNG images are allowed!");
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (_event) => setSelectedImageUrl(reader.result.toString());
  };

  if (isCourseDataLoading || isCategoryDataLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Container className="py-2">
      <AlertBox severity="info" sx={{ py: 2, mb: 4 }}>
        Your course landing page is crucial to your success on Edunary. If
        it's done right, it can also help you gain visibility in search
        engines like Google. As you complete this section, think about
        creating a compelling Course Landing Page that demonstrates why
        someone would want to enroll in your course. Learn more about.
      </AlertBox>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Course Title */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
            Course Title
          </Typography>
          <TextField
            {...register("title", {
              required: "Course title is required",
              minLength: { value: 5, message: "Title must be at least 5 characters long" },
            })}
            fullWidth
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
                  <Typography variant="caption" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                    {watch("title")?.length || 0}/60
                  </Typography>
                ),
              },
            }}
            sx={{
              "& label.Mui-focused": { color: "brand.dark" },
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "brand.main" },
                "&.Mui-focused fieldset": { borderColor: "brand.main", borderWidth: "3px" },
              },
            }}
          />
        </Box>

        {/* Course Subtitle */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
            Course Subtitle
          </Typography>
          <TextField
            {...register("subtitle", {
              maxLength: { value: 120, message: "Maximum 120 characters allowed" },
            })}
            fullWidth
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
                  <Typography variant="caption" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                    {watch("subtitle")?.length || 0}/120
                  </Typography>
                ),
              },
            }}
            sx={{
              "& label.Mui-focused": { color: "brand.dark" },
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "brand.main" },
                "&.Mui-focused fieldset": { borderColor: "brand.main", borderWidth: "3px" },
              },
            }}
          />
        </Box>

        {/* Course Description */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
            Course Description
          </Typography>
          <Controller
            name="description"
            control={control}
            rules={{ minLength: { value: 200, message: "Minimum 200 characters required" } }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <TextEditor value={value} onChange={onChange} buttons={["bold", "italic", "underline", "|", "ul", "ol"]} />
                {error ? (
                  <Typography variant="caption" color="error">{error.message}</Typography>
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
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
          Basic Info
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
                      "& label.Mui-focused": { color: "brand.dark" },
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": { borderColor: "brand.main" },
                        "&.Mui-focused fieldset": { borderColor: "brand.main", borderWidth: "3px" },
                      },
                    }}
                  >
                    <InputLabel>Level</InputLabel>
                    <Select {...field} label="Level">
                      <MenuItem value="">-- Select Level --</MenuItem>
                      <MenuItem value={0}>{getLevelLabel(0)}</MenuItem>
                      <MenuItem value={1}>{getLevelLabel(1)}</MenuItem>
                      <MenuItem value={2}>{getLevelLabel(2)}</MenuItem>
                      <MenuItem value={3}>{getLevelLabel(3)}</MenuItem>
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
                      "& label.Mui-focused": { color: "brand.dark" },
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": { borderColor: "brand.main" },
                        "&.Mui-focused fieldset": { borderColor: "brand.main", borderWidth: "3px" },
                      },
                    }}
                  >
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      {categoryData?.items?.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>{cat.title}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Box>
          </Col>
        </Row>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
            What is primarily taught in your course?
          </Typography>
          <Controller
            name="topicIds"
            control={control}
            defaultValue={[]}
            render={({ field: { onChange } }) => (
              <Autocomplete
                multiple
                options={topicOptions}
                getOptionLabel={(opt) => opt.name}
                value={selectedTopics}
                inputValue={topicInput}
                onInputChange={(_, newInput, reason) => {
                  if (reason === "reset") return;
                  setTopicInput(newInput);
                }}
                onChange={(_, newValue) => {
                  setSelectedTopics(newValue);
                  onChange(newValue.map((t) => t.id));
                  setTopicInput("");
                }}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                filterSelectedOptions
                filterOptions={(opts) => opts}
                loading={isTopicsFetching}
                noOptionsText={
                  topicInput.length === 0 ? "Type to search topics..." : "No topics found"
                }
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={option.id}
                        label={option.name}
                        {...tagProps}
                        size="small"
                        sx={{
                          bgcolor: "brand.main",
                          color: "white",
                          fontWeight: 600,
                          "& .MuiChip-deleteIcon": {
                            color: "rgba(255,255,255,0.7)",
                            "&:hover": { color: "white" },
                          },
                        }}
                      />
                    );
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={selectedTopics.length === 0 ? "Search topics e.g. Python, Web Development..." : ""}
                    sx={{
                      "& label.Mui-focused": { color: "brand.dark" },
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": { borderColor: "brand.main" },
                        "&.Mui-focused fieldset": { borderColor: "brand.main", borderWidth: "3px" },
                      },
                    }}
                  />
                )}
                slotProps={{
                  paper: {
                    sx: {
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      boxShadow: 3,
                      "& .MuiAutocomplete-option": {
                        color: "text.primary",
                        "&[aria-selected='true']": { bgcolor: "brand.lighter", color: "brand.dark" },
                        '&[data-focus="true"]': { bgcolor: "background.alt" },
                        "&:hover": { bgcolor: "background.alt" },
                      },
                    },
                  },
                }}
              />
            )}
          />
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Select topics that describe what your course teaches. Helps students find your course.
          </Typography>
        </Box>

        {/* Course Image */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
            Course Image
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
                  sx={{ textAlign: "center", objectFit: "cover", height: 320, width: "100%" }}
                  src={selectedImageUrl || courseData.imageUrl || defaultImage}
                />
              </Paper>
            </Col>
            <Col md={6}>
              <AlertBox severity="info" sx={{ mb: 2, mt: 0 }}>
                Upload your course image here. It must meet our course image
                quality standards to be accepted. Important guidelines: 750x422
                pixels; .jpg, .jpeg, .gif, or .png. no text on the image.
              </AlertBox>
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
                  "&:hover": { borderColor: "brand.dark", color: "brand.dark" },
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
              "&:hover": { backgroundColor: "brand.dark" },
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
}

export default CourseLandingPage;
