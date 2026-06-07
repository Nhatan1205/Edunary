import { useState, useEffect } from "react";
import { InputAdornment, TextField, Typography, FormControlLabel, Checkbox } from "@mui/material";
import { Container } from "reactstrap";
import AlertBox from "../../../../../components/AlertBox";

function StepCoursePrice({ register, errors, watch, setValue, clearErrors }) {
  const currentPrice = watch("price");
  const [isFree, setIsFree] = useState(currentPrice === 0);

  useEffect(() => {
    if (isFree) {
      setValue("price", 0, { shouldValidate: true });
      clearErrors("price");
    }
  }, [isFree, setValue, clearErrors]);

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setIsFree(checked);
    if (!checked) {
      setValue("price", "");
    }
  };

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
        <div className="d-flex align-items-center mb-3">
          <FormControlLabel
            control={
              <Checkbox
                checked={isFree}
                onChange={handleCheckboxChange}
                color="primary"
              />
            }
            label="Free course"
          />
        </div>

        <TextField
          type="number"
          fullWidth
          variant="outlined"
          disabled={isFree}
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
