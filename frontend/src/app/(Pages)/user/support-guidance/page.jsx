"use client";
import React, { useState } from "react";
import Breadcrumbs from "../../../../CommonComponent/Breadcrumbs/Breadcrumbs";
import { Row, Container } from "reactstrap";
import TodoSidebar from "../../../../Components/Todo/TodoSideber/TodoSidebar";
import TodoBody from "../../../../Components/Todo/TodoBody/TodoBody";
//NewTodoCode
import {
  useGetAllGoalQuery,
  useGetCompletedGoalQuery,
} from "@/Redux/features/goals/goalApi";
import Loader from "@/Components/Loader";
const page = () => {
  const [filter, setFilter] = useState("");

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  //NewTodoCode
  const {
    data,
    isLoading,
    refetch: refetchAllGoals,
  } = useGetAllGoalQuery("", {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: completedGoalData,
    isLoading: completedGoalLoading,
    refetch: refetchCompletedGoals,
  } = useGetCompletedGoalQuery({
    refetchOnMountOrArgChange: true,
  });

  if (isLoading || completedGoalLoading) {
    return <Loader />;
  }
  return (
    <div>
      <Breadcrumbs mainTitle={"Goals & Exercises"} parent={"User"} />
      <Container fluid>
        <Row>
          <TodoSidebar
            data={data}
            completedGoalData={completedGoalData}
            onFilterChange={handleFilterChange}
            filter={filter}
          />
          <TodoBody
            data={data}
            completedGoalData={completedGoalData}
            refetchAllGoals={refetchAllGoals}
            refetchCompletedGoals={refetchCompletedGoals}
            filter={filter}
          />
        </Row>
      </Container>
    </div>
  );
};

export default page;
