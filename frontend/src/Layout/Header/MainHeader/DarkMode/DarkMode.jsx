import SVG from "../../../../CommonComponent/SVG";
import { Href } from "../../../../Constant/index";
import { useAppDispatch } from "../../../../Redux/Hooks";
import { setMixLayoutType } from "../../../../Redux/Reducers/ThemeCustomizerSlice";
import { useState } from "react";
import { NavLink } from "reactstrap";

const DarkMode = () => {
  const [darkMode, setDarkMode] = useState(false);
  const dispatch = useAppDispatch();
  const handleDarkMode = (value) => {
    if (value) {
      setDarkMode(!darkMode);
      dispatch(setMixLayoutType("dark"));
    } else {
      dispatch(setMixLayoutType("light"));
      setDarkMode(!darkMode);
    }
  };
  return (
    <li className="modes d-flex">
      <NavLink
        className={`dark-mode ${darkMode ? "active" : ""}`}
        href={Href}
        onClick={() => handleDarkMode(!darkMode)}
      >
        <SVG className="svg-color" iconId="Moon" />
      </NavLink>
    </li>
  );
};

export default DarkMode;
