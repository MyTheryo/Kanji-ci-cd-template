import { Badge, Button, Nav, NavItem } from "reactstrap";
import { Completed, Pending, ToDoList } from "../../../Constant";
import { sideBartList } from "../../../Data/Application/Todo/Todo";
import SvgIcon from "../../../CommonComponent/SVG/SvgIcon";

const TodoNavBar = ({ onFilterChange, filter, data, completedGoalData }) => {
  return (
    <Nav className="main-menu d-flex flex-column gap-2">
      <NavItem>
        <Button color="primary" block className="bg-primary btn-mail w-100">
          <SvgIcon className="feather me-2" iconId="check-circle" />
          {ToDoList}
        </Button>
      </NavItem>
      {sideBartList.map((item, i) => (
        <NavItem
          key={i}
          onClick={() => onFilterChange(item.tittle)}
          role="button"
          className={
            filter === item.tittle ? "active bg-light p-2 rounded" : "mx-2"
          }
        >
          <a
            // href={Href}
            className="d-flex justify-content-between align-items-center"
          >
            <div>
              <span className={`iconbg badge-light-${item.color} rounded p-2`}>
                <SvgIcon iconId={item.icon} className="feather" />
              </span>
              <span className="title ms-2 font-white">{item.tittle}</span>
            </div>
            <Badge
              pill
              color={item.tittle === "In Process" ? "primary" : item.color}
              className="text-white"
            >
              {item.tittle === Completed && completedGoalData?.goals?.length}
              {item.tittle === Pending && data?.goals?.length}
            </Badge>
          </a>
        </NavItem>
      ))}
    </Nav>
  );
};

export default TodoNavBar;
