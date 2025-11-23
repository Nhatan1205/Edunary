import { Col, Container, Row } from "reactstrap";
import PageTitle from "../../../../../components/PageTitle";
import { Avatar, Box, Button, Chip, TextField, Typography } from "@mui/material";
import { useState } from "react";
import TextEditor from "../../../../../components/TextEditor";
import useGetCoursesAuthor from "../../../../../hooks/useGetCoursesAuthor";
import CustomDataGrid from "../../../../../components/datagrid/CustomDataGrid";
import useDebounce from "../../../../../hooks/useDebounce";

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

function AnnouncementComposePage() {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const debouncedSearch = useDebounce(searchValue, 1000);
    const [pageNumber, setPageNumber] = useState(1);
    const { data: coursesData, isLoading: isCourseDataLoading } = useGetCoursesAuthor(debouncedSearch.length > 2 ?debouncedSearch : "" ,2,pageNumber,6);


    function handleInputChange(e){
        setSearchValue(e.target.value);
    };

    const handleSelectionChange = (newSelection) => {
        setSelectedCourses(newSelection);
    };

    const handlePaginationChange = ({ pageNumber }) => {
        setPageNumber(pageNumber);
    };

    return (
        <Container fluid className="py-4" style={{ paddingLeft: "240px", paddingRight: "240px" }}>
            <Row className="mb-4">
                <Col xs="12">
                    <PageTitle title="New Educational Announcement" />

                    <Box sx={{ mb: 4 }}>
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
                            sx={{ mb: 2 }}
                            value={searchValue}
                            onChange={handleInputChange}
                        />
                        <CustomDataGrid
                            rows={coursesData?.items || []}
                            columns={columnsSetting}
                            loading={isCourseDataLoading}
                            pageSize={6}
                            pageNumber={pageNumber}
                            totalCount={coursesData?.totalCount || 0}
                            checkboxSelection={true}
                            onSelectionChange={handleSelectionChange}
                            onPaginationChange={handlePaginationChange}
                            height={422}
                        />
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
                            fullWidth
                            placeholder="Announcement and email title (55 character max)"
                            variant="outlined"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            inputProps={{ maxLength: 55 }}
                        />
                        <Typography variant="caption" sx={{ color: '#666', mt: 0.5, display: 'block' }}>
                            This will be the subject of your email
                        </Typography>
                        </Box>

                        {/* Body Field */}
                        <Box sx={{ mb: 3 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                            Body
                        </Typography>

                        {/* Text Area */}
                        <TextEditor value={body} onChange={setBody} buttons={['bold','italic','underline','|','ul','ol']}/>

                        </Box>
                    </Box>

                    {/* Divider */}
                    <Box sx={{ borderTop: '1px solid #e0e0e0', my: 4 }} />

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button 
                        variant="outlined"
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
                            sx={{ 
                            textTransform: 'none',
                            backgroundColor: 'brand.main',
                            '&:hover': {
                                backgroundColor: 'brand.main'
                            }
                            }}
                        >
                            Send
                        </Button>
                        </Box>
                    </Box>


                </Col>
            </Row>
        </Container>
  )
}

export default AnnouncementComposePage;
