import React, { useState, useEffect } from "react";
import MoodGrid from "./MoodGrid";
import { daysInYear, dayOfYear } from "@/utils/helpers";
import {
  useGetMoodCountQuery,
  useGetMoodByDateQuery,
} from "@/Redux/features/mood/moodApi";
import "@/styles/pixel.css";

const loadState = () => {
  const days = localStorage.getItem("moodCalendar");
  if (days) {
    try {
      return JSON.parse(days);
    } catch (e) {
      return null;
    }
  }
  return null;
};

const YearInPixel = () => {
  const [days, setDays] = useState(() => {
    const currYearValue = new Date().getFullYear();
    let savedDays = loadState();
    if (!savedDays) {
      savedDays = {};
      Array(daysInYear(currYearValue))
        .fill(0)
        .forEach((v, i) => {
          savedDays[i] = v;
        });
    }
    return savedDays;
  });

  const enableAnimations = true;

  const {
    data: moodData,
    error,
    isLoading,
  } = useGetMoodCountQuery("", { refetchOnMountOrArgChange: true });
  const { data: myMoodData } = useGetMoodByDateQuery("", {
    refetchOnMountOrArgChange: true,
  });

  const [myActiveDays, setMyActiveDays] = useState([]);

  const moodColorMapping = {
    Awesome: "#4ade80",
    Fine: "#facc15",
    "Not fine": "#fb923c",
    "Very bad": "#ef4444",
  };

  let patientEmotion = {};
  let patientEmotionColors = [];

  moodData?.data?.forEach((item) => {
    patientEmotion[item?.mood] = item?.count;
    patientEmotionColors?.push(moodColorMapping[item?.mood] || "#a21caf");
  });

  useEffect(() => {
    if (myMoodData && myMoodData?.data) {
      const activeDays = myMoodData?.data?.map((item) => {
        const sortedMoods = [...item.moods]?.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        const latestMood = sortedMoods[sortedMoods?.length - 1];

        // Calculate the day of the year using UTC
        const utcDayOfYear = dayOfYear(latestMood.date);

        return {
          color: moodColorMapping[latestMood?.mood] || "#a21caf",
          date: utcDayOfYear,
        };
      });

      setMyActiveDays(activeDays);
    }
  }, [myMoodData]);

  const [activeMoodDay, setActiveMoodDay] = useState(myActiveDays);

  moodData?.data?.forEach((item) => {
    patientEmotion[item?.mood] = item?.count;
  });

  const data = {
    labels: Object.keys(patientEmotion),
    datasets: [
      {
        data: Object.values(patientEmotion),
        backgroundColor: patientEmotionColors,
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const changeActiveMoodDay = (activeMoodDay) => {
    setActiveMoodDay(activeMoodDay);
  };

  return (
    <>
      <div className="d-flex flex-row align-items-center">
        <div className="d-flex align-items-center justify-content-center gap-4 flex-wrap pb-4 w-100">
          <MoodGrid
            days={days}
            activeDay={myActiveDays}
            setActiveDay={changeActiveMoodDay}
            moods={moodData?.data}
          />
        </div>

        <div className="d-flex flex-column align-items-center justify-content-center gap-4 flex-wrap mt-2 ms-3">
          {moodData?.data?.map((item, i) => (
            <div
              className="d-flex flex-column align-items-center basis-4 position-relative"
              key={i}
            >
              <div className="fs-3 position-relative">
                <span style={{ fontFamily: "serif" }}>{item?.emoji}</span>
                <div
                  style={{
                    backgroundColor: patientEmotionColors[i] || "#a21caf",
                    width: "22px",
                    height: "22px",
                    top: "-3px",
                    right: "-5px",
                    fontSize: "12px",
                  }}
                  className="d-flex align-items-center justify-content-center rounded-5  text-white fw-bold position-absolute"
                >
                  {patientEmotion[item?.mood]}
                </div>
              </div>
              <span className="">{item?.mood}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default YearInPixel;
