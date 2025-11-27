const SvgIcon = (props) => {
  return (
    <svg
      className={props.className}
      onClick={props.onClick}
      style={props.style}
    >
      <use
        href={`/assets/svg/feather-icons/feather-sprite.svg#${props.iconId}`}
      ></use>
    </svg>
  );
};

export default SvgIcon;
