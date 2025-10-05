import { Typography } from "@mui/material";
import { Controller } from "react-hook-form";
import { Container, FormGroup, Input } from "reactstrap";

const categories = [
  "Technology",
  "Science",
  "Business",
  "Arts & Culture",
  "Health & Wellness",
  "Education",
  "Entertainment",
  "Sports",
  "Other",
];

function StepCourseCategory({ control, errors }) {
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
          What category best fits the knowledge you'll share?
        </Typography>
        <p className="text-muted">
          If you're not sure about the right category, you can change it later.
        </p>
      </div>

      <div className="mx-auto mt-5" style={{ maxWidth: "750px" }}>
        <FormGroup>
          <Controller
            name="category"
            control={control}
            rules={{ required: "Please select a category" }}
            render={({ field }) => (
              <Input
                type="select"
                id="category-select"
                {...field}
                style={{
                  borderColor: "#3FCCB2",
                  borderWidth: field.value ? "2px" : "1px",
                  color: "#212529",
                  textAlign: "left",
                  fontSize: "1rem",
                  padding: "12px",
                }}
                invalid={!!errors?.category}
              >
                <option value="">-- Choose a category --</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Input>
            )}
          />
        </FormGroup>
        {errors.category && (
          <Typography
            sx={{
              color: "#d32f2f",
              fontSize: "0.875rem",
              mt: "8px",
              textAlign: "left",
            }}
          >
            {errors.category.message}
          </Typography>
        )}
      </div>
    </Container>
  );
}

export default StepCourseCategory;
