import { InputAdornment, TextField, Typography } from "@mui/material";
import { Container } from "reactstrap";

function StepCoursePrice({ register, errors }) {
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
          How much do you want to charge for your course?
        </Typography>
        <p className="text-muted">You can always adjust the price later.</p>
      </div>

      <div className="mx-auto mt-5" style={{ maxWidth: "750px" }}>
        <TextField
          type="number"
          fullWidth
          variant="outlined"
          {...register("price", {
            required: "Please enter a price",
            validate: (value) => !isNaN(value) || "Price must be a number",
          })}
          placeholder="Price of the course"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
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
        {errors.price && (
          <Typography
            sx={{
              color: "#d32f2f",
              fontSize: "0.875rem",
              mt: "8px",
              textAlign: "left",
            }}
          >
            {errors.price.message}
          </Typography>
        )}
      </div>
    </Container>
  );
}

export default StepCoursePrice;
