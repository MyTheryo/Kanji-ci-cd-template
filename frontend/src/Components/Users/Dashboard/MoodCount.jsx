"use client";
import React, { useRef, useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from "chart.js";

ChartJS.register(
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
);

// Custom plugin to draw background mood colors
const backgroundColorsPlugin = {
  id: "backgroundColorsPlugin",
  beforeDraw: (chart) => {
    const {
      ctx,
      chartArea: { left, right, top, bottom },
      scales: { y },
    } = chart;
    // Ensure the y scale is available before attempting to draw
    if (!y) return;

    ctx.save();

    // Define color zones (y-axis ranges)

    const moodZones = [
      { color: "rgba(239, 68, 68, 0.5)", range: [0.5, 1.5] }, // Red: Very Bad
      { color: "rgba(251, 146, 60, 0.5)", range: [1.5, 2.5] }, // Orange: Not Fine
      { color: "rgba(250, 204, 21, 0.5)", range: [2.5, 3.5] }, // Yellow: Fine
      { color: "rgba(74, 222, 128, 0.5)", range: [3.5, 4.5] }, // Green: Awesome
    ];

    // Loop through each mood zone and draw the background color
    moodZones.forEach(({ color, range }) => {
      ctx.fillStyle = color;
      const yStart = y.getPixelForValue(range[0]);
      const yEnd = y.getPixelForValue(range[1]);
      ctx.fillRect(left, yEnd, right - left, yStart - yEnd);
    });

    ctx.restore();
  },
};

// Register the plugin globally
ChartJS.register(backgroundColorsPlugin);

const MoodCount = ({ moodCountData }) => {
  const chartRef = useRef(null);

  const [transformedData, setTransformedData] = useState([]);

  const emojiValues = {
    "😀": 5, // Awesome
    "😀": 4, // Awesome
    "😐": 3, // Fine
    "☹️": 2, // Not fine
    "😭": 1, // Very bad
    "": 0,
  };

  useEffect(() => {
    if (moodCountData?.data?.length > 0) {
      // Group the mood data by date and create a transformed array
      const transformed = moodCountData.data.reduce((acc, entry) => {
        const date = entry.date;
        const emojis = entry.emojis;

        // Find the most frequent emoji for the day
        const primaryEmoji = emojis.reduce((prev, current) => {
          return prev.count > current.count ? prev : current;
        });

        // Update or create a new entry in the accumulator
        if (acc[date]) {
          acc[date].emoji = primaryEmoji.emoji;
          acc[date].value = emojiValues[primaryEmoji.emoji] || 0;
          acc[date].color = "#10aeae"; // Default to logo color
          acc[date].count += emojis.length; // Aggregate the count
        } else {
          acc[date] = {
            date,
            emoji: primaryEmoji.emoji,
            value: emojiValues[primaryEmoji.emoji] || 0,
            color: "#10aeae", // Default to logo color
            count: emojis.length,
          };
        }

        return acc;
      }, {});

      // Convert the map back to an array and sort by date (ascending)
      const transformedArray = Object.values(transformed).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      ); // Sort by date ascending

      setTransformedData(transformedArray);
    }
  }, [moodCountData]);

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  const options = {
    maintainAspectRatio: false,
    scales: {
      y: {
        type: "linear",
        beginAtZero: true,
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          font: {
            size: 24, // Increase font size to enlarge emojis
            family: "serif",
          },
          callback: function (value) {
            const fixedLabels = ["", "😭", "☹️", "😐", "😀"];
            return fixedLabels[value] || "";
          },
        },
        grid: {
          display: false,
          drawBorder: false,
          z: -1, // Ensure background stays behind the lines
        },
      },
      x: {
        type: "category",
        grid: {
          display: false, // No vertical grid lines needed
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const moodCount = transformedData[context.dataIndex]?.count || 0;
            return `Mood Count: ${moodCount}`;
          },
        },
      },
      legend: {
        display: false, // Hide legend
      },
    },
  };

  const data = {
    labels: transformedData?.map((entry) => formatDate(entry?.date)),
    datasets: [
      {
        label: "Moods",
        data: transformedData?.map((entry) => entry?.value),
        fill: false, // No area fill under the line, just color the rows
        borderColor: transformedData?.map((entry) => entry?.color), // Line color changes
        tension: 0.4, // Smooth line curves
        spanGaps: true, // Fill gaps between data points
      },
    ],
  };

  return (
    <div className="d-flex flex-column justify-content-between rounded-l">
      <div
        id="line-chart"
        className="d-flex justify-content-center align-items-center"
      >
        {transformedData.length === 0 ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "300px" }}
          >
            <p className="text-center text-secondary">
              We need more data to draw this chart. Check back soon! 🖐
            </p>
          </div>
        ) : (
          <Line
            ref={chartRef}
            data={data}
            options={options}
            style={{ height: "300px", width: "100%" }}
          />
        )}
      </div>
    </div>
  );
};

export default MoodCount;
