import { Avatar, Box, MenuItem, Typography } from "@mui/material";
import DefaultImage from "../../assets/images/default.jpg";
function MessageCard({ title, timestamp, onClick }) {
  return (
    <MenuItem
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        padding: "16px 20px",
        "&:hover": {
          backgroundColor: "#f5f5f5",
        },
      }}
    >
      <Avatar
        src={DefaultImage}
        sx={{
          width: 64,
          height: 64,
          border: "1px solid #e0e0e0",
        }}
      />
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            fontSize: "14px",
            color: "#1a1a1a",
            marginBottom: "4px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "normal",
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "#757575",
            fontSize: "12px",
          }}
        >
          {timestamp}
        </Typography>
      </Box>
    </MenuItem>
  );
}

export default MessageCard;
