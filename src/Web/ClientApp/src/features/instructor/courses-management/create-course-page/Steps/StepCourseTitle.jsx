import { Container } from "reactstrap";
import { TextField, Typography } from "@mui/material";
const maxLength = 60;
function StepCourseTitle({ register, watch, errors }) {
  const title = watch("title", "");
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
          helperText={`${title.length}/${maxLength}`}
          slotProps={{
            formHelperText: {
              sx: { textAlign: "right" },
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: "brand.main",
              },
            },
          }}
        />
        {errors.title && (
          <Typography
            sx={{
              color: "#d32f2f",
              fontSize: "0.875rem",
              mt: "8px",
              textAlign: "left",
            }}
          >
            {errors.title.message}
          </Typography>
        )}
      </div>
    </Container>
  );
}

export default StepCourseTitle;
