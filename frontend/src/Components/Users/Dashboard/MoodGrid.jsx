import React from "react";

import { daysInMonth, dayIndex } from "@/utils/helpers";

const getMonths = (days, activeDay, setActiveDay, moods) => {
  const monthsInitials = [
    "J",
    "F",
    "M",
    "A",
    "M",
    "J",
    "J",
    "A",
    "S",
    "O",
    "N",
    "D",
  ];
  return monthsInitials.map((initial, i) => {
    const year = 2024;
    const month = i;
    const noOfDaysInMonth = daysInMonth(year, month);
    return (
      <div key={i} data-month={initial} className="item month">
        <span className="monthes">{initial}</span>
        {Array(noOfDaysInMonth)
          .fill()
          .map((_, j) => {
            const date = new Date(year, month, j + 2);
            const day = dayIndex(
              date.getFullYear(),
              date.getMonth(),
              date.getDate()
            );
            const dataMood = days[day];
            const isActive = activeDay.find((moodDay) => moodDay.date === day);
            let color = isActive ? isActive.color : "";
            return <button key={j} style={{ backgroundColor: color }} />;
          })}
      </div>
    );
  });
};

const getDays = () => {
  return Array(32)
    .fill()
    .map((_, i) => {
      return (
        <span key={i} className="day">
          {i}
        </span>
      );
    });
};

const MoodGrid = ({ days, activeDay, setActiveDay, moods }) => {
  return (
    <div id="moodGrid" className=" w-100  d-flex justify-content-between">
      {/* d-flex justify-content-between */}
      <div className="item">
        <div className="days">{getDays()}</div>
      </div>
      {getMonths(days, activeDay, setActiveDay, moods)}
    </div>
  );
};

export default MoodGrid;
