import {
  createContext,
  useContext,
  useReducer,
  useRef,
  useCallback,
} from "react";

// Step 1: Create Context
const PopoverContext = createContext(null);

// Action Types
const POPOVER_ACTIONS = {
  SHOW_POPOVER: "SHOW_POPOVER",
  HIDE_POPOVER: "HIDE_POPOVER",
  SET_ANCHOR: "SET_ANCHOR",
  CLEAR_ANCHOR: "CLEAR_ANCHOR",
  SET_HOVERING: "SET_HOVERING",
};

// Initial State
const initialState = {
  activePopupId: null,
  anchorEl: null,
  isHovering: false,
};

// Reducer
const popoverReducer = (state, action) => {
  switch (action.type) {
    case POPOVER_ACTIONS.SHOW_POPOVER:
      return {
        ...state,
        activePopupId: action.payload.id,
        anchorEl: action.payload.anchorEl,
        isHovering: true,
      };
    case POPOVER_ACTIONS.HIDE_POPOVER:
      return {
        ...state,
        activePopupId: null,
        anchorEl: null,
        isHovering: false,
      };
    case POPOVER_ACTIONS.SET_ANCHOR:
      return {
        ...state,
        anchorEl: action.payload,
      };
    case POPOVER_ACTIONS.CLEAR_ANCHOR:
      return {
        ...state,
        anchorEl: null,
      };
    case POPOVER_ACTIONS.SET_HOVERING:
      return {
        ...state,
        isHovering: action.payload,
      };
    default:
      return state;
  }
};

// Step 2: Create Provider
export const PopoverProvider = ({ children }) => {
  const [state, dispatch] = useReducer(popoverReducer, initialState);
  const hideTimeoutRef = useRef(null);

  // Clear timeout helper
  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  // Show popover
  const showPopover = useCallback(
    (id, anchorEl) => {
      clearHideTimeout();
      dispatch({
        type: POPOVER_ACTIONS.SHOW_POPOVER,
        payload: { id, anchorEl },
      });
    },
    [clearHideTimeout]
  );

  // Hide popover with delay
  const hidePopover = useCallback((delay = 100) => {
    dispatch({ type: POPOVER_ACTIONS.SET_HOVERING, payload: false });

    hideTimeoutRef.current = setTimeout(() => {
      dispatch({ type: POPOVER_ACTIONS.HIDE_POPOVER });
    }, delay);
  }, []);

  // Immediate hide popover
  const hidePopoverImmediate = useCallback(() => {
    clearHideTimeout();
    dispatch({ type: POPOVER_ACTIONS.HIDE_POPOVER });
  }, [clearHideTimeout]);

  // Handle mouse enter on card
  const handleCardMouseEnter = useCallback(
    (courseId, element) => {
      clearHideTimeout();
      showPopover(courseId, element);
    },
    [clearHideTimeout, showPopover]
  );

  // Handle mouse leave from card
  const handleCardMouseLeave = useCallback(() => {
    hidePopover();
  }, [hidePopover]);

  // Handle mouse enter on popover
  const handlePopoverMouseEnter = useCallback(() => {
    clearHideTimeout();
    dispatch({ type: POPOVER_ACTIONS.SET_HOVERING, payload: true });
  }, [clearHideTimeout]);

  // Handle mouse leave from popover
  const handlePopoverMouseLeave = useCallback(() => {
    hidePopover();
  }, [hidePopover]);

  // Check if a specific popover is active
  const isPopoverActive = useCallback(
    (id) => {
      return state.activePopupId === id;
    },
    [state.activePopupId]
  );

  const value = {
    // State
    activePopupId: state.activePopupId,
    anchorEl: state.anchorEl,
    isHovering: state.isHovering,

    // Actions
    showPopover,
    hidePopover,
    hidePopoverImmediate,

    // Mouse event handlers
    handleCardMouseEnter,
    handleCardMouseLeave,
    handlePopoverMouseEnter,
    handlePopoverMouseLeave,

    // Utility functions
    isPopoverActive,
    clearHideTimeout,
  };

  return (
    <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>
  );
};

// Step 3: Create Consumer Hook (Custom hook for child components)
export const usePopover = () => {
  const context = useContext(PopoverContext);

  if (!context) {
    throw new Error("usePopover must be used within a PopoverProvider");
  }

  return context;
};

// Step 4: Export Provider and Consumer
const PopoverContextExport = {
  Provider: PopoverProvider,
  Consumer: usePopover,
};

export default PopoverContextExport;
