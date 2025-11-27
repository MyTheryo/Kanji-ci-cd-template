"use client";
import React, { useEffect, useState } from "react";
import Breadcrumbs from "../../../../../CommonComponent/Breadcrumbs/Breadcrumbs";
import { Container, Button, Card, CardBody } from "reactstrap";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
//creation
import { useUpdateMoodMutation } from "@/Redux/features/mood/moodApi";
import { resetState, setMoodDate } from "@/Redux/features/mood/moodSlice";
import HowAreYou from "@/Components/Users/Journaling/HowAreYou";
import GoalSelector from "@/Components/Users/Journaling/GoalSelector";
import AddNotes from "@/Components/Users/Journaling/AddNotes";
import Loader from "@/Components/Loader";

const Page = () => {
  const router = useRouter();

  const dispatch = useDispatch();

  const moodData = useSelector((state) => state.mood);
  const [updateMood, { isError, isLoading, data, error, isSuccess }] =
    useUpdateMoodMutation();
  const params = useParams();

  const moodId = params?.moodId;

  const utcDate = moodData?.date ? moodData.date : new Date();
  const date = new Date(utcDate);

  // Manually set the date to ensure it displays correctly
  const localDate = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );

  const [selectedDate, setSelectedDate] = useState(localDate);

  const handleSubmit = async () => {
    const date = new Date(
      Date.UTC(
        selectedDate?.getFullYear(),
        selectedDate?.getMonth(),
        selectedDate?.getDate()
      )
    );
    try {
      const data = {
        ...moodData,
        date,
      };
      // moodId is already defined and available in your scope
      await updateMood({ moodId, data });
    } catch (error) {
      toast.error("Not Updated. Please try again!");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Mood updated successfully!");
      router.push("/user/dashboard");
      dispatch(resetState());
    }
    if (isError) {
      toast.error("Something went wrong. Please try again");
    }
  }, [isSuccess, router, isError, dispatch]);

  // Display Loader if loading
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      <Breadcrumbs mainTitle={"Journaling Feature"} parent={"User"} />
      <Container fluid>
        {/* Display and change date */}
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
            >
              Update
            </Button>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default Page;
