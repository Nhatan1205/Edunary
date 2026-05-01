import { ArrowForward, CheckCircleOutline } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { Row, Col } from "reactstrap";

export default function ProfileSetupFooter({
    currentStep,
    totalSteps,
    onNext,
    onBack,
    disableNext,
}) {
    const isFirst = currentStep === 1;
    const isLast = currentStep === totalSteps;

    return (
        <Box
            component="footer"
            sx={{
                borderTop: "1px solid",
                borderColor: "divider",
                py: 3,
                bgcolor: "background.paper",
                position: "sticky",
                bottom: 0,
                zIndex: 10,
            }}
        >
            <Row className="m-0">
                <Col xs={12} className="px-4">
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "right",
                            gap: 2,
                        }}
                    >
                        {!isFirst ? (
                            <Button
                                onClick={onBack}
                                variant="outlined"
                                sx={{
                                    color: "text.secondary",
                                    borderColor: "divider",
                                    textTransform: "none",
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    padding: "10px 28px",
                                    borderRadius: 2,
                                    minWidth: 120,
                                    "&:hover": {
                                        borderColor: "text.secondary",
                                        backgroundColor: "background.muted",
                                    },
                                }}
                            >
                                ← Back
                            </Button>
                        ) : (
                            <Box sx={{ minWidth: 120 }} />
                        )}



                        <Button
                            onClick={onNext}
                            variant="contained"
                            disabled={disableNext}
                            endIcon={isLast ? <CheckCircleOutline /> : <ArrowForward />}
                            sx={{
                                backgroundColor: "brand.main",
                                color: "text.inverse",
                                textTransform: "none",
                                fontSize: "15px",
                                fontWeight: 700,
                                padding: "10px 28px",
                                borderRadius: 2,
                                minWidth: 120,
                                "&:hover": {
                                    backgroundColor: "brand.dark",
                                },
                                "&.Mui-disabled": {
                                    backgroundColor: "#d1d7dc",
                                    color: "white",
                                },
                            }}
                        >
                            {isLast ? "Finish" : "Next"}
                        </Button>
                    </Box>
                </Col>
            </Row>
        </Box>
    );
}
