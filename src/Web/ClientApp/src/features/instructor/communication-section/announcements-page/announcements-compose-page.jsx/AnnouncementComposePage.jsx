import { Col, Container, Row } from "reactstrap";
import PageTitle from "../../../../../components/PageTitle";
import { Avatar, Box, Button, Chip, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import TextEditor from "../../../../../components/TextEditor";
import useGetCoursesAuthor from "../../../../../hooks/course-hooks/useGetCoursesAuthor";
import CustomDataGrid from "../../../../../components/datagrid/CustomDataGrid";
import useDebounce from "../../../../../hooks/common/useDebounce";
import useCreateAnnouncement from "../../../../../hooks/announcement-hooks/useCreateAnnouncement";
import CustomPagination from "../../../../../components/pagination/CustomPagination";
import { toast } from "react-toastify";
import AlertBox from "../../../../../components/AlertBox";
import MainCard from "../../../../../components/instructor-layout/MainCard";
import NoData from "../../../../../components/NoData";
import emptyStateImg from "../../../../../assets/images/empty-courses.png";

const columnsSetting = [
    {
        field: 'imageUrl',
        headerName: 'Image',
        width: 100,
        renderCell: (params) => {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    {params.value ? (
                        <img
                            src={params.value}
                            alt={params.row.title}
                            style={{
                                width: '60px',
                                height: '40px',
                                objectFit: 'cover',
                                borderRadius: '4px'
                            }}
                        />
                    ) : (
                        <Avatar
                            variant="rounded"
                            sx={{
                                width: 60,
                                height: 40,
                                bgcolor: '#e0e0e0'
                            }}
                        />
                    )}
                </Box>
            );
        },
        sortable: false
    },
    {
        field: 'title',
        headerName: 'Title',
        width: 400,
        flex: 1
    },
    {
        field: 'price',
        headerName: 'Price',
        type: 'number',
        width: 120,
        valueFormatter: (value) => {
            if (value === 0) return 'Free';
            return `$${value}`;
        }
    },
    {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params) => {
            const statusMap = {
                0: { label: 'Draft', color: 'default' },
                1: { label: 'Published', color: 'success' },
                2: { label: 'Archived', color: 'warning' }
            };
            const status = statusMap[params.value] || { label: 'Unknown', color: 'default' };
            return <Chip label={status.label} color={status.color} size="small" />;
        }
    }
];

function CustomNoRowsOverlay() {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <NoData
                image={emptyStateImg}
                title="No courses found"
                description="You haven't created any courses yet, or no courses match your search."
                imageWidth={150}
            />
        </Box>
    );
}

