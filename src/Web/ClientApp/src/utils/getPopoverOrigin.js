//logic to calculate popup position
export const getPopoverOrigin = (
  isMobile,
  cardRef,
  popoverWidth = 340,
  margin = 20
) => {
  // Mobile: luôn hiển thị bên dưới card (centered)
  if (isMobile) {
    return {
      anchorOrigin: { vertical: "bottom", horizontal: "center" },
      transformOrigin: { vertical: "top", horizontal: "center" },
    };
  }

  const el = cardRef && cardRef.current;
  // Nếu chưa có ref (fallback) => hiển thị bên phải
  if (!el) {
    return {
      anchorOrigin: { vertical: "center", horizontal: "right" },
      transformOrigin: { vertical: "center", horizontal: "left" },
    };
  }

  const rect = el.getBoundingClientRect();
  const availableRight = window.innerWidth - rect.right;
  const availableLeft = rect.left;

  // Nếu đủ chỗ bên phải => hiển thị bên phải (popover trái sát với cạnh phải của card)
  if (availableRight >= popoverWidth + margin) {
    return {
      anchorOrigin: { vertical: "center", horizontal: "right" },
      transformOrigin: { vertical: "center", horizontal: "left" },
    };
  }

  // Nếu đủ chỗ bên trái => hiển thị bên trái (popover phải sát với cạnh trái của card)
  if (availableLeft >= popoverWidth + margin) {
    return {
      anchorOrigin: { vertical: "center", horizontal: "left" },
      transformOrigin: { vertical: "center", horizontal: "right" },
    };
  }

  // Nếu cả hai bên đều không đủ chỗ ngang (để tránh đè lên card) -> fallback xuống dưới card
  return {
    anchorOrigin: { vertical: "bottom", horizontal: "center" },
    transformOrigin: { vertical: "top", horizontal: "center" },
  };
};
