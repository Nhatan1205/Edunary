import {
    Avatar,
    Box,
    Chip,
    Divider,
    IconButton,
    Tooltip,
    Typography,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import ProfileCourseCard from "./ProfileCourseCard";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockInstructor = {
    role: "INSTRUCTOR",
    name: "Nguyen Van A",
    tagline: "Creating opportunities for Data Science and Finance students",
    avatar: null,
    initials: "NVA",
    stats: {
        totalLearners: "3,802,574",
        totalReviews: "1,178,686",
    },
    bio: [
        "Nguyen Van A is the #1 best-selling provider of business, finance, data science and AI courses on Edunary. The courses have been taken by more than 3,700,000 students in 210 countries. People working at world-class firms like Apple, PayPal, and Citibank have completed these trainings.",
        "Currently, the focus is on the following topics: 1) Finance – Finance fundamentals, Financial modeling in Excel, Valuation, Accounting, Capital budgeting, Financial statement analysis (FSA), Investment banking (IB), Leveraged buyout (LBO), Financial planning and analysis (FP&A), Corporate budgeting, applying Python for Finance, Tesla valuation case study, CFA, ACCA, and CPA.",
        "2) Data science – Statistics, Mathematics, Probability, SQL, Python programming, Python for Finance, Business Intelligence, R, Machine Learning, TensorFlow, Tableau, and more structured content designed for modern learners.",
    ],
    social: {
        website: "https://example.com",
        facebook: "https://facebook.com",
        linkedin: "https://linkedin.com",
        youtube: "https://youtube.com",
    },
    courses: [
        {
            id: 1,
            title: "The Data Science Course: Complete Data Science Bootcamp 2026",
            subtitle: "Complete Data Science Training: Math, Statistics, Python,...",
            instructorName: "365 Careers",
            isBestseller: true,
            rating: "4.5",
            totalRatings: "160,119",
            totalHours: "32",
            lectures: "525",
            price: "₫539,000",
            originalPrice: "₫599,000",
            imageUrl: "https://img-c.udemycdn.com/course/240x135/1754098_e0df_3.jpg",
        },
        {
            id: 2,
            title: "The Complete Financial Analyst Course 2026",
            subtitle: "Excel, Accounting, Financial Statement Analysis, Business...",
            instructorName: "365 Careers",
            isBestseller: true,
            rating: "4.6",
            totalRatings: "102,080",
            totalHours: "22.5",
            lectures: "381",
            price: "₫319,000",
            originalPrice: "₫399,000",
            imageUrl: "https://img-c.udemycdn.com/course/240x135/648826_f0e5_4.jpg",
        },
        {
            id: 3,
            title: "The Project Management Course: Beginner to PROject Manager",
            subtitle: "The Complete Course For Becoming A Successful Projec...",
            instructorName: "365 Careers",
            isBestseller: true,
            rating: "4.6",
            totalRatings: "87,014",
            totalHours: "8",
            lectures: "109",
            price: "₫459,000",
            originalPrice: "₫579,000",
            imageUrl: "https://img-c.udemycdn.com/course/240x135/1208634_dce7_3.jpg",
        },
    ],
};

const CONTENT_MAX_WIDTH = "1200px";
const CONTENT_PX = { xs: 2, sm: 4, md: 6 };
const RIGHT_COL_WIDTH = 280;

function SocialButton({ icon, label, href }) {
    return (
        <Tooltip title={label}>
            <IconButton
                component="a"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                    border: "1.5px solid",
                    borderColor: "brand.main",
                    color: "brand.main",
                    width: 42,
                    height: 42,
                    "&:hover": {
                        backgroundColor: "brand.main",
                        color: "#fff",
                    },
                }}
            >
                {icon}
            </IconButton>
        </Tooltip>
    );
}

