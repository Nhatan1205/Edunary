import { Container } from "reactstrap";
import { TextField, Typography } from "@mui/material";
function StepCourseTitle({ register, watch, errors }) {
  return (
    <Container className="py-5">
      <div className="text-center mb-4">
        <Typography
          variant="h2"
          sx={{
            fontWeight: "bold",
            mb: 2,
            color: "text.primary",
          }}
        >
          How about a working title?
        </Typography>
        <p className="text-muted">
          It's ok if you can't think of a good title now. You can change it
          later.
        </p>
      </div>

      <div className="mx-auto" style={{ maxWidth: "750px" }}>
        <TextField
          {...register("title", {
            required: "Please enter a course title",
            minLength: {
              value: 5,
              message: "Title must be at least 5 characters long",
            },
          })}
          fullWidth
          variant="outlined"
          placeholder="Enter your course title"
          error={!!errors.courseTitle}
          helperText={errors.title && errors.title.message}
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
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: "brand.main",
              },
              "&.Mui-focused fieldset": {
                borderColor: "brand.dark",
              },
            },
          }}
        />
      </div>
    </Container>
  );
}

export default StepCourseTitle;
