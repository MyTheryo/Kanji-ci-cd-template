import { Href } from "../../../../Constant/index";
import React, { useState } from "react";
import { Maximize } from "react-feather";
import { NavLink } from "reactstrap";

const ZoomInOut = () => {
  const [fullScreen, setFullScreen] = useState(false);
  const fullScreenHandler = (isFullScreen) => {
    setFullScreen(isFullScreen);
    if (isFullScreen) {
      document.documentElement.requestFullscreen();
    } else {
      document?.exitFullscreen();
    }
  };

  return (
    <li className="zoomer">
      <NavLink onClick={() => fullScreenHandler(!fullScreen)} href={Href}>
        <Maximize className="svg-color" />
      </NavLink>
    </li>
  );
};

export default ZoomInOut;