function StatItem({ value, label }) {
    return (
        <Box sx={{ mr: 5 }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: "text.primary", lineHeight: 1.2 }}>
                {value}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.tertiary" }}>
                {label}
            </Typography>
        </Box>
    );
}
function ProfilePage() {
    const { role, name, tagline, avatar, initials, stats, bio, social, courses } = mockInstructor;

    return (
        <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
            <Box sx={{ bgcolor: "background.muted", width: "100%" }}>
                <Box
                    sx={{
                        maxWidth: CONTENT_MAX_WIDTH,
                        mx: "auto",
                        px: CONTENT_PX,
                        py: { xs: 4, md: 5 },
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: `1fr ${RIGHT_COL_WIDTH}px` },
                        gap: 4,
                        alignItems: "start",
                    }}
                >
                    <Box>
                        <Typography
                            variant="overline"
                            sx={{ color: "brand.dark", fontWeight: 700, letterSpacing: 2, fontSize: "0.7rem" }}
                        >
                            {role}
                        </Typography>

                        <Typography variant="h3" sx={{ color: "text.primary", mt: 0.5, mb: 0.75 }}>
                            {name}
                        </Typography>

                        <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
                            {tagline}
                        </Typography>

                        {/* <Chip
                            label={"Edunary instructor"}
                            size="small"
                            sx={{
                                backgroundColor: "brand.lighter",
                                color: "brand.darker",
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                borderRadius: 1,
                            }}
                        /> */}
                    </Box>

                    <Box sx={{ display: { xs: "none", md: "block" } }} />
                </Box>
            </Box>

            <Box
                sx={{
                    maxWidth: CONTENT_MAX_WIDTH,
                    mx: "auto",
                    px: CONTENT_PX,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: `1fr ${RIGHT_COL_WIDTH}px` },
                    gap: 4,
                    alignItems: "start",
                }}
            >
                {/* Left side wrapper */}
                <Box>
                    <Box sx={{ display: "flex", mt: 4, flexWrap: "wrap" }}>
                        <StatItem value={stats.totalLearners} label="Total learners" />
                        <StatItem value={stats.totalReviews} label="Reviews" />
                    </Box>
                    {/* About me */}
                    <Box sx={{ py: { xs: 4, md: 5 } }}>
                        <Typography variant="h5" fontWeight={700} sx={{ color: "text.primary", mb: 2 }}>
                            About me
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {bio.map((paragraph, idx) => (
                                <Typography
                                    key={idx}
                                    variant="body1"
                                    sx={{ color: "text.secondary", lineHeight: 1.8 }}
                                >
                                    {paragraph}
                                </Typography>
                            ))}
                        </Box>
                    </Box>

                    {/* Courses list */}
                    <Box sx={{ pb: { xs: 4, md: 5 } }}>
                        <Typography variant="h5" fontWeight={700} sx={{ color: "text.primary", mb: 3 }}>
                            My courses ({courses.length})
                        </Typography>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                                gap: 3,
                            }}
                        >
                            {courses.map((course) => (
                                <ProfileCourseCard key={course.id} course={course} />
                            ))}
                        </Box>
                    </Box>
                </Box>

                {/* Right */}
                <Box
                    sx={{
                        mt: { md: "-140px" }, // pull card up into the banner area
                        display: { xs: "none", md: "block" },
                    }}
                >
                    <Box
                        sx={{
                            bgcolor: "background.paper",
                            borderRadius: 3,
                            boxShadow: "0 2px 16px rgba(0,0,0,0.1)",
                            p: 3,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            width: "100%",
                        }}
                    >
                        <Avatar
                            src={avatar || undefined}
                            sx={{
                                width: 120,
                                height: 120,
                                fontSize: "2.4rem",
                                fontWeight: 700,
                                bgcolor: "text.primary",
                                color: "text.inverse",
                                mb: 3,
                            }}
                        >
                            {!avatar && initials}
                        </Avatar>

                        <Divider sx={{ width: "100%", mb: 2.5, borderColor: "divider" }} />

                        {/* Social: 4 icons in a single row */}
                        <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center" }}>
                            <SocialButton
                                icon={<LanguageIcon fontSize="small" />}
                                label="Website"
                                href={social.website}
                            />
                            <SocialButton
                                icon={<FacebookIcon fontSize="small" />}
                                label="Facebook"
                                href={social.facebook}
                            />
                            <SocialButton
                                icon={<LinkedInIcon fontSize="small" />}
                                label="LinkedIn"
                                href={social.linkedin}
                            />
                            <SocialButton
                                icon={<YouTubeIcon fontSize="small" />}
                                label="YouTube"
                                href={social.youtube}
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default ProfilePage;
