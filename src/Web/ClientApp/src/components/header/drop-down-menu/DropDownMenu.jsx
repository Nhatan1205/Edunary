import useGetCategories from "../../../hooks/category-hooks/useGetCategories";
import DesktopDropDownMenu from "./Desktop/DesktopDropDownMenu";
import MobileDropDownMenu from "./Mobile/MobileDropDownMenu";

const MENU_DATA = {
  business: [
    {
      title: "For business",
      path: "/business",
    },
    {
      title: "Teach on Edunary",
      path: "/teach",
    },
  ],
  resources: [
    {
      title: "About us",
      path: "/about",
    },
    {
      title: "Our policy",
      path: "/policy",
    },
    {
      title: "FAQ",
      path: "/faq",
    },
  ],
};

function DropDownMenu({ open, anchorEl, handleCloseDropDown, isMobile }) {

  const { data: categoryData } = useGetCategories(1, 10);
  return isMobile ? (
    <MobileDropDownMenu
      open={open}
      onClose={handleCloseDropDown}
      categories_data={categoryData?.items}
      MENU_DATA={MENU_DATA}
    />
  ) : (
    <DesktopDropDownMenu
      open={open}
      anchorEl={anchorEl}
      onClose={handleCloseDropDown}
      categories_data={categoryData?.items}
      MENU_DATA={MENU_DATA}
    />
  );
}

export default DropDownMenu;
