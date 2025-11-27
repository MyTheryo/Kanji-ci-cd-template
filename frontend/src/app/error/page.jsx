"use client";
import { errorFourSvgData } from "../../Data/OtherPage/OtherPage";
import CommonError from "../../Components/Error/Common/CommonError";

const page = () => {
  return <CommonError errorSvg={errorFourSvgData} />;
};

export default page;
