import React from "react";
import { Modal, Button } from "reactstrap";

// Modal.setAppElement('#__next'); // To prevent screen readers from reading background content

const IdleModal = ({ isOpen, onRequestClose, onResume, onLogout, counter }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Inactivity Warning"
      ariaHideApp={false}
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          padding: "20px",
          textAlign: "center",
        },
      }}
    >
      <h2 className="text-center mt-3">Inactivity Warning</h2>
      <p className="p-2 px-4 text-center">
        You have been inactive. You will be logged out in {counter} seconds
        unless you resume.
      </p>
      <div className="mb-3 mt-4 d-flex justify-content-center gap-3">
        <Button className="btn-success mr-5 p-2" onClick={onResume}>
          Resume
        </Button>
        <Button className="btn-danger ml-5 p-2" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </Modal>
  );
};

export default IdleModal;
