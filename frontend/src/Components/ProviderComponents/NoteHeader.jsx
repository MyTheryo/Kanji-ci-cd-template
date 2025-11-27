"use client";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateDuration, updateService } from "@/Redux/features/notes/notesSlice";
import { useSession } from "next-auth/react";
import EditNoteHeader from "./EditNoteHeader"; // Assume you have a component for editing
import { Container, Row, Col, Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, FormGroup, Label, Input } from 'reactstrap';

const NoteHeader = ({ title, date, time, patientName, showEdit }) => {
  const dispatch = useDispatch();
  const durationsDate = ["15 min", "30 min", "45 min", "60 min"];
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const { duration, service } = useSelector((state) => state.notes);
  const { data: session } = useSession();

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleDuration = (value) => {
    dispatch(updateDuration(value));
    setDropdownOpen(false);
  };

  const handleService = (value) => {
    dispatch(updateService(value));
  };

  const formatTime = (time) => {
    const hour = time?.selectedHour ? String(time.selectedHour).padStart(2, '0') : '00';
    const minute = time?.selectedMinute ? String(time.selectedMinute).padStart(2, '0') : '00';
    const period = time?.selectedPeriod || '';
    return `${hour}:${minute} ${period}`;
  };

  return (
    <Container fluid className="pb-2">
      <Row>
        <Col md="6">
          <h4 className="mb-2 text-primary">{title}</h4>
          <p>
            Clinician: <b>{session?.user?.firstName} {session?.user?.lastName}</b>
          </p>
          <p>
            Client: <b>{patientName}</b>
          </p>
        </Col>
        <Col md="6">
          <div className="">
            <div className="mb-2">
              <p className="mb-0">Date and Time:</p>
              <span className="text-success">{date}</span>
              <span className="text-success ms-2">{formatTime(time)}</span>
            </div>
            <div className="mb-2">
              <p className="mb-0">Duration:</p>
              <div className="d-flex">
                <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                  <DropdownToggle caret className="border px-2 cursor-pointer">
                    {duration}
                  </DropdownToggle>
                  <DropdownMenu>
                    {durationsDate.map((dur, i) => (
                      <DropdownItem key={i} onClick={() => handleDuration(dur)}>
                        {dur}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
            <div className="mb-2">
              <FormGroup>
                <Label for="service">Service:</Label>
                  <Input
                    type="select"
                    id="service"
                    value={service}
                    onChange={(e) => handleService(e.target.value)}
                    className="w-auto"
                  >
                    <option value="in-person">In Person</option>
                    <option value="tele-service">Tele Service</option>
                  </Input>
              </FormGroup>
            </div>
          </div>
        </Col>
      </Row>
      {
        showEdit && (
          <Row className="mt-2">
            <Col className="text-end">
              <Button color="info" onClick={() => setShowHeader(!showHeader)}>
                <i className="fa fa-pencil-square-o"></i> Edit
              </Button>
            </Col>
          </Row>
        )
      }
      {
        showHeader && (
          <Row>
            <Col>
              <EditNoteHeader
                time={time}
                date={date}
                title={title}
                setShowHeader={setShowHeader}
              />
            </Col>
          </Row>
        )
      }
    </Container >
  );
};

export default NoteHeader;
