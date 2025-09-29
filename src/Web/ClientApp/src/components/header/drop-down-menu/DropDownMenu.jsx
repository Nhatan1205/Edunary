import DesktopDropDownMenu from "./Desktop/DesktopDropDownMenu";
import MobileDropDownMenu from "./Mobile/MobileDropDownMenu";

const categories_data = [
  {
    title: "AI & Innovation",
    path: "/categories/ai-innovation",
  },
  {
    title: "Animation & 3D",
    path: "/categories/animation-3d",
  },
  {
    title: "Art & Illustration",
    path: "/categories/art-illustration",
  },
  {
    title: "Crafts & DIY",
    path: "/categories/crafts-diy",
  },
  {
    title: "Creative Career",
    path: "/categories/creative-career",
  },
  {
    title: "Creativity & Inspiration",
    path: "/theme-demo",
  },
  {
    title: "Design",
    path: "/categories/design",
  },
  {
    title: "Development",
    path: "/categories/development",
  },
  {
    title: "Film & Video",
    path: "/categories/film-video",
  },
];

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
      title: "Our Blog",
      path: "/blog",
    },
    {
      title: "About us",
      path: "/about",
    },
    {
      title: "FAQ",
      path: "/fetch-data",
    },
  ],
};

function DropDownMenu({ open, anchorEl, handleCloseDropDown, isMobile }) {
  return isMobile ? (
    <MobileDropDownMenu
      open={open}
      onClose={handleCloseDropDown}
      categories_data={categories_data}
      MENU_DATA={MENU_DATA}
    />
  ) : (
    <DesktopDropDownMenu
      open={open}
      anchorEl={anchorEl}
      onClose={handleCloseDropDown}
      categories_data={categories_data}
      MENU_DATA={MENU_DATA}
    />
  );
}

export default DropDownMenu;
