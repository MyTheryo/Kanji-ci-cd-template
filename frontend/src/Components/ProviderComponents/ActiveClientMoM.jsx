"use client";
import { useGetAllPatientsQuery } from "@/Redux/features/provider/providerApi";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

const ActiveClientMoM = () => {
  const { data: session } = useSession();
  const npiNumber = session?.user?.npiNumber;
  const [filterPatients, setFilterPatient] = useState("");
  const { data, isLoading, refetch } = useGetAllPatientsQuery(
    { npiNumber, filterPatients },
    { refetchOnMountOrArgChange: true }
  );

  const [chartData, setChartData] = useState(null);

  const processData = () => {
    if (!data) return; // Handle potential missing data

    const activePerMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const currentYear = new Date().getFullYear();

    data.patients.forEach((patient) => {
      const sentOnDate = new Date(patient?.sentOn);
      const sentOnYear = sentOnDate.getFullYear();
      const sentOnMonth = sentOnDate.getMonth();

      // Check if data is within the current year
      if (sentOnYear === currentYear) {
        // Check if invitationStatus is accepted
        if (patient.invitationStatus === "accepted") {
          activePerMonth[sentOnMonth] += 1; // Increment count for the month
        }
      }
    });

    setChartData({
      series: [
        {
          name: "Active Clients",
          data: activePerMonth,
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
        enabled: false,
      },
      stroke: {
        curve: "straight",
      },
      grid: {
        row: {
          colors: ["var(--light-color)", "transparent"], // takes an array which will be repeated on columns
          opacity: 0.5,
        },
      },
      colors: ["#43B9B2"],
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
      },
    });
  };

  useEffect(() => {
    if (data) {
      processData();
    }
  }, [data]);

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

export default ActiveClientMoM;
