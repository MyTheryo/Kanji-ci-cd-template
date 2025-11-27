import { ImagePath } from '@/Constant'
import { UserPropsType } from '@/Type/Application/Users/UsersProfile'
import Image from 'next/image'
import { Col, Row } from 'reactstrap'

const CommonProfileHead:React.FC<UserPropsType> = ({ activeTime ,image}) => {
  return (
    <Row>
      <Col sm="8">
        <div className="d-flex">
          <Image width={50} height={50} className="img-thumbnail rounded-circle me-3" src={`${ImagePath}/${image === "1" ? "user" : "avatar" }/${image}.jpg`} alt="GenericPlaceholder" />
          <div className="flex-grow-1 align-self-center">
            <h5 className="mt-0 user-name">{'JOHAN DIO'}</h5>
          </div>
        </div>
      </Col>
      <Col sm="4" className="align-self-center">
        <div className="float-sm-end">
          <small className="font-light">{activeTime}</small>
        </div>
      </Col>
    </Row>
  )
}

export default CommonProfileHead