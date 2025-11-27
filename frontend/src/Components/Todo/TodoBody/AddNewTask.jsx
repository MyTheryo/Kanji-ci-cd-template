import { useAppDispatch, useAppSelector } from "../../../Redux/Hooks";
import { setVisible } from "../../../Redux/Reducers/ToDoSlice";
import { AddNewTaskHeading } from "../../../Constant";
import { Button } from "reactstrap";

const AddNewTask = ({ divRef }) => {
  const { visible } = useAppSelector((state) => state.todo);
  const dispatch = useAppDispatch();
  return (
    <div className="todo-list-footer">
      <div className="add-task-btn-wrapper">
        <span className="add-task-btn">
          <Button
            color="primary"
            onClick={() => {
              dispatch(setVisible(!visible));
              if (divRef.current) {
                divRef.current.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <i className="icon-plus" /> {AddNewTaskHeading}
          </Button>
        </span>
      </div>
    </div>
  );
};

export default AddNewTask;
