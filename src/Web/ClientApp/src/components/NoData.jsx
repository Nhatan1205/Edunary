import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";

/**
 * NoData — reusable empty-state component.
 *
 * @param {string}  image  - Image source: accepts both a URL string and an
 *                           imported asset (e.g. import img from "…/img.png").
 * @param {string}  title  - Bold heading shown below the image.
 * @param {string}  [description] - Optional secondary text beneath the title.
 * @param {number}  [imageWidth]  - Width of the illustration in px (default 200).
 * @param {string}  [minHeight]   - Min-height of the container (default "420px").
 */
function NoData({
    image,
    title,
    description,
    imageWidth = 200,
    minHeight = "420px",
}) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight,
                p: 4,
            }}
        >
            {image && (
                <Box
                    component="img"
                    src={image}
                    alt={title || "No data"}
                    sx={{
                        width: imageWidth,
                        height: "auto",
                        borderRadius: 2,
                        mb: 3,
                    }}
                />
            )}

            {title && (
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        mb: description ? 1.5 : 0,
                        textAlign: "center",
                    }}
                >
                    {title}
                </Typography>
            )}

            {description && (
                <Typography
                    variant="body1"
                    sx={{
                        color: "text.secondary",
                        textAlign: "center",
                        maxWidth: "500px",
                        lineHeight: 1.6,
                    }}
                >
                    {description}
                </Typography>
            )}
        </Box>
    );
}

NoData.propTypes = {
    image: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    imageWidth: PropTypes.number,
    minHeight: PropTypes.string,
};

export default NoData;
