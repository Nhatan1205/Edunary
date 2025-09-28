import { Box, Avatar } from "@mui/material";

function ImageProfile({ imageUrl, sx = {} }) {
  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 4,
        overflow: "hidden",
        ...sx,
      }}
    >
      <Avatar
        src={imageUrl}
        alt="Student"
        sx={{
          borderRadius: 20,
          width: "100%",
          height: "100%",
          "& img": {
            objectFit: "cover",
          },
        }}
        onError={(e) => {
          console.log("Image load error:", e);
          console.log("Failed URL:", imageUrl);
        }}
        onLoad={() => {
          console.log("Image loaded successfully:", imageUrl);
        }}
      />
    </Box>
  );
}

export default ImageProfile;
