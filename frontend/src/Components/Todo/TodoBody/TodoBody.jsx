"use client";
import { Card, CardBody, CardHeader, Col } from "reactstrap";
import { ToDoHeading } from "../../../Constant";
import TodoListBody from "./TodoListBody";
import AddNewTask from "./AddNewTask";
import { useRef } from "react";

const TodoBody = ({
  filter,
  data,
  completedGoalData,
  refetchAllGoals,
  refetchCompletedGoals,
}) => {
  const divRef = useRef(null);
  return (
    <Col xl="9" className="box-col-12">
      <Card>
        <CardHeader>
          <h3 className="mb-0">{ToDoHeading}</h3>
        </CardHeader>
        <CardBody>
          <div className="todo">
            <div ref={divRef} className="todo-list-wrapper custom-scrollbar">
              <div className="todo-list-container">
                {data?.goals?.length < 4 ? (
                  <div className="mark-all-tasks">
                    <AddNewTask divRef={divRef} />
                  </div>
                ) : null}
                <TodoListBody
                  data={data}
                  completedGoalData={completedGoalData}
                  refetchAllGoals={refetchAllGoals}
                  refetchCompletedGoals={refetchCompletedGoals}
                  filter={filter}
                  divRef={divRef}
                />
              </div>
            </div>
            <div className="notification-popup hide">
              <p>
                <span className="task" />
                <span className="notification-text" />
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default TodoBody;
