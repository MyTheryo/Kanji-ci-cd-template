"use client";
import { useState } from "react";
import { Accordion } from "reactstrap";
import CommonAccordionItem from "../Common/CommonAccordionItem";

const SimpleAccordion = ({ acdata }) => {
  const [open, setOpen] = useState("0");

  const toggle = (id) => (open === id ? setOpen() : setOpen(id));

  return (
    <Accordion open={open} toggle={toggle}>
      {acdata?.map((data, index) => (
        <CommonAccordionItem item={data} key={index} />
      ))}
    </Accordion>
  );
};

export default SimpleAccordion;
