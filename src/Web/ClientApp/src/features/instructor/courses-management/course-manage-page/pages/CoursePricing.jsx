import { Box, Button, InputAdornment, TextField, Typography, FormControlLabel, Checkbox } from "@mui/material";
import { useParams } from "react-router";
import { Container } from "reactstrap";
import useGetCourseById from "../../../../../hooks/course-hooks/useGetCourseById";
import { useForm } from "react-hook-form";
import useUpdateCoursePricing from "../../../../../hooks/course-hooks/useUpdateCoursePricing";
import LoadingSpinner from "../../../../../components/LoadingSpinner";
import PlatformCouponsCard from "../components/PlatformCouponsCard";
import AlertBox from "../../../../../components/AlertBox";
import { useState, useEffect } from "react";

function CoursePricing() {
  const { courseId } = useParams();
  const { data: courseData, isLoading: isCourseDataLoading } =
    useGetCourseById(courseId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm({
    values: courseData || {
      price: "",
    },
  });

  const updatePricingMutation = useUpdateCoursePricing();
  const isUpdating = updatePricingMutation.isPending || updatePricingMutation.isLoading;

  const [isFree, setIsFree] = useState(false);

  useEffect(() => {
    if (courseData) {
      setIsFree(courseData.price === 0);
    }
  }, [courseData]);

  const lastChanged = courseData?.lastPriceChangedAt;
  const daysSinceChange = lastChanged
    ? (Date.now() - new Date(lastChanged).getTime()) / (1000 * 60 * 60 * 24)
    : null;
  const isInCooldown = daysSinceChange !== null && daysSinceChange < 7;
  const daysRemaining = isInCooldown ? Math.ceil(7 - daysSinceChange) : 0;

  const handleCheckboxChange = (e) => {
    if (isInCooldown) return;
    const checked = e.target.checked;
    setIsFree(checked);
    if (checked) {
      setValue("price", 0, { shouldValidate: true });
      clearErrors("price");
    } else {
      if (courseData && courseData.price > 0) {
        setValue("price", courseData.price, { shouldValidate: true });
      } else {
        setValue("price", "");
      }
    }
  };

  const onSubmit = (data) => {
    if (isInCooldown) return;
    updatePricingMutation.mutate({
      courseId: parseInt(courseId),
      price: parseFloat(data.price),
    });
  };

  if (isCourseDataLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <LoadingSpinner />
      </div>
    );
  }

  const nextChangeDate = lastChanged
    ? new Date(new Date(lastChanged).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <Container className="py-4">
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Set a price for your course
      </Typography>
      <Typography variant="body2" sx={{ color: "text.primary", textAlign: "justify", mb: 3 }}>
        Please set your course price below. If you’d like to make your course free, remember that its total video content must be under 2 hours, and courses containing practice tests are not eligible for free enrollment.
      </Typography>

      {isInCooldown && (
        <AlertBox severity="warning" variant="outlined" sx={{ mb: 4 }}>
          You recently updated the course price. Due to our pricing policy, you can only change the price once every 7 days.
          You will be able to change the price again on <strong>{nextChangeDate}</strong> (about {daysRemaining} days remaining).
        </AlertBox>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
            Course Price
          </Typography>

          <Box className="mb-3">
            <FormControlLabel
              control={
                <Checkbox
                  checked={isFree}
                  onChange={handleCheckboxChange}
                  disabled={isInCooldown}
                  color="primary"
                />
              }
              label="Free course"
            />
          </Box>

          <TextField
            type="number"
            disabled={isFree || isInCooldown}
            {...register("price", {
              required: "Please enter a price",
              valueAsNumber: true,
              validate: {
                isNumber: (value) => !isNaN(value) || "Price must be a number",
                minPrice: (value) => value === 0 || value >= 9.99 || "Minimum price for paid course is $9.99",
                maxPrice: (value) => value === 0 || value <= 299.99 || "Maximum price for paid course is $299.99",
              },
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
              width: "220px",
              "& label.Mui-focused": {
                color: "brand.dark",
              },
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: isFree || isInCooldown ? "divider" : "brand.main",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "brand.main",
                  borderWidth: "3px",
                },
              },
            }}
          />
          {errors.price && (
            <AlertBox severity="error" variant="standard" sx={{ mt: 2, maxWidth: "450px" }}>
              {errors.price.message}
            </AlertBox>
          )}
        </Box>
        <Box>
          <Button
            variant="contained"
            type="submit"
            size="large"
            disabled={isUpdating || isInCooldown}
            sx={{
              width: "120px",
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
      <Box sx={{ mt: 4 }}>
        <PlatformCouponsCard courseData={courseData} disabled={isUpdating} />
      </Box>
    </Container>
  );
}

export default CoursePricing;