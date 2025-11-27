"use client";
import React from "react";
import { setNotes } from "@/Redux/features/mood/moodSlice";
import { Card, CardBody } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";

const AddNotes = () => {
  const dispatch = useDispatch();
  const notes = useSelector((state) => state?.mood?.notes);
  return (
    <Card className="notes">
      <CardBody>
        <div className="img-overlay">
          <h1 className="text-center">Notes</h1>
          <div className="d-flex flex-column justify-content-center align-items-center gap-4 mt-4">
            <textarea
              className="form-control d-flex w-100"
              aria-label="With textarea"
              placeholder="Add notes"
              name="notes"
              id="notes"
              rows="10"
              value={notes}
              onChange={(e) => dispatch(setNotes(e.target.value))}
            ></textarea>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default AddNotes;
