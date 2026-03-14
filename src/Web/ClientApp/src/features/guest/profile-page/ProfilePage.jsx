import { useState } from "react";
import {
    Avatar,
    Box,
    CircularProgress,
    Divider,
    IconButton,
    Tooltip,
    Typography,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import XIcon from '@mui/icons-material/X';
import { useParams } from "react-router";
import useGetPublicUserInfo from "../../../hooks/useGetPublicUserInfo";
import useGetPublicCoursesByUserId from "../../../hooks/useGetPublicCoursesByUserId";
import ProfileCourseCard from "./ProfileCourseCard";
import DOMPurify from "dompurify";
import AvatarImage from "../../../assets/images/avatar.jpg";
import CustomPagination from "../../../components/pagination/CustomPagination";
import LoadingSpinner from "../../../components/LoadingSpinner";



const CONTENT_MAX_WIDTH = "1200px";
const CONTENT_PX = { xs: 2, sm: 4, md: 6 }
const RIGHT_COL_WIDTH = 280;

function ensureAbsoluteUrl(url) {
    if (!url) return url;
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function SocialButton({ icon, label, href }) {
    return (
        <Tooltip title={label}>
            <IconButton
                component="a"
                href={ensureAbsoluteUrl(href)}
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
    const { id } = useParams();
    const { data: user, isLoading } = useGetPublicUserInfo(id);
    const [coursePage, setCoursePage] = useState(1);
    const { data: coursesData, isLoading: isCoursesLoading } = useGetPublicCoursesByUserId(id, coursePage, 9);

    function handleCoursePageChange(event, value) {
        setCoursePage(value);
    }

    const social = user?.links ?? {};

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
            {/* Banner */}
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
                        <Typography variant="h3" sx={{ color: "text.primary", mt: 0.5, mb: 0.75 }}>
                            {user.fullName}
                        </Typography>

                        {/* Always render để giữ height banner cố định */}
                        <Typography
                            variant="body1"
                            sx={{
                                color: "text.secondary",
                                mb: 2,
                                visibility: user.headline ? "visible" : "hidden",
                            }}
                        >
                            {user.headline || "placeholder"}
                        </Typography>
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
                {/* Left */}
                <Box>
                    {/* Stats */}
                    {(user.totalLearners > 0 || user.totalReviews > 0) && (
                        <Box sx={{ display: "flex", mt: 4, flexWrap: "wrap" }}>
                            {user.totalLearners > 0 && (
                                <StatItem value={user.totalLearners.toLocaleString()} label="Total learners" />
                            )}
                            {user.totalReviews > 0 && (
                                <StatItem value={user.totalReviews.toLocaleString()} label="Reviews" />
                            )}
                        </Box>
                    )}

                    {/* About me */}
                    {user.description && (
                        <Box sx={{ py: { xs: 4, md: 5 } }}>
                            <Typography variant="h5" fontWeight={700} sx={{ color: "text.primary", mb: 2 }}>
                                About me
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{ color: "text.secondary", lineHeight: 1.8 }}
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(user.description),
                                }}
                            />
                        </Box>
                    )}

                    {/* Courses list */}
                    {isCoursesLoading || (coursesData?.items?.length > 0) ? (
                        <Box sx={{ pb: { xs: 4, md: 5 }, mt: 4 }}>
                            <Typography variant="h5" fontWeight={700} sx={{ color: "text.primary", mb: 3 }}>
                                My courses {coursesData ? `(${coursesData.totalCount})` : ""}
                            </Typography>

                            {isCoursesLoading ? (
                                <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                                    <LoadingSpinner />
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                                        gap: 3,
                                    }}
                                >
                                    {coursesData.items.map((course) => (
                                        <ProfileCourseCard key={course.id} course={course} />
                                    ))}
                                </Box>
                            )}

                            {coursesData?.totalPages > 1 && (
                                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                                    <CustomPagination
                                        count={coursesData.totalPages}
                                        page={coursePage}
                                        onChange={handleCoursePageChange}
                                    />
                                </Box>
                            )}
                        </Box>
                    ) : null}
                </Box>

                {/* Right – avatar card */}
                <Box
                    sx={{
                        mt: { md: "-124px" },
                        display: { xs: "none", md: "block" },
                    }}
                >
                    <Box
                        sx={{
                            bgcolor: "background.paper",
                            borderRadius: 3,
                            boxShadow: "0 2px 16px rgba(0,0,0,0.1)",
                            p: 4,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            width: "100%",
                        }}
                    >
                        <Avatar
                            src={user.avatar || AvatarImage}
                            sx={{
                                width: 120,
                                height: 120,
                                fontSize: "2.4rem",
                                fontWeight: 700,
                                bgcolor: "text.primary",
                                color: "text.inverse",
                                mb: 3,
                            }}
                        />

                        <Divider sx={{ width: "100%", mb: 2.5, borderColor: "divider" }} />

                        {/* Social links */}
                        <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center" }}>
                            {social.website && (
                                <SocialButton
                                    icon={<LanguageIcon fontSize="small" />}
                                    label="Website"
                                    href={social.website}
                                />
                            )}
                            {social.facebook && (
                                <SocialButton
                                    icon={<FacebookIcon fontSize="small" />}
                                    label="Facebook"
                                    href={social.facebook}
                                />
                            )}
                            {social.linkedin && (
                                <SocialButton
                                    icon={<LinkedInIcon fontSize="small" />}
                                    label="LinkedIn"
                                    href={social.linkedin}
                                />
                            )}
                            {social.youtube && (
                                <SocialButton
                                    icon={<YouTubeIcon fontSize="small" />}
                                    label="YouTube"
                                    href={social.youtube}
                                />
                            )}
                            {social.twitter && (
                                <SocialButton
                                    icon={<XIcon fontSize="small" />}
                                    label="X"
                                    href={social.twitter}
                                />
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default ProfilePage;
