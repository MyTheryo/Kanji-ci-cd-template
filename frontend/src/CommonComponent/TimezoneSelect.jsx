import React, { useState, useEffect, useMemo } from "react";
import { timezoneData } from "@/data";
// import moment from "moment-timezone";

const TimezoneSelect = ({ timeZone, onTimeZoneSelect }) => {
  const [selectedZone, setSelectedZone] = useState(
    process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || ""
  );

  const handleChange = (event) => {
    const newZone = event.target.value;
    setSelectedZone(newZone);
    if (onTimeZoneSelect) {
      onTimeZoneSelect(newZone);
    }
  };

  return (
    <div>
      <select
        value={timeZone}
        onChange={handleChange}
        name="timeZone"
        id="timeZone"
        aria-label="Select Timezone"
        className="form-select px-4 py-2 rounded-lg border"
      >
        <option value="">Not Set (Use Browser Timezone)</option>
        {timezoneData.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimezoneSelect;
