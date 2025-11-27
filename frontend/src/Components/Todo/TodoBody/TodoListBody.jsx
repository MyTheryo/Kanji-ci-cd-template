"use client";
import { useState } from "react";
import TodoListFooter from "./TodoListFooter";
import { useAppDispatch } from "../../../Redux/Hooks";
import { toast } from "react-toastify";
import { Badge } from "reactstrap";
import { setVisible } from "../../../Redux/Reducers/ToDoSlice";
import { useDeleteGoalMutation } from "@/Redux/features/goals/goalApi";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const TodoListBody = ({
  filter,
  data,
  completedGoalData,
  refetchAllGoals,
  refetchCompletedGoals,
  divRef,
}) => {
  const dispatch = useAppDispatch();
  const [isUpdating, setIsUpdating] = useState(false);
  const [goalId, setGoalId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [deleteGoal, { isSuccess, isError }] = useDeleteGoalMutation();

  const filteredData = filter
    ? filter == "All Goals"
      ? [completedGoalData?.goals, data?.goals].flat().reverse()
      : filter.toLowerCase() == "goals"
      ? [...data?.goals]?.reverse()
      : [...completedGoalData?.goals]?.reverse()
    : [completedGoalData?.goals, data?.goals].flat().reverse();

  const handleEditGoal = (item) => {
    setIsUpdating(true);
    setGoalId(item._id);
    dispatch(setVisible(true));
    if (divRef.current) {
      divRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCompleteGoal = async (id) => {
    const res = await deleteGoal(id);
    if (res?.data?.success) {
      toast.success("Goal completed");
      refetchAllGoals();
      refetchCompletedGoals();
    } else {
      toast.error("Can not complete goal.Please try again");
    }
    setGoalId(null);
    setOpenModal(false);
  };

  return (
    <div className="todo-list-body">
      <TodoListFooter
        isUpdatingGoal={isUpdating}
        setIsUpdatingGoal={setIsUpdating}
        goalId={goalId}
        refetchAllGoals={refetchAllGoals}
        refetchCompletedGoals={refetchCompletedGoals}
      />
      <ul id="todo-list">
        {filteredData?.map((item, i) => (
          <li
            className={`task ${item?.isDeleted === true ? "achieved" : ""}`}
            key={i}
          >
            <div className="task-container">
              <div className="d-flex align-items-center justify-content-start gap-2">
                <h4>{item?.emoji}</h4>
                <h4 className="task-label pt-0">{item?.goalTitle}</h4>
              </div>
              <div className="d-flex align-items-center gap-4">
                <Badge
                  color={
                    item?.isDeleted !== true ? "light-danger" : "light-success"
                  }
                >
                  {item?.isDeleted === false ? "Pending" : "Achieved"}
                </Badge>
                {item?.isDeleted === false ? (
                  <span className="task-action-btn">
                    <span
                      className="action-box large delete-btn"
                      title="Edit Goal"
                    >
                      <i className="icon">
                        <i
                          className="icon-pencil"
                          onClick={() => handleEditGoal(item)}
                        />
                      </i>
                    </span>
                    <span
                      className="action-box large complete-btn"
                      title="Mark Complete"
                    >
                      <i className="icon">
                        <i
                          className="icon-check"
                          onClick={() => {
                            setGoalId(item._id);
                            setOpenModal(true);
                          }}
                        />
                      </i>
                    </span>
                  </span>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Modal isOpen={openModal} toggle={() => setOpenModal(false)}>
        <ModalHeader toggle={() => setOpenModal(false)}>Achieve</ModalHeader>
        <ModalBody>Are you sure you want to Achieve this Goal?</ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={() => setOpenModal(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={() => handleCompleteGoal(goalId)}>
            Achieve
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default TodoListBody;
