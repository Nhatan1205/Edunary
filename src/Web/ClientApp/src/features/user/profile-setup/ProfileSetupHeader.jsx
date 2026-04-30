import { Lightbulb } from "@mui/icons-material";
import { Link as RouterLink } from "react-router";
import { Box, Button, LinearProgress, Typography } from "@mui/material";
import { Row, Col } from "reactstrap";

export default function ProfileSetupHeader({ currentStep, totalSteps, onSaveExit, isSaving }) {
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
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                textDecoration: "none",
              }}
            >
              <Lightbulb
                sx={{
                  color: "brand.main",
                  width: 32,
                  height: 32,
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

            <Button
              onClick={onSaveExit}
              disabled={isSaving}
              sx={{
                color: "brand.main",
                textTransform: "none",
                fontSize: "15px",
                fontWeight: 700,
                padding: "8px 16px",
                border: "1.5px solid",
                borderColor: "brand.main",
                borderRadius: 2,
                minWidth: 120,
                "&:hover": {
                  backgroundColor: "background.muted",
                },
                "&.Mui-disabled": {
                  borderColor: "divider",
                  color: "text.disabled",
                },
              }}
            >
              {isSaving ? "Saving..." : "Save & Exit"}
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
