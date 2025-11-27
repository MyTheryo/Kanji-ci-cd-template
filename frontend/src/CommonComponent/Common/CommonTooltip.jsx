import React, { useState } from "react";
import { Tooltip } from "reactstrap";

const CommonTooltip = ({ placement, target, item }) => {
  const [tooltip, setTooltip] = useState(false);
  const toggle = () => setTooltip(!tooltip);
  return (
    <Tooltip
      placement={placement}
      isOpen={tooltip}
      target={"Tooltip-" + target}
      toggle={toggle}
      autohide={false}
    >
      {item}
    </Tooltip>
  );
};

export default CommonTooltip;
