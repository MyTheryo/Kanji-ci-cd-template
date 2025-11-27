"use client";
import React, { useState } from "react";
import { Card, CardBody } from "reactstrap";
import { useDispatch } from "react-redux";
//Goals
import { setGoal } from "@/Redux/features/mood/moodSlice";
import { useGetAllGoalQuery } from "@/Redux/features/goals/goalApi";

const GoalSelector = () => {
  const [selectedGoal, setSelectedGoal] = useState("");

  const dispatch = useDispatch();
  const { data: goalData } = useGetAllGoalQuery("", {
    refetchOnMountOrArgChange: true,
  });
  //Goal Selector
  const handleGoalSelect = (goalText, goalEmoji, goalId) => {
    setSelectedGoal(goalId);
    dispatch(
      setGoal({
        goalIcon: goalEmoji,
        goalTitle: goalText,
      })
    );
  };
  return (
    <Card className="Goals">
      <CardBody>
        <div className="img-overlay">
          <h1 className="text-center">Goals</h1>
          <div className="d-flex justify-content-around gap-2 mt-4 overflow-x-auto">
            {goalData && goalData?.goals && goalData?.goals?.length > 0 ? (
              [...goalData?.goals]
                ?.reverse()
                ?.slice(0, 4)
                .map((item, i) => (
                  <div
                    key={i}
                    role="button"
                    className={`d-flex flex-column align-items-center justify-content-center gap-2 p-2 ${
                      selectedGoal === item?._id ? "border" : ""
                    }`}
                    onClick={() =>
                      handleGoalSelect(item?.goalTitle, item?.emoji, item?._id)
                    }
                  >
                    <em-emoji native={item?.emoji} size="3em"></em-emoji>
                    <p className="text-center h6 text-success">
                      {item?.goalTitle}
                    </p>
                  </div>
                ))
            ) : (
              <div className="d-flex align-items-center justify-content-center">
                <p className="text-primary mt-8 font-bold">No Goals Yet</p>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default GoalSelector;
