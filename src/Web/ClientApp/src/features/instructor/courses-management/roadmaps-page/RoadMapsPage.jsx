import { useState } from "react";
import { Row, Col } from "reactstrap";
import { Box, Button, Typography, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MainCard from "../../../../components/instructor-layout/MainCard";
import PageTitle from "../../../../components/PageTitle";
import RoadmapCard from "./RoadmapCard";

const mockRoadmaps = [
    { id: 1, title: "AWS Roadmap", visibility: "Public", topicCount: 14 },
    { id: 2, title: "React Roadmap", visibility: "Private", topicCount: 9 },
];


function RoadMapsPage() {
    const [roadmaps] = useState(mockRoadmaps);

    return (
        <MainCard>
            {/* Header row: title + create button */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                mb={2}
            >
                <PageTitle title="Your Roadmaps" />
                <Button
                    variant="contained"
                    disableElevation
                    startIcon={<AddIcon />}
                    sx={{
                        textTransform: "none",
                        backgroundColor: "brand.main",
                        fontSize: "15px",
                        fontWeight: 500,
                        px: 2.5,
                        py: 0.9,
                        whiteSpace: "nowrap",
                        "&:hover": {
                            backgroundColor: "brand.dark",
                        },
                    }}
                >
                    Create Roadmap
                </Button>
            </Box>

            <Row>
                <Col xs={12}>
                    <Box
                        sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            overflow: "hidden",
                            bgcolor: "background.paper",
                        }}
                    >
                        {roadmaps.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: "center" }}>
                                <Typography variant="h6" color="text.secondary">
                                    You don't have any roadmaps yet.
                                </Typography>
                            </Box>
                        ) : (
                            roadmaps.map((roadmap) => (
                                <RoadmapCard
                                    key={roadmap.id}
                                    roadmap={roadmap}
                                />
                            ))
                        )}
                    </Box>
                </Col>
            </Row>
        </MainCard>
    );
}

export default RoadMapsPage;
