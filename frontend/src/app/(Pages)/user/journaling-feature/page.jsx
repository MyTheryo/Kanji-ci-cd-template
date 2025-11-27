"use client";
import React, { useEffect, useState } from "react";
import Breadcrumbs from "../../../../CommonComponent/Breadcrumbs/Breadcrumbs";
import { Container, Button, Card, CardBody } from "reactstrap";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
//creation
import { useCreateMoodMutation } from "@/Redux/features/mood/moodApi";
import { resetState, setMoodDate } from "@/Redux/features/mood/moodSlice";
import HowAreYou from "@/Components/Users/Journaling/HowAreYou";
import GoalSelector from "@/Components/Users/Journaling/GoalSelector";
import AddNotes from "@/Components/Users/Journaling/AddNotes";

const Page = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // Submission / Creation
  const { pageUrl } = useSelector((state) => state.goal);
  const moodData = useSelector((state) => state.mood);
  const [createMood, { isError, isLoading, error, isSuccess }] =
    useCreateMoodMutation();

  const [selectedDate, setSelectedDate] = useState(
    moodData?.date ? moodData.date : new Date()
  );

  const handleSubmit = async () => {
    if (!moodData?.mood) {
      return toast.error("Please select emoji!");
    }

    const date = new Date(
      Date.UTC(
        selectedDate?.getFullYear(),
        selectedDate?.getMonth(),
        selectedDate?.getDate()
      )
    );

    const data = {
      ...moodData,
      date, // Include selected date in the data
    };

    try {
      await createMood(data);
    } catch (error) {
      toast.error("Not created. Please try again!.");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Mood added successfully!");
      router.push("/user/dashboard");
      dispatch(resetState());
    }
    if (isError) {
      toast.error("Something went wrong. Please try again");
    }
  }, [isSuccess, router, isError]);

  return (
    <div>
      <Breadcrumbs mainTitle={"Journaling Feature"} parent={"User"} />
      <Container fluid>
        {/* Display and change today's date */}
        <Card>
          <div className="text-center my-3">
            <h5>
              Date:{" "}
              <DatePicker
                selected={selectedDate}
                maxDate={new Date()} // Disable future dates
                onChange={(date) => {
                  setSelectedDate(date);
                  dispatch(setMoodDate(date));
                }}
                dateFormat="MMMM d, yyyy"
                className="form-control d-inline-block w-auto"
              />
            </h5>
          </div>
        </Card>
        {/* Mood Selector */}
        <HowAreYou />
        {/* Goals Section */}
        <GoalSelector />
        {/* Notes Section */}
        <AddNotes />
        {/* Button */}
        <Card className="notes">
          <CardBody className="d-flex justify-content-center">
            <Button
              color="primary"
              className="btn-lg p-2 w-25"
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? <i className="fa fa-spinner fa-spin"></i> : "Done"}
            </Button>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default Page;
