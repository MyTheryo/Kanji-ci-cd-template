"use client";

import { PuffLoader } from "react-spinners";

const Loader = () => {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <PuffLoader size={100} color="#082C53" />
    </div>
  );
};

export default Loader;
