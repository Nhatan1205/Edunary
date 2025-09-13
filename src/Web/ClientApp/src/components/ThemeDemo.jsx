import { Box, Typography, Grid, Card, Button, TextField } from "@mui/material";
import theme2 from "../theme/theme2";

export default function ThemeColorVisualizer() {
  console.log(theme2.palette.brand.dark);
  return (
    <div sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Theme Color Visualizer
      </Typography>

      {/* Brand buttons */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h6">Brand Buttons</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Dùng cho CTA chính và các trạng thái hover/active.
        </Typography>
        <Grid container spacing={2}>
          <Grid size={8}>
            <Button
              fullWidth
              variant="contained"
              sx={{ backgroundColor: "brand.main" }}
              className="text-danger"
            >
              Brand Main
            </Button>
          </Grid>
          <Grid size={4}>
            <Button
              fullWidth
              variant="contained "
              sx={{ backgroundColor: "brand.light" }}
            >
              Brand Light
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" sx={{ bgcolor: "brand.dark" }}>
              Brand Dark
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Secondary brand buttons */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h6">Secondary Brand Buttons</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Dùng cho CTA phụ, bổ trợ cho brand chính.
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              sx={{ backgroundColor: "secondaryBrand.main" }}
            >
              Secondary Main
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              sx={{ backgroundColor: "secondaryBrand.light" }}
            >
              Secondary Light
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              sx={{ backgroundColor: "secondaryBrand.dark" }}
            >
              Secondary Dark
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Semantic colors */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h6">Semantic Colors</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Trạng thái thành công, cảnh báo, lỗi, thông tin.
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button variant="contained" color="success">
              Success
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="warning">
              Warning
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="error">
              Error
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="info">
              Info
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Text tokens */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h6">Text Tokens</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Các mức độ text trong typography.
        </Typography>
        <Card sx={{ p: 2 }}>
          <Typography sx={{ color: "text.primary" }}>Primary Text</Typography>
          <Typography sx={{ color: "text.secondary" }}>
            Secondary Text
          </Typography>
          <Typography sx={{ color: "text.tertiary" }}>Tertiary Text</Typography>
          <Typography sx={{ color: "text.disabled" }}>Disabled Text</Typography>
          <Box
            sx={{
              background: "brand.main",
              color: "text.inverse",
              p: 1,
              mt: 1,
              borderRadius: 1,
            }}
          >
            Inverse Text (on Brand Background)
          </Box>
        </Card>
      </Box>

      {/* Backgrounds */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h6">Backgrounds</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Ví dụ các màu nền mặc định, surface, paper, alt, muted.
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Card sx={{ backgroundColor: "background.default", p: 2 }}>
              <Typography>Default Background</Typography>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ backgroundColor: "background.surface", p: 2 }}>
              <Typography>Surface Background</Typography>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ backgroundColor: "background.paper", p: 2 }}>
              <Typography>Paper Background</Typography>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ backgroundColor: "background.alt", p: 2 }}>
              <Typography>Alt Background</Typography>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ backgroundColor: "background.muted", p: 2 }}>
              <Typography>Muted Background</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Example section with brand */}
        <Box
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 2,
            backgroundColor: "background.default",
            border: `1px solid ${"brand.main"}`,
          }}
        >
          <Typography variant="h6" sx={{ color: "brand.darker", mb: 1 }}>
            Section Example
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Section này sử dụng <strong>background.default</strong>, viền màu{" "}
            <strong>brand.main</strong>, text màu <strong>brand.darker</strong>.
          </Typography>
          <Button variant="contained" sx={{ backgroundColor: "brand.main" }}>
            CTA with Brand
          </Button>
        </Box>
      </Box>
    </div>
  );
}
