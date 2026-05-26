import { Chip, Stack, Typography } from "@mui/material";

export default function CourseOptionLabel({ title, isOwner, isCollaborator }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5} sx={{ width: "100%" }}>
      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 0 }} noWrap>
        {title}
      </Typography>
      <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
        {isOwner && <Chip label="Owner" size="small" sx={{ height: 22, fontSize: "0.7rem" }} />}
        {isCollaborator && <Chip label="Collaborator" size="small" color="secondary" sx={{ height: 22, fontSize: "0.7rem" }} />}
      </Stack>
    </Stack>
  );
}
