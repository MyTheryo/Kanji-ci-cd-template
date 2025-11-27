import { CardHeader } from "reactstrap";

const CardHeaderCommon = ({ title, span, headClass, icon, tagClass }) => {
  return (
    <CardHeader className={headClass ? headClass : ""}>
      <h4 className={tagClass ? tagClass : "mb-0"}>
        {icon && icon}
        {title}
      </h4>
      {span && (
        <p className="desc mb-0 mt-1">
          {span.map((data, index) => (
            <span key={index}>
              {data?.text} {data.code && <code>{data.code}</code>}{" "}
              {data.mark && <mark>{data.mark}</mark>}
            </span>
          ))}
        </p>
      )}
    </CardHeader>
  );
};

export default CardHeaderCommon;
