import { useRef } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import RoomIcon from "@mui/icons-material/Room";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { formatShortDate } from "../../../../../utils/helpers";
import defaultAvatar from "../../../../../assets/images/avatar.jpg";

// ── Single card ───────────────────────────────────────────────────────────────
function StudentCard({ student, onClick }) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                px: 2,
                pt: 4,
                pb: 3,
                border: "1px solid #d1d7dc",
                borderRadius: "8px",
                textAlign: "center",
                gap: 1.5,
                bgcolor: "#fff",
                height: "100%",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    borderColor: "brand.main",
                },
            }}
            onClick={onClick}
        >
            {/* Avatar */}
            <Box
                sx={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    overflow: "hidden",
                    flexShrink: 0,
                }}
            >
                <Box
                    component="img"
                    src={student.avatar || defaultAvatar}
                    alt={student.fullName}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            </Box>

            {/* Name */}
            <Typography
                sx={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "#1c1d1f",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",
                }}
            >
                {student.fullName}
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "center", width: "100%" }}>
                {/* Course */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, width: "100%" }}>
                    <PlayCircleFilledIcon sx={{ fontSize: 13, color: "#1c1d1f", flexShrink: 0 }} />
                    <Typography sx={{ fontSize: "0.75rem", color: "#6a6f73", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {student.courseTitle}
                    </Typography>
                </Box>
            </Box>

            {/* Enrolled date */}
            <Typography sx={{ fontSize: "0.75rem", color: "#6a6f73" }}>
                Enrolled {formatShortDate(student.enrolledDate)}
            </Typography>
        </Box>
    );
}

function NavBtn({ onClick, direction }) {
    return (
        <IconButton
            onClick={onClick}
            sx={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                width: 44,
                height: 44,
                bgcolor: "brand.main",
                color: "#fff",
                borderRadius: "50%",
                boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                left: direction === "prev" ? 0 : "auto",
                right: direction === "next" ? 0 : "auto",
                "&:hover": { bgcolor: "#000" },
            }}
        >
            {direction === "prev"
                ? <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
                : <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
            }
        </IconButton>
    );
}

function RecentStudentsSlider({ students = [], onStudentClick }) {
    const swiperRef = useRef(null);

    return (
        <Box sx={{ mt: 2 }}>
            <Typography sx={{ fontSize: "0.95rem", color: "#1c1d1f", mb: 2 }}>
                Meet people taking your courses
            </Typography>

            <Box sx={{ position: "relative", px: "32px" }}>
                {/* Prev button */}
                <NavBtn direction="prev" onClick={() => swiperRef.current?.slidePrev()} />

                <Swiper
                    onSwiper={(s) => { swiperRef.current = s; }}
                    slidesPerView={4}
                    spaceBetween={16}
                    breakpoints={{
                        0: { slidesPerView: 2, spaceBetween: 12 },
                        600: { slidesPerView: 3, spaceBetween: 16 },
                        960: { slidesPerView: 4, spaceBetween: 16 },
                        1280: { slidesPerView: 5, spaceBetween: 16 },
                    }}
                >
                    {students.map((s) => (
                        <SwiperSlide key={`${s.studentId}-${s.courseId}`}>
                            <StudentCard student={s} onClick={() => onStudentClick?.(s)} />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Next button */}
                <NavBtn direction="next" onClick={() => swiperRef.current?.slideNext()} />
            </Box>
        </Box>
    );
}

export default RecentStudentsSlider;
