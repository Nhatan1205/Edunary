import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const statCards = [
  {
    id: 1,
    label: "Total Users",
    value: "18,765",
    change: "+2.6%",
    up: true,
    sub: "last 7 days",
    icon: PeopleOutlinedIcon,
    color: "brand.main",
    bg: "brand.lighter",
  },
  {
    id: 2,
    label: "Total Courses",
    value: "4,876",
    change: "+0.2%",
    up: true,
    sub: "last 7 days",
    icon: SchoolOutlinedIcon,
    color: "secondaryBrand.main",
    bg: "#e8f8f8",
  },
  {
    id: 3,
    label: "Total Revenue",
    value: "$67,800",
    change: "-0.1%",
    up: false,
    sub: "last 7 days",
    icon: MonetizationOnOutlinedIcon,
    color: "#ff9800",
    bg: "#fff8e1",
  },
  {
    id: 4,
    label: "Enrollments",
    value: "678",
    change: "+3.4%",
    up: true,
    sub: "last 7 days",
    icon: TrendingUpOutlinedIcon,
    color: "#7c3aed",
    bg: "#f3e8ff",
  },
];

const topCourses = [
  { id: 1, name: "React – The Complete Guide", instructor: "Max Schwarzmüller", enrolled: 8200, revenue: "$32,400", rating: 4.8, status: "Active" },
  { id: 2, name: "Python Bootcamp 2025", instructor: "Angela Yu", enrolled: 7410, revenue: "$28,100", rating: 4.9, status: "Active" },
  { id: 3, name: "UI/UX Design Masterclass", instructor: "Daniel Walter Scott", enrolled: 6100, revenue: "$24,600", rating: 4.7, status: "Active" },
  { id: 4, name: "Node.js: Advanced Concepts", instructor: "Stephen Grider", enrolled: 5300, revenue: "$20,150", rating: 4.6, status: "Active" },
  { id: 5, name: "AWS Certified Developer", instructor: "Stephane Maarek", enrolled: 4890, revenue: "$18,700", rating: 4.5, status: "Paused" },
  { id: 6, name: "Machine Learning A-Z", instructor: "Kirill Eremenko", enrolled: 4500, revenue: "$16,200", rating: 4.7, status: "Active" },
];

const recentUsers = [
  { id: 1, name: "Jaydon Frankie", email: "jaydon@gmail.com", role: "Student", joined: "Jan 22, 2025", status: "Active" },
  { id: 2, name: "Lainey Davidson", email: "lainey@gmail.com", role: "Instructor", joined: "Jan 19, 2025", status: "Active" },
  { id: 3, name: "Reece Chung", email: "reece@gmail.com", role: "Student", joined: "Jan 15, 2025", status: "Banned" },
  { id: 4, name: "Lainey Gustavsson", email: "laineymg@gmail.com", role: "Instructor", joined: "Jan 10, 2025", status: "Active" },
  { id: 5, name: "Chase Day", email: "chase.d@gmail.com", role: "Student", joined: "Jan 8, 2025", status: "Pending" },
];

const topCategories = [
  { name: "Web Development", percentage: 78, count: 1240 },
  { name: "Data Science", percentage: 62, count: 980 },
  { name: "Mobile Development", percentage: 55, count: 870 },
  { name: "UI/UX Design", percentage: 47, count: 740 },
  { name: "Cloud Computing", percentage: 39, count: 610 },
  { name: "Cybersecurity", percentage: 30, count: 475 },
];

