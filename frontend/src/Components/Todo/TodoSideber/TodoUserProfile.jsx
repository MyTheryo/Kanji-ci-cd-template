import { ImagePath } from "../../../Constant";
import Image from "next/image";

const TodoUserProfile = () => {
  return (
    <div className="d-flex align-items-center flex-wrap">
      <div className="media-size-email">
        <Image
          width={40}
          height={40}
          className="me-3 img-40 rounded-circle"
          src={`${ImagePath}/avatar/1.jpg`}
          alt="avatar"
        />
      </div>
      <div className="flex-grow-1">
        <h6 className="f-w-600">{"Mark Jecno"}</h6>
        <p>{"Markjecno@gmail.com"}</p>
      </div>
    </div>
  );
};

export default TodoUserProfile;
