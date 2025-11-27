"use client";
import React, { useEffect, useRef, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { useGetAllActivitiesQuery } from "@/Redux/features/mood/moodApi";
import { useGetAllGoalQuery } from "@/Redux/features/goals/goalApi";

ChartJS.register(ArcElement, Tooltip, Legend);

const ActivityChart = ({ ActivityData }) => {
  const [chartHeight, setChartHeight] = useState(300); // Initial height
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current && chartRef.current.chartInstance) {
      const parentHeight =
        chartRef.current.chartInstance.chart.canvas.parentElement.clientHeight;
      setChartHeight(parentHeight);
    }
  }, [ActivityData]);

  let dummyActivities = {
    awesome: 0,
    fine: 0,
    "not fine": 0,
    "very bad": 0,
  };

  const activityCounts = {
    awesome: 0,
    fine: 0,
    "not fine": 0,
    "very bad": 0,
  };

  ActivityData?.activities?.forEach((item) => {
    const mood = item?.mood?.toLowerCase();
    if (activityCounts?.hasOwnProperty(mood)) {
      activityCounts[mood] += 1;
    }
  });

  const chartData = {
    labels: Object.keys(activityCounts).map(
      (label) => label?.charAt(0).toUpperCase() + label?.slice(1)
    ),
    datasets: [
      {
        data: Object.values(activityCounts),
        backgroundColor: [
          "#28a745", // Awesome
          "#ffc107", // Fine
          "#fd7e14", // Notfine
          "#dc3545", // Verybad
        ],
        circumference: 360,
        rotation: 270,
      },
    ],
  };

  const options = {
    cutoutPercentage: 100,
    plugins: {
      legend: {
        display: true, // Enable legend to show category labels
        position: "right",
        labels: {
          fontSize: 20, // Adjust font size for legend labels
        },
        fullWidth: true,
      },
    },
  };

  const dummyData = {
    labels: Object.keys(dummyActivities).map(
      (label) => label?.charAt(0).toUpperCase() + label?.slice(1)
    ),
    datasets: [
      {
        data: Object.values(dummyActivities),
        backgroundColor: [
          "#28a745", // Awesome
          "#ffc107", // Fine
          "#fd7e14", // Notfine
          "#dc3545", // Verybad
        ],
        circumference: 360,
        rotation: 270,
      },
    ],
  };

  const allZero = Object.values(activityCounts).every((value) => value === 0);

  return (
    <>
      {allZero ? (
        <div className="d-flex flex-column justify-content-between align-items-center">
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
        </div>
      ) : (
        <div className=" d-flex flex-column justify-content-between">
          <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
            <Pie ref={chartRef} data={chartData} options={options} />
          </div>
        </div>
      )}
    </>
  );
};

export default ActivityChart;
