import { useState } from "react";
import { Row, Col } from "reactstrap";
import { Box, Button, Typography, CircularProgress, TextField, InputAdornment, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import MainCard from "../../../../components/instructor-layout/MainCard";
import PageTitle from "../../../../components/PageTitle";
import RoadmapCard from "./RoadmapCard";
import RoadmapMetadataDialog from "../roadmap-edit-page/roadmap-meta-dialog/RoadmapMetaDialog";
import useGetRoadmapsAuthor from "../../../../hooks/roadmap-hooks/useGetRoadmapsAuthor";
import CustomPagination from "../../../../components/pagination/CustomPagination";
import AlertBox from "../../../../components/AlertBox";
import NoData from "../../../../components/NoData";
import emptyRoadmapImg from "../../../../assets/images/empty-roadmap.png";

function RoadMapsPage() {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState("");
    const [searchText, setSearchText] = useState("");

    const { data, isLoading, isError } = useGetRoadmapsAuthor({
        searchText: searchText || null,
        pageNumber: page,
        pageSize: 6,
    });

    const roadmaps = data?.items ?? [];

    function handleSearch() {
        setPage(1);
        setSearchText(keyword.trim());
    }

    function handlePageChange(event, value) {
        setPage(value);
    }

    const handleCreateClose = () => {
        setCreateDialogOpen(false);
    };

    return (
        <MainCard>
            <PageTitle title="Your Roadmaps" />

            <AlertBox severity="info" sx={{ py: 2, my: 3, pr: 3, maxWidth: 700 }}>
                Roadmaps help your students visualize a structured learning journey toward a specific career path.
                By organizing your courses into a clear progression, you guide learners from beginner to expert —
                making it easier for them to discover the right career path and stay motivated every step of the way.
            </AlertBox>

            {/* Toolbar: search bar + create button */}
            <Box
                sx={{
                    mt: 2,
                    mb: 3,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                }}
            >
                {/* Search + icon */}
                <Box sx={{ display: "flex", gap: 1.5 }}>
                    <TextField
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                        size="small"
                        placeholder="Search your roadmaps..."
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: "#9ca3af" }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{
                            width: { xs: "100%", sm: "320px" },
                            bgcolor: "background.paper",
                            "& .MuiOutlinedInput-root": {
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "brand.main",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "brand.main",
                                },
                            },
                        }}
                    />
                    <IconButton
                        onClick={handleSearch}
                        size="medium"
                        sx={{
                            color: "text.inverse",
                            padding: "6px",
                            borderRadius: "4px",
                            backgroundColor: "brand.main",
                            "&:hover": { backgroundColor: "brand.dark" },
                        }}
                    >
                        <SearchIcon sx={{ fontSize: "24px" }} />
                    </IconButton>
                </Box>

                {/* Create button */}
                <Button
                    variant="contained"
                    disableElevation
                    startIcon={<AddIcon />}
                    onClick={() => setCreateDialogOpen(true)}
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

            {/* Roadmap list */}
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
                        {isLoading ? (
                            <div className="d-flex justify-content-center align-items-center my-5">
                                <CircularProgress size={32} sx={{ color: "brand.main" }} />
                            </div>
                        ) : isError ? (
                            <Box sx={{ p: 4, textAlign: "center" }}>
                                <Typography variant="body1" color="error">
                                    Failed to load roadmaps. Please try again.
                                </Typography>
                            </Box>
                        ) : roadmaps.length === 0 ? (
                            <NoData
                                image={emptyRoadmapImg}
                                title={searchText ? `No results found for "${searchText}"` : "No roadmaps yet"}
                                description={searchText
                                    ? "Try a different keyword or clear your search to see all your roadmaps."
                                    : "Start building a roadmap to guide your students through a structured learning journey toward their career goals."}
                            />
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

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <CustomPagination count={data.totalPages} page={page} onChange={handlePageChange} />
                </div>
            )}

            {/* Create Roadmap Dialog */}
            <RoadmapMetadataDialog
                open={createDialogOpen}
                onClose={handleCreateClose}
                mode="create"
            />
        </MainCard>
    );
}

export default RoadMapsPage;