const activityFeed = [
  { id: 1, user: "Jaydon F.", action: "enrolled in", target: "React – The Complete Guide", time: "2 min ago" },
  { id: 2, user: "Lainey D.", action: "published course", target: "Advanced TypeScript Patterns", time: "15 min ago" },
  { id: 3, user: "Reece C.", action: "left a review on", target: "Python Bootcamp 2025", time: "34 min ago" },
  { id: 4, user: "Chase D.", action: "purchased", target: "UI/UX Design Masterclass", time: "1 hr ago" },
  { id: 5, user: "Alex M.", action: "enrolled in", target: "Node.js: Advanced Concepts", time: "2 hr ago" },
  { id: 6, user: "Sarah K.", action: "completed", target: "AWS Certified Developer", time: "3 hr ago" },
  { id: 7, user: "Tom B.", action: "enrolled in", target: "Machine Learning A-Z", time: "4 hr ago" },
  { id: 8, user: "Maria L.", action: "published course", target: "Digital Marketing 101", time: "5 hr ago" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ card }) {
  const Icon = card.icon;
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: "text.tertiary", mb: 0.5, fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {card.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary" }}>
              {card.value}
            </Typography>
          </Box>
          <Box sx={{ width: 48, height: 48, borderRadius: "12px", bgcolor: card.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon sx={{ fontSize: 24, color: card.color }} />
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {card.up ? (
            <ArrowUpwardIcon sx={{ fontSize: 14, color: "success.main" }} />
          ) : (
            <ArrowDownwardIcon sx={{ fontSize: 14, color: "error.main" }} />
          )}
          <Typography variant="caption" sx={{ color: card.up ? "success.main" : "error.main", fontWeight: 600 }}>
            {card.change}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            &nbsp;{card.sub}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function SectionCard({ title, children, action }) {
  return (
    <Card elevation={0} sx={{ borderRadius: "16px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper", height: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, pt: 2.5, pb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
          {title}
        </Typography>
        {action || <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>}
      </Box>
      <Divider />
      {children}
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPlaceholderPage() {
  return (
    <Box sx={{ px: { xs: 1, md: 2 }, py: 1 }}>
      {/* Page title */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary" }}>
          Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: "text.tertiary", mt: 0.5 }}>
          Welcome back 👋 Here's what's happening with your platform today.
        </Typography>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.id}>
            <StatCard card={card} />
          </Grid>
        ))}
      </Grid>

      {/* Mock chart banner */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <SectionCard title="Revenue Overview">
            <Box sx={{ px: 3, py: 2 }}>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                {["Week", "Month", "Year"].map((t, i) => (
                  <Chip key={t} label={t} size="small" sx={{ fontWeight: 600, bgcolor: i === 1 ? "brand.main" : "background.muted", color: i === 1 ? "#fff" : "text.secondary", cursor: "pointer" }} />
                ))}
              </Box>
              {/* Fake bar chart using Box */}
              <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.5, height: 180, px: 1 }}>
                {[45, 72, 58, 90, 63, 80, 55, 95, 70, 85, 60, 100].map((h, i) => (
                  <Box key={i} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                    <Box
                      sx={{
                        width: "100%",
                        height: `${h}%`,
                        borderRadius: "6px 6px 0 0",
                        bgcolor: i === 11 ? "brand.main" : i % 2 === 0 ? "brand.lighter" : "secondaryBrand.lighter",
                        transition: "height 0.3s",
                      }}
                    />
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1, px: 1 }}>
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                  <Typography key={m} variant="caption" sx={{ color: "text.disabled", fontSize: "0.7rem" }}>{m}</Typography>
                ))}
              </Box>
            </Box>
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <SectionCard title="Top Categories">
            <Box sx={{ px: 3, py: 2 }}>
              {topCategories.map((cat) => (
                <Box key={cat.name} sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500, fontSize: "0.85rem" }}>
                      {cat.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.tertiary" }}>
                      {cat.count} courses
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={cat.percentage}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: "brand.lighter",
                      "& .MuiLinearProgress-bar": { borderRadius: 3, bgcolor: "brand.main" },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Top Courses Table */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <SectionCard title="Top Performing Courses">
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {["Course", "Enrolled", "Revenue", "Rating", "Status"].map((h) => (
                      <TableCell key={h} sx={{ fontSize: "0.75rem", fontWeight: 600, color: "text.disabled", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid", borderColor: "divider", py: 1.5 }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topCourses.map((row) => (
                    <TableRow key={row.id} hover sx={{ "&:last-child td": { border: 0 } }}>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.85rem" }}>
                          {row.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.disabled" }}>
                          {row.instructor}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
                          {row.enrolled.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
                          {row.revenue}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={`★ ${row.rating}`} size="small" sx={{ bgcolor: "#fff8e1", color: "#f59e0b", fontWeight: 700, fontSize: "0.72rem" }} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            bgcolor: row.status === "Active" ? "brand.lighter" : "#fef3c7",
                            color: row.status === "Active" ? "brand.dark" : "#92400e",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </SectionCard>
        </Grid>

        {/* Activity Feed */}
        <Grid item xs={12} md={5}>
          <SectionCard title="Recent Activity">
            <Box sx={{ px: 3, py: 1 }}>
              {activityFeed.map((item, idx) => (
                <Box key={item.id}>
                  <Box sx={{ display: "flex", gap: 1.5, py: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: "brand.lighter", color: "brand.dark", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0 }}>
                      {item.user.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontSize: "0.85rem", color: "text.primary", lineHeight: 1.5 }}>
                        <strong>{item.user}</strong> {item.action}{" "}
                        <Box component="span" sx={{ color: "brand.dark", fontWeight: 600 }}>
                          {item.target}
                        </Box>
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.disabled" }}>
                        {item.time}
                      </Typography>
                    </Box>
                  </Box>
                  {idx < activityFeed.length - 1 && <Divider />}
                </Box>
              ))}
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Recent Users Table */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <SectionCard title="Recent Users">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {["User", "Email", "Role", "Joined", "Status"].map((h) => (
                      <TableCell key={h} sx={{ fontSize: "0.75rem", fontWeight: 600, color: "text.disabled", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid", borderColor: "divider", py: 1.5 }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id} hover sx={{ "&:last-child td": { border: 0 } }}>
                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: "brand.lighter", color: "brand.dark", fontWeight: 700, fontSize: "0.85rem" }}>
                            {user.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                            {user.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            bgcolor: user.role === "Instructor" ? "#f3e8ff" : "background.muted",
                            color: user.role === "Instructor" ? "#7c3aed" : "text.secondary",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: "text.tertiary" }}>
                          {user.joined}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            bgcolor:
                              user.status === "Active" ? "brand.lighter" :
                              user.status === "Banned" ? "#fee2e2" : "#fef3c7",
                            color:
                              user.status === "Active" ? "brand.dark" :
                              user.status === "Banned" ? "#dc2626" : "#92400e",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Footer spacing */}
      <Box sx={{ height: 40 }} />
    </Box>
  );
}
