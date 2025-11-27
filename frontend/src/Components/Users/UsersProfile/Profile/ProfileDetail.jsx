import { Row } from "reactstrap";
import ProfileMail from "./ProfileMail";
import ProfileName from "./ProfileName";
import ProfileContact from "./ProfileContact";

const ProfileDetail = ({session}) => {
  return (
    <div className="info">
      <Row>
        <ProfileMail userData={session} />
        <ProfileName userData={session} />
        <ProfileContact userData={session} />
      </Row>
    </div>
  );
};

export default ProfileDetail;
