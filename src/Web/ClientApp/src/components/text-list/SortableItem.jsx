import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, animateLayoutChanges: () => false });

  // chỉ cho phép drag khi nhấn vào element có class "drag-handle"
  const customListeners = {
    ...listeners,
    onPointerDown: (event) => {
      if (!event.target.closest(".drag-handle")) return;
      listeners.onPointerDown(event);
    },
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: transform ? 999 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...customListeners}>
      {children}
    </div>
  );
}