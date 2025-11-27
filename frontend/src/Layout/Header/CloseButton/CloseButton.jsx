import { Href } from "../../../Constant/index";
import { useAppDispatch, useAppSelector } from "../../../Redux/Hooks";
import { setSidebarClose } from "../../../Redux/Reducers/LayoutSlice";
import React from "react";
import { NavLink } from "reactstrap";

const CloseButton = () => {
  const { sidebarClose } = useAppSelector((state) => state.layout);
  const dispatch = useAppDispatch();
  return (
    <NavLink
      className="close-btn"
      href={Href}
      onClick={() => dispatch(setSidebarClose(!sidebarClose))}
    >
      <div className={`toggle-sidebar ${sidebarClose ? "close" : ""}`}>
        <div className="line" />
        <div className="line" />
        <div className="line" />
      </div>
    </NavLink>
  );
};

export default CloseButton;