function AnnouncementComposePage() {
    const [selectedCourses, setSelectedCourses] = useState({ type: "include", ids: {} });
    const [searchValue, setSearchValue] = useState("");
    const debouncedSearch = useDebounce(searchValue, 1000);
    const [pageNumber, setPageNumber] = useState(1);

    const { data: coursesData, isLoading: isCourseDataLoading } = useGetCoursesAuthor(
        debouncedSearch.length > 2 ? debouncedSearch : "",
        2,
        pageNumber,
        6
    );

    const { mutate: createAnnouncement, isPending } = useCreateAnnouncement();

    const { control, register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            subject: '',
            content: ''
        }
    });

    function handleInputChange(e) {
        setSearchValue(e.target.value);
    }

    const handleSelectionChange = (newSelection) => {
        setSelectedCourses(newSelection);
    };

    const handlePageChange = (event, value) => {
        setPageNumber(value);
    };

    const onSubmit = (data, status) => {
        let courseIds = [];
        if (selectedCourses.type === "include") {
            courseIds = Array.from(selectedCourses.ids).map(id => parseInt(id));
        }

        if (status === 1 && courseIds.length === 0) {
            toast.error("You must select at least one course before sending.")
            return;
        }

        const announcementData = {
            subject: data.subject,
            content: data.content,
            courseIds: courseIds,
            status: status
        };

        createAnnouncement(announcementData);
    };

    const handleSaveDraft = handleSubmit((data) => onSubmit(data, 0));
    const handleSend = handleSubmit((data) => onSubmit(data, 1));

    function handleDiscard() {
        reset();
        setSelectedCourses({ type: "include", ids: {} });
        setSearchValue("");
    };

    return (
        <MainCard>
            <Container fluid className="py-4" style={{ paddingLeft: "240px", paddingRight: "240px" }}>
                <Row className="mb-4">
                    <Col xs="12">
                        <PageTitle title="New Educational Announcement" />

                        <Box sx={{ my: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                Audience
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
                                Define who you want to send the announcement to. You can select courses and then filter learners by enrollment date, course progress, etc.
                            </Typography>
                        </Box>

                        {/* Course Section */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Courses
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="Search for courses"
                                variant="outlined"
                                value={searchValue}
                                onChange={handleInputChange}
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'brand.main' },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'brand.main' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: 'brand.main' },
                                }}
                            />
                            <CustomDataGrid
                                rows={coursesData?.items || []}
                                columns={columnsSetting}
                                loading={isCourseDataLoading}
                                checkboxSelection={true}
                                onSelectionChange={handleSelectionChange}
                                height={384}
                                slots={{ noRowsOverlay: CustomNoRowsOverlay }}
                                sx={{
                                    '& .MuiDataGrid-row.Mui-selected': {
                                        backgroundColor: 'grey.100',
                                        '&:hover': { backgroundColor: 'grey.200' },
                                    },
                                    '& .MuiCheckbox-root.Mui-checked': { color: 'success.main' },
                                    '& .MuiDataGrid-row.Mui-selected .MuiCheckbox-root': { color: 'success.main' },
                                }}
                            />
                            {coursesData && coursesData.totalPages > 1 && (
                                <div className="d-flex justify-content-center mt-4">
                                    <CustomPagination count={coursesData.totalPages} page={pageNumber} onChange={handlePageChange} />
                                </div>
                            )}
                        </Box>

                        {/* Divider */}
                        <Box sx={{ borderTop: '1px solid #e0e0e0', my: 4 }} />

                        {/* Content Section */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                    Content
                                </Typography>
                                <Button
                                    variant="outlined"
                                    sx={{
                                        textTransform: 'none',
                                        borderColor: 'brand.main',
                                        color: 'brand.main',
                                        '&:hover': {
                                            borderColor: 'brand.main',
                                            backgroundColor: 'rgba(124, 58, 237, 0.04)'
                                        }
                                    }}
                                >
                                    Preview ▼
                                </Button>
                            </Box>

                            {/* Subject Field */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                                    Subject
                                </Typography>

                                <TextField
                                    {...register("subject", {
                                        required: "Subject is required",
                                        maxLength: { value: 55, message: "Subject must be 55 characters or less" },
                                        minLength: { value: 5, message: "Subject must be at least 5 characters" },
                                    })}
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Announcement and email title (55 character max)"
                                    error={!!errors.subject}
                                    slotProps={{
                                        htmlInput: { maxLength: 55 }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'brand.main' },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'brand.main' },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': { color: 'brand.main' },
                                    }}
                                />

                                {errors.subject && (
                                    <AlertBox severity="error" variant="standard" sx={{ mt: 2 }}>
                                        {errors.subject.message}
                                    </AlertBox>
                                )}

                                <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
                                    This will be the subject of your email
                                </Typography>
                            </Box>
                            {/* Body Field */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                                    Body
                                </Typography>
                                <Controller
                                    name="content"
                                    control={control}
                                    rules={{
                                        required: "Content is required",
                                        minLength: {
                                            value: 20,
                                            message: "Minimum 20 characters required",
                                        },
                                    }}
                                    render={({ field }) => (
                                        <>
                                            <TextEditor
                                                value={field.value}
                                                onChange={field.onChange}
                                                buttons={['bold', 'italic', 'underline', '|', 'ul', 'ol']}
                                            />
                                            {errors.content && (
                                                <AlertBox severity="error" variant="standard" sx={{ mt: 2 }}>
                                                    {errors.content.message}
                                                </AlertBox>
                                            )}
                                        </>
                                    )}
                                />
                            </Box>
                        </Box>

                        {/* Divider */}
                        <Box sx={{ borderTop: '1px solid #e0e0e0', my: 4 }} />

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button
                                variant="outlined"
                                onClick={handleDiscard}
                                disabled={isPending}
                                sx={{
                                    textTransform: 'none',
                                    color: 'brand.main',
                                    borderColor: 'brand.main',
                                    '&:hover': {
                                        borderColor: 'brand.main',
                                        backgroundColor: 'rgba(124, 58, 237, 0.04)'
                                    }
                                }}
                            >
                                Discard
                            </Button>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleSaveDraft}
                                    disabled={isPending}
                                    sx={{
                                        textTransform: 'none',
                                        color: 'brand.main',
                                        borderColor: 'brand.main',
                                        '&:hover': {
                                            borderColor: 'brand.main',
                                            backgroundColor: 'rgba(124, 58, 237, 0.04)'
                                        }
                                    }}
                                >
                                    Save as draft
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSend}
                                    disabled={isPending}
                                    sx={{
                                        textTransform: 'none',
                                        backgroundColor: 'brand.main',
                                        '&:hover': {
                                            backgroundColor: 'brand.main'
                                        }
                                    }}
                                >
                                    {isPending ? 'Sending...' : 'Send'}
                                </Button>
                            </Box>
                        </Box>
                    </Col>
                </Row>
            </Container>
        </MainCard>
    );
}

export default AnnouncementComposePage;