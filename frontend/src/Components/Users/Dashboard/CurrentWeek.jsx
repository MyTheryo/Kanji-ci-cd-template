import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setMoodDate, setPageUrl } from "@/Redux/features/mood/moodSlice";
import { useGetMoodByWeekQuery } from "@/Redux/features/mood/moodApi";
import { defaultMoods } from "@/data";
import { setEmoji, setMood } from "@/Redux/features/mood/moodSlice";

const CurrentWeek = () => {
  const { data, isLoading, refetch } = useGetMoodByWeekQuery({ refetch: true });
  const [days, setDays] = useState([]);
  const router = useRouter(); // Initialize useRouter
  const dispatch = useDispatch();

  useEffect(() => {
    if (refetch) {
      refetch();
    }
  }, []);

  useEffect(() => {
    const updateDays = () => {
      const currentDate = new Date();
      const today = currentDate.getDay() - 1; // Use getUTCDay to avoid timezone issues

      // Create an array to represent the days of the week
      const newDays = [];

      // Calculate the offset to adjust for Sunday as the starting day
      const offset = today === 0 ? 0 : 1;

      // Loop through 7 days (a week)
      for (let i = 0; i < 7; i++) {
        // Calculate the day index, adjusting for Sunday as the starting day
        const dayIndex = i; // Add 6 to ensure Sunday is represented as 0

        // Set the symbol based on the position of the day relative to today
        let symbol;
        const daysBeforeToday = today - dayIndex; // Number of days before today

        if (daysBeforeToday >= 0) {
          // Past days
          symbol = "+";
        } else {
          // Future days
          symbol = "0";
        }

        // Push the day information to the array
        newDays.push({ dayIndex, symbol });
      }

      // Update the state with the new array of days
      setDays(newDays);
    };

    // Update days on component mount and midnight (for day changes)
    updateDays();
    const interval = setInterval(updateDays, 1000 * 60 * 60); // Update every hour
    return () => clearInterval(interval); // Cleanup
  }, []);

  // Function to get the name of the day based on its index
  const getDayName = (index) => {
    const currentDate = new Date();
    const todayIndex = currentDate.getDay() - 1; // Use getUTCDay to avoid timezone issues

    if (index === todayIndex) {
      return "Today";
    } else {
      const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return daysOfWeek[index];
    }
  };

  const handleDateChange = (dayIndex) => {
    const today = new Date();
    const referenceDate = new Date(); // Use today's date as reference
    const adjustedDayIndex = (dayIndex + 1) % 7; // Simplified calculation

    // Calculate the start date (Sunday) of the current week in UTC
    const startDate = new Date(referenceDate);
    startDate.setUTCDate(referenceDate.getUTCDate() - referenceDate.getDay());

    // Calculate the selected date based on the dayIndex
    const selectedDate = new Date(
      startDate.getTime() + adjustedDayIndex * 24 * 60 * 60 * 1000
    );

    if (adjustedDayIndex)
      if (selectedDate <= today) {
        dispatch(setEmoji(defaultMoods[0].emoji));
        dispatch(setMood(defaultMoods[0].mood));
        router.push(`/user/journaling-feature`);
        dispatch(setMoodDate(selectedDate)); // Store date as ISO string in UTC (.toISOString())
      } else {
        toast.error("This date is yet to come.");
      }
  };

  return (
    <div className=" bg-white d-flex flex-column justify-content-between rounded-l">
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "275px" }}
      >
        <div style={{ display: "flex" }}>
          {days.map(({ dayIndex, symbol }, index) => {
            // Find mood data for the current day
            const moodDataForDay = data?.moodCounts.find((item) => {
              const itemDate = new Date(item._id);
              return itemDate.getUTCDay() === dayIndex + 1; // Use getUTCDay
            });

            const hasMoodData = moodDataForDay && moodDataForDay.count > 0;

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  margin: "8px",
                  cursor:
                    symbol === "+" && !hasMoodData ? "pointer" : "default", // Enable pointer for clickable "+" only if there's no data
                }}
                onClick={() =>
                  symbol === "+" && !hasMoodData && handleDateChange(dayIndex)
                } // Call on click only for clickable "+" and when there's no data
              >
                <div style={{ marginBottom: "5px" }}>
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      border: "1px solid #000",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      backgroundColor:
                        symbol === "+" && hasMoodData
                          ? "lightgreen"
                          : symbol === "+"
                          ? "lightblue"
                          : "none",
                      position: "relative",
                      cursor:
                        symbol === "+" && !hasMoodData ? "pointer" : "default", // Enable pointer for clickable "+" only if there's no data
                      fontWeight:
                        symbol === "+" && hasMoodData ? "bold" : "normal", // Set fontWeight to bold if there's data
                    }}
                    onClick={() =>
                      symbol === "+" && !hasMoodData
                        ? handleDateChange(new Date(dayIndex))
                        : null
                    } // Handle click on "+" only if there's no data
                  >
                    {symbol === "+" && hasMoodData ? "✔" : symbol}{" "}
                    {/* Replace "+" with "✔" if backgroundColor is "lightgreen"  */}
                  </div>
                </div>
                <div>{getDayName(dayIndex)}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="d-flex  align-items-center gap-4 flex-wrap px-4 pb-4 border-top">
        {/* Render mood data  */}
      </div>
    </div>
  );
};

export default CurrentWeek;
