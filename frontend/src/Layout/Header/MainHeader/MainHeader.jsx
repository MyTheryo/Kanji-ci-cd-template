import React from "react";
import { Col } from "reactstrap";
// import SearchInput from "./SearchInput";
import DarkMode from "./DarkMode/DarkMode";
// import ZoomInOut from "./ZoomInOut/ZoomInOut";
import UserProfile from "./UserProfile/UserProfile";

const MainHeader = ({ session }) => {
  return (
    <Col className="page-main-header">
      {/* Commenting out the SearchInput component because to use it in v2 */}
      {/* {session?.user?.userRole !== "Admin" ? (
        <SearchInput userRole={session?.user?.userRole} />
      ) : (
        <div></div>
      )} */}
      <div className="nav-left"></div>
      <div className="nav-right">
        <ul className="header-right">
          <DarkMode />
          {/* <ZoomInOut /> */}
          <UserProfile session={session} />
        </ul>
      </div>
    </Col>
  );
};

export default MainHeader;
