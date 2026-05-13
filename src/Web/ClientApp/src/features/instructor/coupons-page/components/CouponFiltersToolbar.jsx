import { Avatar, Box, Button, Chip } from "@mui/material"
import PersonIcon from "@mui/icons-material/Person"
import DataGridToolbar from "../../../../components/datagrid/DataGridToolbar"
import DefaultSelect from "../../../../components/drop-down/DefaultSelect"

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "0", label: "Percentage" },
  { value: "1", label: "Fixed Amount" },
  { value: "2", label: "Custom Price" },
  { value: "3", label: "Free" },
]

export default function CouponFiltersToolbar({
  codeInput,
  onCodeInputChange,
  typeFilter,
  onTypeFilterChange,
  isAdmin,
  ownerFilter,
  onClearOwnerFilter,
  onOpenOwnerDialog,
}) {
  return (
    <DataGridToolbar
      filterName={codeInput}
      onFilterName={event => onCodeInputChange(event.target.value.toUpperCase())}
      searchPlaceholder="Search code..."
      filterDropdowns={
        <DefaultSelect
          data={typeOptions}
          value={typeFilter === null ? [typeOptions[0]] : [typeOptions.find(o => o.value === String(typeFilter))]}
          onChange={([item]) => onTypeFilterChange(!item || item.value === "all" ? null : Number(item.value))}
          defaultLabel="All Types"
        />
      }
      customRightAction={isAdmin ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {ownerFilter && (
            <Chip
              avatar={<Avatar src={ownerFilter.avatar} sx={{ width: 20, height: 20 }} />}
              label={ownerFilter.fullName || ownerFilter.email}
              onDelete={onClearOwnerFilter}
              size="small"
              sx={{ borderRadius: "8px" }}
            />
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<PersonIcon />}
            onClick={onOpenOwnerDialog}
            sx={{ textTransform: "none", borderRadius: "10px", borderColor: "divider", color: "text.secondary" }}
          >
            {ownerFilter ? "Change owner" : "Filter by owner"}
          </Button>
        </Box>
      ) : undefined}
    />
  )
}
