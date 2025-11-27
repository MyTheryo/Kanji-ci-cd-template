"use client";
import { Card, Col } from "reactstrap";
import ProfileDetail from "./ProfileDetail";
import Image from "next/image";
import { ImagePath } from "../../../../Constant";
import Link from "next/link";
import YourTeam from "../../../../Components/InvitedDoctors";
import { useSession } from "next-auth/react";

const Profile = () => {
  const { data: session, status, update } = useSession();
  const isProvider = session?.user.userRole === "Provider"; // Check for provider role

  return (
    <Col sm="12">
      <Card className="hovercard text-center" style={{ marginTop: "60px" }}>
        {/* <div className="cardheader" /> */}
        <div className="user-image">
          <div className="avatar">
            <Image
              width={100}
              height={100}
              src={session?.user?.avatar?.url || `${ImagePath}/profile.jpg`} // Display user's avatar or fallback image
              alt="profile"
            />
          </div>
          <Link className="icon-wrapper" href={"/profile/edit-profile"}>
            <i className="icofont icofont-pencil-alt-5" />
          </Link>
        </div>
        <ProfileDetail session={session} />
        <hr />
        {!isProvider && <YourTeam />}
      </Card>
    </Col>
  );
};

export default Profile;
