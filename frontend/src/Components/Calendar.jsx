"use client";
import React, { useState } from "react";
import Calendar from "react-calendar";
import { toast } from "react-toastify";
import "react-calendar/dist/Calendar.css";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setMoodDate } from "@/Redux/features/mood/moodSlice";
import { setEmoji, setMood } from "@/Redux/features/mood/moodSlice";
import { defaultMoods } from "@/data";

const AiCalendar = ({ calenData }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const router = useRouter();
  const dispatch = useDispatch();

  const handleDateChange = (value) => {
    const today = new Date();

    if (value <= today) {
      // Normalize the selected date to UTC midnight
      // const normalizedDate = new Date(
      //   Date.UTC(value.getFullYear(), value.getMonth(), value.getDate())
      // );

      const normalizedDate = value;

      dispatch(setEmoji(defaultMoods[0].emoji));
      dispatch(setMood(defaultMoods[0].mood));

      router.push(`/user/journaling-feature`);
      dispatch(setMoodDate(normalizedDate)); // Dispatch the normalized date
    } else {
      toast.error("This date is yet to come.");
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      // Normalize the date to UTC midnight
      const normalizedDate = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      ).toISOString(); // Convert to ISO string for exact match

      // Filter moods matching the date string
      const matchingMoods = calenData?.data?.filter(
        (item) => new Date(item?.date).toISOString() === normalizedDate
      );

      if (date <= new Date()) {
        return (
          <div
            className="position-relative"
            style={{
              paddingBottom: "16px",
            }}
          >
            {" "}
            {/* Added padding to prevent cutting */}
            <div className="top-icon">
              {matchingMoods?.length > 0 ? (
                <>
                  {matchingMoods[0]?.moods?.length === 1 && (
                    <span className="position-absolute top-0 start-50 translate-middle-x fw-bold">
                      <div className="fs-6" style={{ fontFamily: "serif" }}>
                        {matchingMoods[0]?.moods[0]?.emoji}
                      </div>
                    </span>
                  )}
                  {matchingMoods[0]?.moods?.length === 2 && (
                    <span className="position-absolute d-flex top-0 start-50 translate-middle-x fw-bold">
                      <div className="position-relative">
                        <div className="fs-6" style={{ fontFamily: "serif" }}>
                          {matchingMoods[0]?.moods[0]?.emoji}
                        </div>
                      </div>
                      <div
                        className="position-relative"
                        style={{ marginLeft: "-14px" }}
                      >
                        <div className="fs-6" style={{ fontFamily: "serif" }}>
                          {matchingMoods[0]?.moods[1]?.emoji}
                        </div>
                      </div>
                    </span>
                  )}
                  {matchingMoods[0]?.moods?.length > 2 && (
                    <>
                      <span className="position-absolute d-flex top-0 start-50 translate-middle-x">
                        {matchingMoods[0]?.moods?.map((mood, i) => (
                          <div
                            key={i}
                            style={i > 0 ? { marginLeft: "-14px" } : {}}
                          >
                            <div
                              className="fs-6"
                              style={{ fontFamily: "serif" }}
                            >
                              {mood?.emoji}
                            </div>
                          </div>
                        ))}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <span className="position-absolute top-0 start-50 translate-middle-x fw-bold fs-4">
                  +
                </span>
              )}
            </div>
          </div>
        );
      }
    }
  };

  const tileClassName = ({ date }) => {
    const today = new Date();
    if (date < today && !isSameDay(date, today)) {
      return "past-date"; // Apply custom class to past dates
    }
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  return (
    <>
      <Calendar
        className="w-100 bg-white"
        onChange={(date) => setSelectedDate(date)}
        onClickDay={handleDateChange}
        value={selectedDate}
        tileContent={tileContent}
        tileClassName={tileClassName}
        nextLabel=">"
        prevLabel="<"
        next2Label=">>"
        prev2Label="<<"
        view="month"
        calendarType="iso8601"
        navigationLabel={({ date, label, locale, view }) =>
          view === "year"
            ? label
            : date.toLocaleDateString(locale, {
                month: "long",
                year: "numeric",
              })
        }
      />
    </>
  );
};

export default AiCalendar;
