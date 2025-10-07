import { Box, Button } from "@mui/material";
import { Row, Col } from "reactstrap";

export default function StepperFooter({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
}) {
  return (
    <footer className="border-t border-gray-200 py-4 flex justify-end">
      <Row className="m-0">
        <Col xs={12} className="px-4">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              onClick={onPrevious}
              disabled={currentStep === 1}
              variant="outlined"
              sx={{
                color: "brand.main",
                borderColor: "brand.main",
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 700,
                padding: "12px 24px",
                "&:hover": {
                  borderColor: "brand.dark",
                  backgroundColor: "background.muted",
                },
                "&.Mui-disabled": {
                  borderColor: "#d1d7dc",
                  color: "#d1d7dc",
                },
              }}
            >
              Previous
            </Button>

            <Button
              onClick={onNext}
              variant="contained"
              sx={{
                backgroundColor: "brand.main",
                color: "text.inverse",
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 700,
                padding: "12px 24px",
                "&:hover": {
                  backgroundColor: "brand.dark",
                },
                "&.Mui-disabled": {
                  backgroundColor: "#d1d7dc",
                  color: "#fff",
                },
              }}
            >
              {currentStep === 3 ? "Create Course" : "Continue"}
            </Button>
          </Box>
        </Col>
      </Row>
    </footer>
  );
}
