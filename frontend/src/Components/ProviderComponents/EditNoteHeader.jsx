import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
} from "reactstrap";
import { useDispatch } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomTimePicker from "../CustomTimePicker";
import { format } from "date-fns";
import {
  updateTitle,
  updateNotes,
  updateDate,
  updateTime,
} from "@/Redux/features/notes/notesSlice";

const EditNoteHeader = ({ time, date, title, setShowHeader }) => {
  const dispatch = useDispatch();
  const [noteTitle, setNoteTitle] = useState(title);
  const [selectedDate, setSelectedDate] = useState(new Date(date));
  const [selectedHour, setSelectedHour] = useState(time.selectedHour);
  const [selectedMinute, setSelectedMinute] = useState(time.selectedMinute);
  const [selectedPeriod, setSelectedPeriod] = useState(time.selectedPeriod);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const updateNoteHandler = () => {
    dispatch(updateTitle(noteTitle));
    dispatch(updateDate(selectedDate));
    dispatch(updateTime({ selectedHour, selectedMinute, selectedPeriod }));
    setShowHeader(false);
  };

  return (
    <Modal isOpen={true} toggle={() => setShowHeader(false)} centered>
      <ModalHeader toggle={() => setShowHeader(false)}>
        About this Note
      </ModalHeader>
      <ModalBody>
        <div className="d-flex align-items-center mb-3">
          <Label for="noteTitle" className="me-2">
            Note Title:
          </Label>
          <Input
            id="noteTitle"
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Note Title"
          />
        </div>
        <div className="mb-3">
          <Label className="me-2">Date & Time:</Label>
          <div className="d-flex flex-column">
            <Input
              type="text"
              value={format(new Date(selectedDate), "M/d/yyyy")}
              onClick={() => setShowDatePicker(!showDatePicker)}
              readOnly
              className="mb-2"
            />
            {showDatePicker && (
              <div className="calendar-container">
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  inline
                />
              </div>
            )}
            <div className="d-flex align-items-center">
              <span className="me-2">at</span>
              <CustomTimePicker
                selectedHour={selectedHour}
                selectedMinute={selectedMinute}
                selectedPeriod={selectedPeriod}
                setSelectedHour={setSelectedHour}
                setSelectedMinute={setSelectedMinute}
                setSelectedPeriod={setSelectedPeriod}
              />
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="success" onClick={updateNoteHandler}>
          Update Note Header
        </Button>
        <Button color="danger" onClick={() => setShowHeader(false)}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditNoteHeader;
