import { Col } from "reactstrap";
import { DesignerTitle, Href } from "../../../../Constant";
import Link from "next/link";

const ProfileName = ({userData}) => {
  return (
    <>
      <Col sm="12" lg="12" xl="4" className="order-sm-0 order-xl-1">
        <div className="user-designation">
          <div className="title">
            {userData?.user?.firstName  + ' ' + userData?.user?.lastName}
            {/* <Link href={Href}>{name}</Link> */}
          </div>
          <div className="desc">{userData?.user?.userRole === 'Provider' ? 'Provider' : 'Client'}</div>
        </div>
      </Col>
    </>
  );
};

export default ProfileName;
