import { MenuList, ProviderMenuList } from "../../Data/Layout/Sidebar";
import { useAppSelector } from "../../Redux/Hooks";
import { Fragment, useEffect, useState } from "react";
import MenuLists from "./MenuLists";
import { useTranslation } from "react-i18next";
import { getSession } from "next-auth/react";
import Gleap from "gleap";

const SidebarMenuList = () => {
  const [activeMenu, setActiveMenu] = useState([]);
  const [menuData, setMenuData] = useState(); // Default to empty
  const { pinedMenu } = useAppSelector((state) => state.layout);
  const [gleapInitialized, setGleapInitialized] = useState(false);

  const { t } = useTranslation("common");

  // Function to hide menu items based on user role
  const shouldHideMenu = (mainMenu) => {
    return mainMenu?.Items?.map((data) => data.title).every((titles) =>
      pinedMenu.includes(titles || "")
    );
  };

  useEffect(() => {
    const fetchSession = async () => {
      // Fetch the session from NextAuth
      const session = await getSession();

      // Set menu data based on the user's role
      if (session?.user?.userRole === "Provider") {
        setMenuData(ProviderMenuList);
      } else if (session?.user?.userRole === "Patient") {
        setMenuData(MenuList); // Default to the general MenuList for other users
      }

      // Initialize Gleap (optional functionality)
      const apiKey = process.env.NEXT_PUBLIC_GLEAP_API_KEY;
      if (!gleapInitialized) {
        Gleap.initialize(apiKey);
        setGleapInitialized(true);
      }

      if (session && session?.user) {
        // Identify logged-in user
        Gleap.identify(session?.user?._id || "userId", {
          name: session?.user?.firstName || "Logged User",
          email: session?.user?.email || "email@domain.com",
        });
      } else {
        // Identify guest user
        Gleap.identify("guest", {
          name: "Guest User",
        });
      }

      // Disable notifications for both logged-in and guest users
      Gleap.setDisableInAppNotifications(true);
      // Gleap.showFeedbackButton(false); // Ensure feedback button is hidden
    };

    fetchSession();

    return () => {
      Gleap.clearIdentity(true); // Clear identity on unmount
    };
  }, [gleapInitialized]);

  return (
    <>
      {menuData &&
        menuData.map((mainMenu, index) => (
          <Fragment key={index}>
            <li className={`line ${index === 0 ? "pin-line" : ""} `}></li>
            <li
              className={`sidebar-main-title ${
                shouldHideMenu(mainMenu) ? "d-none" : ""
              }`}
            >
              {t(mainMenu.title)}
            </li>
            <MenuLists
              menu={mainMenu.Items}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              level={0}
            />
          </Fragment>
        ))}
    </>
  );
};

export default SidebarMenuList;
