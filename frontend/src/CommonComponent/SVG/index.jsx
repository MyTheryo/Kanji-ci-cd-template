import React from "react";

const SVG = ({ iconId, className, style, onClick }) => {
  return (
    <svg className={className} style={style} onClick={onClick}>
      <use href={`/assets/svg/iconly-sprite.svg#${iconId}`}></use>
    </svg>
  );
};

export default SVG;
