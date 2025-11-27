import { Col, Row } from "reactstrap";

const ProfileContact = ({userData}) => {
  const userProfileData = [
    {
      icon: "building",
      title: "Status",
      detail: userData?.user?.state || "Not Available", // Display session State
    },
    {
      icon: "envelope",
      title: "Email",
      detail: userData?.user?.email || "Not Available", // Display session email
    },
    {
      icon: "phone",
      title: "Contact",
      detail: userData?.user?.phoneNumber || "Not Available", // Display session phoneNumber
    },
    {
      icon: "location-arrow",
      title: "Address",
      detail: userData?.user?.address || "Not Available", // Display session address
    },
  ];
  return (
    <Col sm="6" lg="6" xl="4" className="order-sm-2 order-xl-2">
      <Row>
        {userProfileData.slice(2, 4).map((data, i) => (
          <Col md="6" key={i}>
            <div className="ttl-info text-start">
              <h6>
                <i className={`fa fa-${data.icon}`} /> {data.title}
              </h6>
              <span>{data.detail}</span>
            </div>
          </Col>
        ))}
      </Row>
    </Col>
  );
};

export default ProfileContact;
