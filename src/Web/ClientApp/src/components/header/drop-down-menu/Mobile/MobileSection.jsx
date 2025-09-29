import { Divider, List, Typography } from "@mui/material";
import MobileListItem from "./MobileListItem";

function MobileSection({ title, items, onItemClick, bordered = false }) {
  return (
    <>
      <Typography
        variant="subtitle2"
        sx={{
          color: "text.primary",
          fontWeight: 600,
          fontSize: "12px",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          mb: 2,
          mt: bordered ? 3 : 0,
        }}
      >
        {title}
      </Typography>
      <List>
        {items.map((item, index) => (
          <MobileListItem
            key={index}
            item={item}
            onClick={onItemClick}
            bordered={bordered}
          />
        ))}
      </List>
      {!bordered && <Divider sx={{ my: 2 }} />}
    </>
  );
}

export default MobileSection;
