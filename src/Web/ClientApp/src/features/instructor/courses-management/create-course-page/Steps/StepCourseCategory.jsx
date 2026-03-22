import { CircularProgress, Typography } from "@mui/material";
import { Controller } from "react-hook-form";
import { Container, FormGroup, Input } from "reactstrap";
import useGetCategories from "../../../../../hooks/category-hooks/useGetCategories";

function StepCourseCategory({ control, errors }) {
  const { data, isLoading } = useGetCategories(1, 20);
  if (isLoading) {
    return <CircularProgress size={24} sx={{ my: 2 }} />;
  }
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
            name="categoryId"
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
                invalid={!!errors?.categoryId}
              >
                <option value="">-- Choose a category --</option>
                {data?.items?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </Input>
            )}
          />
        </FormGroup>
        {errors.categoryId && (
          <Typography
            sx={{
              color: "#d32f2f",
              fontSize: "0.875rem",
              mt: "8px",
              textAlign: "left",
            }}
          >
            {errors.categoryId.message}
          </Typography>
        )}
      </div>
    </Container>
  );
}

export default StepCourseCategory;
