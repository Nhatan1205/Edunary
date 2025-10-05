import { Lightbulb } from "@mui/icons-material";
import { Link as RouterLink } from "react-router";
import { Box, Button, LinearProgress, Typography } from "@mui/material";
import { Row, Col } from "reactstrap";
export default function StepperHeader({ currentStep, totalSteps }) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <>
      <Row className="m-0">
        <Col xs={12} className="p-0">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 24px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                component={RouterLink}
                to="/"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexGrow: 1,
                  mr: "8px",
                  textDecoration: "none",
                }}
              >
                <Lightbulb
                  sx={{
                    color: "brand.main",
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                  }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "brand.main",
                    ml: 1,
                  }}
                >
                  Edunary
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{
                  color: "text.primary",
                  fontSize: "16px",
                  fontWeight: 400,
                }}
              >
                Step {currentStep} of {totalSteps}
              </Typography>
            </Box>
            <Button
              sx={{
                color: "brand.main",
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 700,
                padding: "8px 16px",
                "&:hover": {
                  backgroundColor: "background.muted",
                },
              }}
            >
              Exit
            </Button>
          </Box>
        </Col>
      </Row>
      <Row className="m-0">
        <Col xs={12} className="p-0">
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 4,
              backgroundColor: "#e0e0e0",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "brand.main",
              },
            }}
          />
        </Col>
      </Row>
    </>
  );
}
