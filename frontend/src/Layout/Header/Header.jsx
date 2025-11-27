import { ImagePath } from "../../Constant/index";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import MainHeader from "./MainHeader/MainHeader";
import CloseButton from "./CloseButton/CloseButton";

const Header = ({ session }) => {
  return (
    <header className="page-header row">
      <div className="logo-wrapper d-flex align-items-center col-auto">
        <Link
          href={`/${
            session?.user?.userRole == "Provider"
              ? "provider/home"
              : session?.user?.userRole == "Patient"
              ? "user/home"
              : "admin/all-users"
          }`}
        >
          <Image
            width={136}
            height={37}
            className="for-dark"
            src={`${ImagePath}/logo-main.webp`}
            alt="logo"
          />
          <Image
            width={136}
            height={37}
            className="for-light"
            src={`${ImagePath}/logo-main.webp`}
            alt="logo"
          />
        </Link>
        {session?.user?.userRole !== "Admin" && <CloseButton />}
      </div>
      <MainHeader session={session} />
    </header>
  );
};

export default Header;
