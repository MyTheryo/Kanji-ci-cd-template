import { ImagePath } from "../../../Constant";
import Image from "next/image";
import Link from "next/link";

const CommonLogo = ({ alignLogo }) => {
  return (
    <Link className={`logo ${alignLogo ? alignLogo : ""}`} href={`/user/home`}>
      <Image
        width={146}
        height={37}
        className="img-fluid"
        src={`${ImagePath}/logo-main.webp`}
        alt="loginpage"
      />
      {/* <Image width={106} height={37} className="for-dark m-auto" src={`${ImagePath}/logo/dark-logo.png`} alt="loginpage" /> */}
    </Link>
  );
};

export default CommonLogo;
