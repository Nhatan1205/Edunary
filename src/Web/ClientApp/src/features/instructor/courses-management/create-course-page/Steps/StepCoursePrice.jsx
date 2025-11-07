import { InputAdornment, TextField, Typography } from "@mui/material";
import { Container } from "reactstrap";
import AlertBox from "../../../../../components/AlertBox";

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
            <AlertBox severity="error" variant="standard" sx={{ mt: 2 }}>
            {errors.price.message}
          </AlertBox>
        )}
      </div>
    </Container>
  );
}

export default StepCoursePrice;
