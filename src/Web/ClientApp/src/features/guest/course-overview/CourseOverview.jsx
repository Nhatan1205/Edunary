import { useState } from "react"
import {
    Container,
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Rating,
    Avatar,
    Tabs,
    Tab,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    IconButton,
} from "@mui/material"
import { PlayArrow, FavoriteBorder, Schedule, Language, MenuBook, VideoLibrary } from "@mui/icons-material"

const CourseOverview = () => {
    const [activeTab, setActiveTab] = useState(0)

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue)
    }

    const courseData = {
        category: "Development / Mobile Engineer",
        title: "Make Uber Clone App",
        instructor: "Steven Arnatovic",
        rating: 4.8,
        totalRatings: 1812,
        originalPrice: 30.13,
        currentPrice: 22.4,
        discount: 20,
        sections: 22,
        lectures: 152,
        duration: "21h 33m",
        language: "English",
        description: `Vue (pronounced /vjuː/, like view) is a progressive framework for building user interfaces. Unlike other monolithic frameworks, Vue is designed from the ground up to be incrementally adoptable. The core library is focused on the view layer only, and is easy to pick up and integrate with other libraries or existing projects. On the other hand, Vue is also perfectly capable of powering sophisticated Single-Page Applications when used in combination with modern tooling and supporting libraries.`,
        heroImage:
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%7B833FDB09-1EC2-4328-BF98-71403B47802A%7D-DZd8e7idiBWz1gULL3aPpdzEywHdKL.png",
    }

    const reviews = [
        {
            name: "Leonardo Da Vinci",
            avatar: "/api/placeholder/40/40",
            review: "Loved the course. I've learned some very subtle techniques, especially on leaves.",
        },
        {
            name: "Titania S",
            avatar: "/api/placeholder/40/40",
            review:
                "I loved the course, it had been a long time since I had experimented with watercolors and now I will do it more often thanks to Kitani Studio.",
        },
        {
            name: "Zhirkox",
            avatar: "/api/placeholder/40/40",
            review:
                "Yes I just emphasize that the use of Photoshop, for non-users, becomes difficult to follow. What requires a course to master it. Safe and very didactic teacher.",
        },
        {
            name: "Mipnaska",
            avatar: "/api/placeholder/40/40",
            review:
                "I haven't finished the course yet, as I would like to have some feedback from the teacher, about the comments I posted on the forum 3 months ago, and I still haven't had any answer. I think the course is well structured, however the explanations and videos are very quick for beginners. However, it is good to go practicing.",
        },
    ]

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Course Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {courseData.category}
                </Typography>
                <Typography variant="h3" component="h1" sx={{ fontWeight: "bold", mb: 2 }}>
                    {courseData.title}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                    <Typography variant="body1" color="#3dcbb1" sx={{ fontWeight: "medium" }}>
                        {courseData.instructor}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Rating value={courseData.rating} precision={0.1} size="small" readOnly />
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                            {courseData.rating}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            ({courseData.totalRatings.toLocaleString()} ratings)
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ display: "flex", gap: 4, mb: 4 }}>
                {/* Left Content */}
                <Box sx={{ flex: 1 }}>
                    {/* Hero Video/Image */}
                    <Card sx={{ mb: 3, position: "relative" }}>
                        <CardMedia
                            component="img"
                            height="300"
                            image={courseData.heroImage}
                            alt={courseData.title}
                            sx={{ objectFit: "cover" }}
                        />
                        <Box
                            sx={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            <IconButton
                                sx={{
                                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
                                    width: 64,
                                    height: 64,
                                }}
                            >
                                <PlayArrow sx={{ fontSize: 32, color: "#3dcbb1" }} />
                            </IconButton>
                        </Box>
                    </Card>
                </Box>

                {/* Right Sidebar */}
                <Box sx={{ width: 320 }}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        {/* Pricing */}
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                                    US${courseData.currentPrice}
                                </Typography>
                                <Typography variant="body1" sx={{ textDecoration: "line-through", color: "text.secondary" }}>
                                    ${courseData.originalPrice}
                                </Typography>
                            </Box>
                            <Chip
                                label={`${courseData.discount}% OFF`}
                                sx={{
                                    backgroundColor: "#3dcbb1",
                                    color: "white",
                                    fontWeight: "bold",
                                    mb: 2,
                                }}
                            />
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ mb: 3 }}>
                            <Button
                                variant="contained"
                                fullWidth
                                sx={{
                                    backgroundColor: "#3dcbb1",
                                    "&:hover": { backgroundColor: "#2db89e" },
                                    py: 1.5,
                                    mb: 2,
                                    fontWeight: "bold",
                                }}
                            >
                                Buy
                            </Button>
                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<FavoriteBorder />}
                                sx={{
                                    borderColor: "#3dcbb1",
                                    color: "#3dcbb1",
                                    "&:hover": { borderColor: "#2db89e", backgroundColor: "rgba(61, 203, 177, 0.04)" },
                                }}
                            >
                                Wishlist
                            </Button>
                        </Box>

                        {/* Course Details */}
                        <List dense>
                            <ListItem sx={{ px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <MenuBook sx={{ color: "text.secondary" }} />
                                </ListItemIcon>
                                <ListItemText primary={`${courseData.sections} Section`} />
                            </ListItem>
                            <ListItem sx={{ px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <VideoLibrary sx={{ color: "text.secondary" }} />
                                </ListItemIcon>
                                <ListItemText primary={`${courseData.lectures} Lectures`} />
                            </ListItem>
                            <ListItem sx={{ px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <Schedule sx={{ color: "text.secondary" }} />
                                </ListItemIcon>
                                <ListItemText primary={`${courseData.duration} total lengths`} />
                            </ListItem>
                            <ListItem sx={{ px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <Language sx={{ color: "text.secondary" }} />
                                </ListItemIcon>
                                <ListItemText primary={courseData.language} />
                            </ListItem>
                        </List>
                    </Paper>

                    {/* Additional Course Promotion */}
                    <Card sx={{ background: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)", color: "white" }}>
                        <CardContent>
                            <Chip label="WEBINAR" size="small" sx={{ backgroundColor: "#3dcbb1", color: "white", mb: 1 }} />
                            <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                                Ana Kursova
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                                Masterclass in Design Thinking, Innovation & Creativity
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{
                                    borderColor: "white",
                                    color: "white",
                                    "&:hover": { borderColor: "#3dcbb1", backgroundColor: "rgba(61, 203, 177, 0.1)" },
                                }}
                            >
                                Learn More
                            </Button>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* Tabs Section */}
            <Box sx={{ mb: 4 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    sx={{
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: "medium",
                            fontSize: "1rem",
                        },
                        "& .Mui-selected": {
                            color: "#3dcbb1 !important",
                        },
                        "& .MuiTabs-indicator": {
                            backgroundColor: "#3dcbb1",
                        },
                    }}
                >
                    <Tab label="Description" />
                    <Tab label="Courses" />
                    <Tab label="Review" />
                </Tabs>
                <Divider sx={{ mt: 2 }} />
            </Box>

            {/* Tab Content */}
            <Box>
                {activeTab === 0 && (
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                            About Course
                        </Typography>
                        <Typography variant="body1" sx={{ lineHeight: 1.7, color: "text.secondary" }}>
                            {courseData.description}
                        </Typography>
                    </Box>
                )}

                {activeTab === 1 && (
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                            Course Content
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Course curriculum will be displayed here.
                        </Typography>
                    </Box>
                )}

                {activeTab === 2 && (
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
                            Review
                        </Typography>
                        <Box sx={{ mb: 3 }}>
                            {reviews.map((review, index) => (
                                <Box key={index} sx={{ mb: 3 }}>
                                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                                        <Avatar src={review.avatar} sx={{ width: 40, height: 40, backgroundColor: "#3dcbb1" }}>
                                            {review.name.charAt(0)}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                                                {review.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                                {review.review}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    {index < reviews.length - 1 && <Divider sx={{ mt: 2 }} />}
                                </Box>
                            ))}
                        </Box>
                        <Box sx={{ textAlign: "center" }}>
                            <Button
                                variant="outlined"
                                sx={{
                                    borderColor: "#3dcbb1",
                                    color: "#3dcbb1",
                                    "&:hover": { borderColor: "#2db89e", backgroundColor: "rgba(61, 203, 177, 0.04)" },
                                }}
                            >
                                Load more review
                            </Button>
                        </Box>
                    </Box>
                )}
            </Box>
        </Container>
    )
}

export default CourseOverview
