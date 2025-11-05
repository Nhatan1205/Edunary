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
import { Button, IconButton, TextField } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';

export default function TextList({ items: initialItems = [], onChange, minLength = 4 }) {
  const items = initialItems.length > 0 
  ? initialItems.map((text, index) => ({
      id: index + 1,
      text,
    }))
  : Array.from({ length: minLength }, (_, index) => ({
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
    if (items.length <= minLength) {
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
                  variant="standard"
                  fullWidth
                  placeholder="Add your response here"
                  value={item.text}
                  onChange={(e) => handleTextChange(item.id, e.target.value)}
                  slotProps={{
                    input: {
                      disableUnderline: true,
                      style: { fontSize: "14px", padding: "12px 16px" },
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
                    (e.target.closest(".sortable-item").style.borderColor = "#3FCCB2")
                  }
                  onBlur={(e) =>
                    (e.target.closest(".sortable-item").style.borderColor = "#e0e0e0")
                  }
                />

                <IconButton
                  size="small"
                  onClick={() => handleDelete(item.id)}
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

                <div
                  className="drag-handle"
                  style={{ cursor: "grab", color: "#999", flexShrink: 0 }}
                >
                  <MenuIcon />
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