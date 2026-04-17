import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import { Button, IconButton, TextField, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import theme from '../../theme/theme';

export default function TextList({ items: initialItems = [], onChange, minItemLength = 4, maxLength = null }) {
  const items = initialItems.length > 0
    ? initialItems.map((text, index) => ({
      id: index + 1,
      text,
    }))
    : Array.from({ length: minItemLength }, (_, index) => ({
      id: index + 1,
      text: "",
    }));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reorderedItems = arrayMove(items, oldIndex, newIndex);

    onChange(reorderedItems.map((item) => item.text));
  };

  const handleTextChange = (id, newText) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, text: newText } : item
    );

    onChange(newItems.map((item) => item.text));
  };

  const handleDelete = (id) => {
    if (items.length <= minItemLength) {
      return;
    }
    const newItems = items.filter((item) => item.id !== id);
    onChange(newItems.map((item) => item.text));
  };

  const handleAdd = () => {
    const allFilled = items.every((item) => item.text.trim() !== "");
    if (!allFilled) {
      return;
    }

    onChange([...initialItems, ""]);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="d-flex flex-column gap-2">
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  backgroundColor: "white",
                  marginBottom: "8px",
                  paddingRight: "16px",
                  transition: "border-color 0.2s ease",
                }}
                className="sortable-item"
              >
                <TextField
                  type="text"
                  variant="standard"
                  fullWidth
                  placeholder="Add your response here"
                  value={item.text}
                  onChange={(e) => handleTextChange(item.id, e.target.value)}
                  slotProps={{
                    htmlInput: { maxLength: maxLength },
                    input: {
                      disableUnderline: true,
                      style: { fontSize: "14px", padding: "12px 16px" },
                      endAdornment: maxLength ? (
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", display: "flex", alignItems: "center", lineHeight: 1, }}
                        >
                          {item.text?.length || 0}/{maxLength}
                        </Typography>
                      ) : null,
                    },
                  }}
                  sx={{
                    "& .MuiInputBase-input": {
                      padding: 0,
                    },
                    "& .MuiInputBase-root:focus-within": {
                      borderColor: "brand.main",
                    },
                  }}
                  onFocus={(e) =>
                    (e.target.closest(".sortable-item").style.borderColor = theme.palette.secondaryBrand.main)
                  }
                  onBlur={(e) =>
                    (e.target.closest(".sortable-item").style.borderColor = "#e0e0e0")
                  }
                />

                <div
                  style={{
                    display: "inline-block",
                    cursor: items.length > minItemLength ? "pointer" : "not-allowed",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(item.id)}
                    disabled={!(items.length > minItemLength)}
                    sx={{
                      padding: "4px",
                      color: "#999",
                      flexShrink: 0,
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
                <div
                  className="drag-handle"
                  style={{ cursor: "grab", color: "#999", flexShrink: 0 }}
                >
                  <DragIndicatorIcon />
                </div>
              </div>
            </SortableItem>
          ))}
          <Button
            onClick={handleAdd}
            startIcon={<AddIcon />}
            sx={{
              alignSelf: "flex-start",
              color: "brand.dark",
              textTransform: "none",
              fontSize: "14px",
              fontWeight: "500",
              borderRadius: "6px",
              "&:hover": {
                backgroundColor: "brand.lighter",
              },
            }}
          >
            Add more to your response
          </Button>
        </div>
      </SortableContext>
    </DndContext>
  );
}