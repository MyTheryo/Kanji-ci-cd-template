"use client";
import { Container, Row } from "reactstrap";
import { Apps, ToDoHeading } from "../../Constant";
import TodoSidebar from "./TodoSideber/TodoSidebar";
import TodoBody from "./TodoBody/TodoBody";
import Breadcrumbs from "../../CommonComponent/Breadcrumbs/Breadcrumbs";

const TodoContainer = () => {
  return (
    <>
      <Breadcrumbs mainTitle={ToDoHeading} parent={Apps} />
      <Container fluid className="email-wrap bookmark-wrap todo-wrap">
        <Row>
          <TodoSidebar />
          <TodoBody />
        </Row>
      </Container>
    </>
  );
};

export default TodoContainer;
