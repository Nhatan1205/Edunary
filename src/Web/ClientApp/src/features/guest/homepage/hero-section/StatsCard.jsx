import { Card, CardContent, Typography } from "@mui/material";
const variantStyles = {
  yellow: {
    bgcolor: "#FFED29",
    color: "#111827",
    pr: 8,
  },
  white: {
    bgcolor: "white",
    color: "#111827",
    border: "1px solid #f3f4f6",
  },
  main: {
    bgcolor: "brand.main",
    color: "white",
    border: "1px solid brand.main",
  },
};

export default function StatsCard({ number, label, variant }) {
  return (
    <Card
      sx={{
        px: 4,
        ...variantStyles[variant],
        borderRadius: 20,
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        minWidth: 120,
        textAlign: "left",
      }}
    >
      <CardContent sx={{ px: 2, py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            fontSize: "1.125rem",
          }}
        >
          {number}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            opacity: 0.8,
            fontSize: "1rem",
            fontWeight: 500,
          }}
        >
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}
