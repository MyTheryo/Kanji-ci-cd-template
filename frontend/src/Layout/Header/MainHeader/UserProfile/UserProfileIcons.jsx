import SVG from "../../../../CommonComponent/SVG";
import { userProfilesData } from "../../../../Data/Layout/HeaderData";
import Link from "next/link";
import React from "react";
import Cookies from "js-cookie";
import { Href, Logout } from "../../../../Constant/index";
import { LogOut } from "react-feather";
import { signOut } from "next-auth/react";
import { useLogOutMutation } from "@/Redux/features/auth/authApi"; // Assuming logOut mutation is part of your RTK Query slice

const UserProfileIcons = ({ session }) => {
  const [logOut, { isLoading: logoutLoading, error }] = useLogOutMutation();
  const handleClick = async () => {
    Cookies.remove("edmin_login");
    // Call your logOut mutation to update the backend
    await logOut();
    localStorage.clear();
    sessionStorage.removeItem("sessionActive");
    signOut({ redirect: true, callbackUrl: "/auth/login" });
  };
  return (
    <ul>
      {session?.user?.userRole !== "Admin" &&
        userProfilesData.map((item, i) => (
          <li className="d-flex" key={i}>
            <Link href={item.link}>
              <SVG className="svg-color me-2" iconId={item.icon} />
              {item.title}
            </Link>
          </li>
        ))}
      <li onClick={handleClick} className="d-flex">
        <Link href={Href} scroll={false}>
          <LogOut />
          <span className="ms-2">{Logout} </span>
        </Link>
      </li>
    </ul>
  );
};

export default UserProfileIcons;
