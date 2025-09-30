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

  // Handle mouse enter on card
  const handleMouseEnter = useCallback((courseId, element) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    dispatch({
      type: POPOVER_ACTIONS.SHOW_POPOVER,
      payload: { id: courseId, anchorEl: element },
    });
  }, []);

  // Handle mouse leave from card
  const handleMouseLeave = useCallback((delay = 100) => {
    hideTimeoutRef.current = setTimeout(() => {
      dispatch({ type: POPOVER_ACTIONS.HIDE_POPOVER });
    }, delay);
  }, []);

  // Handle mouse enter on popover
  const handlePopoverMouseEnter = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    dispatch({ type: POPOVER_ACTIONS.SET_HOVERING, payload: true });
  }, []);

  // Handle mouse leave from popover
  const handlePopoverMouseLeave = useCallback((delay = 100) => {
    hideTimeoutRef.current = setTimeout(() => {
      dispatch({ type: POPOVER_ACTIONS.HIDE_POPOVER });
    }, delay);
  }, []);

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

    handleMouseEnter,
    handleMouseLeave,
    handlePopoverMouseEnter,
    handlePopoverMouseLeave,

    // Utility functions
    isPopoverActive,
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
