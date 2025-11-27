"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../Redux/Hooks";
import { setVisible } from "../../../Redux/Reducers/ToDoSlice";
import { AddTaskHeading, Close } from "../../../Constant";
import { Button, CardBody, Card, Badge } from "reactstrap";
import CommonModal from "../../../CommonComponent/Common/CommonModal";

import Picker from "@emoji-mart/react";
import "./ToDoListFooter.css";
import { useRouter } from "next/navigation";

import {
  useCreateGoalMutation,
  useGetSinleGoalQuery,
  useUpdateGoalMutation,
} from "@/Redux/features/goals/goalApi";

const TodoListFooter = ({
  isUpdatingGoal,
  setIsUpdatingGoal,
  goalId,
  refetchAllGoals,
  refetchCompletedGoals,
}) => {
  const { visible } = useAppSelector((state) => state.todo);
  const [
    createGoal,
    { isError: createIsError, isSuccess: createIsSuccess, goalData: data },
  ] = useCreateGoalMutation();
  const { data: singleGoalData } = useGetSinleGoalQuery(goalId, {
    refetchOnMountOrArgChange: true,
  });
  const [updateGoal, { isError: updateIsError, isSuccess: updateIsSuccess }] =
    useUpdateGoalMutation();
  const [seleted, setSelected] = useState("");
  const router = useRouter();
  //Modal
  const [centred, setCentered] = useState(false);
  const centeredToggle = () => setCentered(!centred);

  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState(null);

  const goalsData = [
    {
      text: "Better Sleep",
      emoji: "🛏️",
    },
    {
      text: "Mindful Meditation",
      emoji: "🧘‍♂️",
    },
    {
      text: "Gratitude Journaling",
      emoji: "🙏",
    },
    {
      text: "Deep Breathing",
      emoji: "🧘‍♀️",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      return toast.error("Please enter goal title");
    }
    if (!emoji) {
      return toast.error("Please select Emoji");
    }
    const data = {
      goalTitle: title,
      emoji: emoji,
    };
    if (isUpdatingGoal) {
      await updateGoal({ goalId, data });
    } else {
      await createGoal(data);
    }
  };

  useEffect(() => {
    if (singleGoalData && isUpdatingGoal) {
      setSelected(singleGoalData?.goal?.goalTitle);
      setTitle(singleGoalData?.goal?.goalTitle);
      setEmoji(singleGoalData?.goal?.emoji);
    }
  }, [singleGoalData]);

  useEffect(() => {
    if (createIsSuccess || updateIsSuccess) {
      setIsUpdatingGoal(false);
      setCentered(false);
      dispatch(setVisible(false));
      if (isUpdatingGoal) {
        toast.success("Goal updated successfully");
      } else {
        toast.success("Goal added successfully");
      }
      refetchAllGoals();
      refetchCompletedGoals();
      router.push("/user/support-guidance");
    }
    if (createIsError || updateIsError) {
      toast.error("Can not create goal. please try again.");
    }
  }, [createIsSuccess, createIsError, updateIsSuccess, updateIsError]);

  const handleGoal = (goal) => {
    setTitle(goal.text);
    setEmoji(goal.emoji);
    setSelected(goal.text);
  };

  const dispatch = useAppDispatch();

  return (
    <div className="todo-list-footer">
      <div className={`new-task-wrapper ${visible ? "visible mb-4" : ""}`}>
        <Card>
          <CardBody className="">
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              {goalsData.map((item, i) => (
                <Button
                  className={`d-flex gap-2 align-items-center p-2 border-3 ${
                    seleted == item.text
                      ? "bg-primary border-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => handleGoal(item)}
                >
                  <h3 className="text-white">{item.emoji}</h3>
                  <h5
                    className={`${seleted == item.text ? "text-white" : null}`}
                  >
                    {item.text}
                  </h5>
                </Button>
              ))}
              <Button
                className="d-flex gap-2 align-items-center p-2"
                color="tertiary"
                onClick={() => centeredToggle()}
              >
                <i className="icon-plus" />
                <h5 className="text-white">Create New</h5>
              </Button>
            </div>
          </CardBody>
        </Card>
        <Button
          color="danger"
          className="cancel-btn"
          onClick={() => {
            setIsUpdatingGoal(false);
            dispatch(setVisible(false));
          }}
        >
          {isUpdatingGoal ? "Cancel" : "Close"}
        </Button>
        <Button
          color="success"
          className="ms-3 add-new-task-btn"
          onClick={handleSubmit}
        >
          {isUpdatingGoal ? "Update Goal" : "Add Goal"}
        </Button>
      </div>
      <CommonModal centered isOpen={centred} toggle={centeredToggle}>
        <div className="modal-toggle-wrapper">
          <div className="d-flex justify-content-between items-center">
            <h3>{isUpdatingGoal ? "Update Goal" : "Create New Goal"}</h3>
            <Button color="danger" className="" onClick={centeredToggle}>
              X
            </Button>
          </div>
          <div className="my-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter Goal"
              className="form-control"
            />
            <h5 className="mt-3 text-center">Pick an Emoji</h5>
            <Picker
              theme="auto"
              data={data}
              onEmojiSelect={(e) => {
                setEmoji(e.native);
                toast.success(e.native + " selected");
              }}
            />
          </div>

          <Button
            onClick={handleSubmit}
            color="primary"
            className="d-flex m-auto"
          >
            {isUpdatingGoal ? "Update Goal" : "Add Goal"}
          </Button>
        </div>
      </CommonModal>
    </div>
  );
};

export default TodoListFooter;
