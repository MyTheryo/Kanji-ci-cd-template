"use client";
import { useGetAllSessionNotesQuery } from "@/Redux/features/notes/notesApi";
import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { subWeeks, format } from "date-fns";
import Loader from "../Loader";

const TotalSessionSummaries = () => {
  const {
    data: notesData,
    isLoading,
    refetch,
  } = useGetAllSessionNotesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [chartData, setChartData] = useState(null);

  const groupDataByWeeks = (data = [], numberOfWeeks) => {
    const currentDate = new Date();
    const weekLabels = [];
    const weekData = Array(numberOfWeeks).fill(0);

    for (let i = 0; i < numberOfWeeks; i++) {
      const endOfWeek = subWeeks(currentDate, i);
      const startOfWeek = subWeeks(endOfWeek, 1);
      weekLabels.unshift(
        `${format(startOfWeek, "MM/dd/yy")} - ${format(endOfWeek, "MM/dd/yy")}`
      );

      data.forEach((note) => {
        const noteDate = new Date(note.date);
        if (noteDate >= startOfWeek && noteDate < endOfWeek) {
          weekData[numberOfWeeks - i - 1]++;
        }
      });
    }

    return { weekLabels, weekData };
  };

  useEffect(() => {
    if (notesData?.notes && Array.isArray(notesData?.notes)) {
      const { weekLabels, weekData } = groupDataByWeeks(notesData?.notes, 4);
      setChartData({
        series: [
          {
            name: "Total Sessions",
            data: weekData,
          },
        ],
        chart: {
          height: 350,
          type: "line",
          toolbar: {
            show: false,
          },
          zoom: {
            enabled: false,
          },
        },
        dataLabels: {
          enabled: true,
        },
        stroke: {
          curve: "straight",
        },
        grid: {
          row: {
            colors: ["var(--light-color)", "transparent"],
            opacity: 0.5,
          },
        },
        colors: ["#c280d2"],
        xaxis: {
          categories: weekLabels,
        },
      });
    }
  }, [notesData]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    chartData && (
      <ReactApexChart
        options={chartData}
        series={chartData?.series}
        type="area"
        height={350}
      />
    )
  );
};

export default TotalSessionSummaries;
