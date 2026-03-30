import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";

/**
 * NoResult — search / empty-state component with optional illustration.
 *
 * Backward-compatible: existing usages with only `searchValue` and `sx`
 * continue to work without any changes.
 *
 * @param {string} [searchValue] - When provided, renders "Your search for '…' didn't return any results."
 * @param {string} [image]       - Optional image src (URL or imported asset). Rendered above the title.
 * @param {string} [title]       - Override the default title text.
 * @param {string} [description] - Optional secondary text below the title.
 * @param {object} [sx]          - Extra MUI sx styles applied to the outer Box.
 */
function NoResult({ searchValue = "", image, title, description, sx = {} }) {
  const defaultTitle = searchValue
    ? null  // handled inline for coloured span
    : (title || "No Results Found");

  return (
    <Box
      sx={{
        border: "2px dashed",
        borderColor: "brand.dark",
        borderRadius: "8px",
        padding: "60px 40px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        ...sx,
      }}
    >
      {/* Illustration */}
      {image && (
        <Box
          component="img"
          src={image}
          alt={title || "No results"}
          sx={{
            width: 180,
            height: "auto",
          }}
        />
      )}

      {/* Title */}
      <Typography
        sx={{
          fontSize: "32px",
          fontWeight: 600,
          color: "#000000",
        }}
      >
        {searchValue ? (
          <>
            Your search for &quot;
            <Box
              component="span"
              sx={{
                color: "brand.dark",
                fontWeight: 600,
              }}
            >
              {searchValue}
            </Box>
            &quot; didn&apos;t return any results.
          </>
        ) : (
          defaultTitle
        )}
      </Typography>

      {/* Description */}
      {description && (
        <Typography
          variant="body1"
          sx={{
            mt: 1.5,
            color: "text.secondary",
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

NoResult.propTypes = {
  searchValue: PropTypes.string,
  image: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  sx: PropTypes.object,
};

export default NoResult;