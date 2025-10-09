import { Box, Typography, Divider } from "@mui/material"

export default function OrderDetails({ courses }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "#1a1a1a" }}>
        Order Details ({courses.length} courses)
      </Typography>
      {courses.map((course, index) => (
        <Box key={course.id}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              py: 2,
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 75,
                borderRadius: 2,
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <Box
                component="img"
                src={course.image || "/placeholder.svg"}
                alt={course.title}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  color: "#1a1a1a",
                  lineHeight: 1.4,
                  mb: 0.5,
                }}
              >
                {course.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Digital Course
              </Typography>
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#6366f1",
                fontSize: "1.1rem",
              }}
            >
              {course.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </Typography>
          </Box>
          {index < courses.length - 1 && <Divider />}
        </Box>
      ))}
    </Box>
  )
}