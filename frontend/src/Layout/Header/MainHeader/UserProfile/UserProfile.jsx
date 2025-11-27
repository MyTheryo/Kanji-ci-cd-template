import { useEffect, useRef, useState } from "react";
import { ImagePath } from "../../../../Constant/index";
import Image from "next/image";
import UserProfileIcons from "./UserProfileIcons";
import { decodeBase64 } from "@/utils/helpers";

const UserProfile = ({ session }) => {
  const [show, setShow] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside of dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false); // Close the dropdown if clicked outside
      }
    };

    // Add event listener when component mounts
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <li className="profile-dropdown custom-dropdown" ref={dropdownRef}>
      <div
        role="button"
        className="d-flex align-items-center"
        onClick={() => setShow(!show)}
      >
        <Image
          width={45}
          height={45}
          src={session?.user?.avatar?.url || `${ImagePath}/profile.jpg`}
          alt="avatar"
        />
        <div className="flex-grow-1">
          <h5>
            {session?.user?.firstName} {session?.user?.lastName}
          </h5>
          {session?.user?.userRole !== "Admin" && (
            <p>ID: {decodeBase64(session?.user?.customerId)}</p>
          )}
        </div>
      </div>
      <div className={`custom-menu overflow-hidden ${show ? "show" : ""}`}>
        <UserProfileIcons session={session} />
      </div>
    </li>
  );
};

export default UserProfile;
