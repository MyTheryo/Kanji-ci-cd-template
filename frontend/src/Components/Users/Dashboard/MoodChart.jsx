"use client";
import React, { useEffect, useRef, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const MoodChart = ({ moodData }) => {
  const moodColorMapping = {
    Awesome: "#4ade80",
    Fine: "#facc15",
    "Not fine": "#fb923c",
    "Very bad": "#ef4444",
  };
  const [chartHeight, setChartHeight] = useState(200); // Initial height
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current && chartRef.current.chartInstance) {
      const parentHeight =
        chartRef.current.chartInstance.chart.canvas.parentElement.clientHeight;
      setChartHeight(parentHeight);
    }
  }, [moodData]);

  let patientEmotion = {};
  let patientEmotionColors = [];

  if (moodData?.data?.length > 0) {
    moodData?.data?.forEach((item) => {
      patientEmotion[item?.mood] = item?.count;
      patientEmotionColors?.push(moodColorMapping[item?.mood] || "#a21caf");
    });
  }

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

  const options = {
    cutoutPercentage: 90,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const allZero = Object.values(patientEmotion).every((value) => value === 0);

  return (
    <>
      {allZero ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "300px" }}
        >
          <div className="w-full h-full overflow-hidden">
            <p className="px-10 text-center">
              We need more data to draw this chart. Check back soon! 🖐
            </p>
          </div>
        </div>
      ) : (
        <div
          className="d-flex flex-column justify-content-between align-items-center"
          style={{ width: "100%", height: "100%" }}
        >
          <div></div>
          <div
            className="d-flex flex-column align-items-center"
            style={{ width: "100%" }}
          >
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ width: "220px", height: "220px" }}
            >
              <Doughnut ref={chartRef} data={data} options={options} />
            </div>
            <div
              className=" d-flex  align-items-center gap-4 flex-wrap border-top pt-2"
              style={{ width: "100%" }}
            >
              {moodData?.data?.map((item, i) => (
                <div
                  className="d-flex flex-column align-items-center basis-6 position-relative"
                  key={i}
                >
                  <div className="fs-2 position-relative">
                    <span style={{ fontFamily: "serif" }}>{item?.emoji}</span>
                    <div
                      style={{
                        backgroundColor: patientEmotionColors[i] || "#a21caf",
                        right: "-3px",
                        top: "-3px",
                        width: "23px",
                        height: "23px",
                        fontSize: "12px",
                        fontWeight: "700",
                      }}
                      className={`d-flex align-items-center justify-content-center rounded-5 p-1 text-white position-absolute`}
                    >
                      {patientEmotion[item?.mood]}
                    </div>
                  </div>
                  <span className="font-bold">{item?.mood}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MoodChart;
