import { Label, ListInlineItem } from "reactstrap";
import CountUp from 'react-countup';
import { Comments, Href, Like } from "@/Constant";
import { iconListType } from "@/Type/Application/Users/UsersProfile";
import Link from "next/link";

const IconList:React.FC<iconListType> = ({like,endNumber}) => {
  return (
    <ListInlineItem className={`${like ? "border-right pe-3" : "ms-2"}`} >
      <Label className="m-0">
        <Link href={Href}>
          <i className={like?"fa fa-heart pe-2":"fa fa-comment pe-2"} />
        </Link>
        {like ? Like : Comments}
      </Label>
      <span className="ms-2 counter">
        <CountUp end={endNumber} duration={5} />
      </span>
    </ListInlineItem>
  );
};

export default IconList;
