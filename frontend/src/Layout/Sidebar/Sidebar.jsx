import SvgIcon from "../../CommonComponent/SVG/SvgIcon";
import { Pinned } from "../../Constant";
import { useAppDispatch, useAppSelector } from "../../Redux/Hooks";
import { scrollToLeft, scrollToRight } from "../../Redux/Reducers/LayoutSlice";
import React from "react";
import SidebarMenuList from "./SidebarMenuList";

const Sidebar = ({ session }) => {
  const { pinedMenu, margin } = useAppSelector((state) => state.layout);
  const { sidebarIconType, layout } = useAppSelector(
    (state) => state.themeCustomizer
  );
  const dispatch = useAppDispatch();
  return (
    <>
      <div className="overlay"></div>
      <div
        className={`page-sidebar ${sidebarIconType === "Colorfull icon" ? "iconcolor-sidebar" : ""
          }`}
        id="sidebarwrappers"
      >
        <div
          className={`left-arrow ${margin === 0 ? "disabled" : ""}`}
          id="left-arrow"
          onClick={() => dispatch(scrollToLeft())}
        >
          <SvgIcon className="feather" iconId="arrow-left" />
        </div>
        <div
          id="sidebar-menu"
          style={{
            marginLeft: layout === "horizontal-sidebar" ? `${margin}px` : "0px",
          }}
        >
          <ul className="sidebar-menu custom-scrollbar" id="simple-bar">
            <li
              className={`pin-title sidebar-list p-0 ${pinedMenu.length > 1 ? "show" : ""
                }`}
            >
              <h5 className="sidebar-main-title">{Pinned}</h5>
            </li>
            <SidebarMenuList session={session} />
          </ul>
        </div>
        <div
          className={`right-arrow ${margin === -3500 ? "disabled" : ""}`}
          onClick={() => dispatch(scrollToRight())}
        >
          <SvgIcon className="feather" iconId="arrow-right" />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
