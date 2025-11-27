import React, { useState } from "react";
import { Input, Row, Col } from "reactstrap";

const CustomTimePicker = ({
  selectedHour,
  selectedMinute,
  selectedPeriod,
  setSelectedHour,
  setSelectedMinute,
  setSelectedPeriod,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleHourChange = (e) => {
    setSelectedHour(parseInt(e.target.value));
  };

  const handleMinuteChange = (e) => {
    setSelectedMinute(parseInt(e.target.value));
  };

  const handlePeriodChange = (e) => {
    setSelectedPeriod(e.target.value);
  };

  return (
    <div>
      <Input
        type="text"
        className="border w-[130px] outline-none px-3 py-[2px] rounded-sm"
        onClick={() => setShowPicker(!showPicker)}
        value={`${selectedHour}:${selectedMinute} ${selectedPeriod}`}
        readOnly
      />
      {showPicker && (
        <div className="absolute z-10 mt-1 bg-white border rounded shadow-lg p-3">
          <Row className="mb-2">
            {/* Hour Picker */}
            <Col xs={12}>
              <label className="form-label">Hour</label>
              <Input
                type="select"
                value={selectedHour}
                onChange={handleHourChange}
              >
                {[...Array(12).keys()].map((hour) => (
                  <option key={hour} value={hour === 0 ? 12 : hour}>
                    {hour === 0 ? 12 : hour}
                  </option>
                ))}
              </Input>
            </Col>
          </Row>

          <Row className="mb-2">
            {/* Minute Picker */}
            <Col xs={12}>
              <label className="form-label">Minute</label>
              <Input
                type="select"
                value={selectedMinute}
                onChange={handleMinuteChange}
              >
                {[...Array(60).keys()].map((minute) => (
                  <option key={minute} value={minute}>
                    {minute < 10 ? `0${minute}` : minute}
                  </option>
                ))}
              </Input>
            </Col>
          </Row>

          <Row>
            {/* Period Picker */}
            <Col xs={12}>
              <label className="form-label">Period</label>
              <Input
                type="select"
                value={selectedPeriod}
                onChange={handlePeriodChange}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </Input>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default CustomTimePicker;
