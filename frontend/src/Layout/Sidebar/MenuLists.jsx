import SVG from "../../CommonComponent/SVG";
import SvgIcon from "../../CommonComponent/SVG/SvgIcon";
import { useAppDispatch, useAppSelector } from "../../Redux/Hooks";
import { handlePined, setSidebarClose } from "../../Redux/Reducers/LayoutSlice";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "reactstrap";

const MenuLists = ({ menu, setActiveMenu, activeMenu, level, className }) => {
  const { pinedMenu } = useAppSelector((state) => state.layout);
  const { t } = useTranslation("common");

  const { sidebarClose } = useAppSelector((state) => state.layout);

  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const ActiveNavLinkUrl = (path) => {
    return pathname === path ? true : "";
  };
  const shouldSetActive = ({ item }) => {
    var returnValue = false;
    if (item?.path === pathname) returnValue = true;
    if (!returnValue && item?.children) {
      item?.children.every((subItem) => {
        returnValue = shouldSetActive({ item: subItem });
        return !returnValue;
      });
    }
    return returnValue;
  };
  const handleClick = (item) => {
    const temp = activeMenu;
    temp[level] = item !== temp[level] ? item : "";
    setActiveMenu([...temp]);
    if (window.innerWidth <= 1199) {
      dispatch(setSidebarClose(!sidebarClose));
    }
  };
  useEffect(() => {
    menu?.forEach((item) => {
      let gotValue = shouldSetActive({ item });
      if (gotValue) {
        let temp = [...activeMenu];
        temp[level] = item.title;
        setActiveMenu(temp);
      }
    });
  }, []);
  return (
    <>
      {menu?.map((item, index) => (
        <li
          key={index}
          className={`${level === 0 ? "sidebar-list" : ""} ${
            pinedMenu.includes(item.title || "") ? "pined" : ""
          } ${
            (item.children
              ? item.children
                  .map((innerItem) => ActiveNavLinkUrl(innerItem.path))
                  .includes(true)
              : ActiveNavLinkUrl(item.path)) || activeMenu[level] === item.title
              ? "active"
              : ""
          } `}
        >
          {level === 0 && (
            <SVG
              className="pinned-icon"
              iconId="Pin"
              onClick={() => dispatch(handlePined(item.title))}
            />
          )}
          <Link
            className={`${
              !className
                ? "sidebar-link sidebar-title"
                : item.type === "sub"
                ? "submenu-title"
                : ""
            } 
            ${
              (item.children
                ? item.children
                    .map((innerItem) => ActiveNavLinkUrl(innerItem.path))
                    .includes(true)
                : ActiveNavLinkUrl(item.path)) ||
              activeMenu[level] === item.title
                ? "active"
                : ""
            }`}
            href={item?.path ? item.path : ""}
            onClick={() => handleClick(item.title)}
          >
            {level === 0 ? (
              <SVG className={`stroke-icon`} iconId={item.icon} />
            ) : (
              level === 1 && <SVG className={`svg-menu`} iconId={"right-3"} />
            )}
            <span>{t(item.title)}</span>
            {item.badge && (
              <Badge pill color="primary">
                {item.badge}
              </Badge>
            )}
            {item.children && (
              <SvgIcon iconId="chevron-right" className="feather" />
            )}
          </Link>
          {item.children && (
            <ul
              className={`${
                level !== 0 ? "according-submenu" : "sidebar-submenu "
              }`}
              style={{
                display: `${
                  (item.children
                    ? item.children
                        .map((innerItem) => ActiveNavLinkUrl(innerItem.path))
                        .includes(true)
                    : ActiveNavLinkUrl(item.path)) ||
                  activeMenu[level] === item.title
                    ? "block"
                    : "none"
                }`,
              }}
            >
              <MenuLists
                menu={item.children}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                level={level + 1}
                className="sidebar-submenu"
              />
            </ul>
          )}
        </li>
      ))}
    </>
  );
};
export default MenuLists;
