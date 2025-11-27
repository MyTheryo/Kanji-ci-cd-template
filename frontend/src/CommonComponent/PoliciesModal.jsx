import React from "react";
import CommonModal from "./Common/CommonModal";
import { Button } from "reactstrap";

const PoliciesModal = ({ onClose, title, content }) => {
  return (
    <CommonModal centered isOpen={true} toggle={onClose}>
      <div>
        <div className="">
          <div className="">
            <div className="p-6">
              {" "}
              <div className="d-flex justify-content-between align-items-center w-full z-10">
                <h2 className="text-center text-2xl text-md font-bold">
                  {title}
                </h2>
                <Button
                  type="button"
                  className="close closemodal btn-danger"
                  onClick={onClose}
                >
                  X
                </Button>
              </div>
              <hr />
              {content}
            </div>
            <div className="mt-2 d-flex justify-content-end">
              <button onClick={onClose} className="px-5 mr-3 btn btn-primary">
                {title === "Terms of Use" ? "Accept" : "Close"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </CommonModal>
  );
};

export default PoliciesModal;
