"use client";
import { useGetAllPatientsQuery } from "@/Redux/features/provider/providerApi";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

const TotalPatientsChart = () => {
  const { data: session } = useSession();
  const npiNumber = session?.user?.npiNumber;
  const [filterPatients, setFilterPatient] = useState("");
  const { data, isLoading, refetch } = useGetAllPatientsQuery(
    { npiNumber, filterPatients },
    { refetchOnMountOrArgChange: true }
  );

  const [patientCountData, setPatientCountData] = useState({
    active: 0,
    rejected: 0,
    pending: 0,
  });

  useEffect(() => {
    if (data && Array.isArray(data.patients)) {
      const counts = data?.patients?.reduce(
        (counts, patient) => {
          const status = patient?.invitationStatus;

          switch (status) {
            case "accepted":
              counts.active++;
              break;
            case "rejected":
              counts.rejected++;
              break;
            case "pending":
              counts.pending++;
              break;
            default:
              break;
          }
          return counts;
        },
        { active: 0, rejected: 0, pending: 0 }
      );
      setPatientCountData(counts);
    }
  }, [data]);

  const pieChartData = {
    chart: {
      width: 380,
      type: "pie",
    },
    labels: ["Active", "Rejected", "Pending"],
    series: [
      patientCountData?.active,
      patientCountData?.rejected,
      patientCountData?.pending,
    ],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 250,
          },
          legend: {
            show: true,
          },
        },
      },
    ],
    colors: ["#17A600", "#C42a02", "#F0AD4E"],
  };

  return (
    <>
      <ReactApexChart
        options={pieChartData}
        series={pieChartData.series}
        type="pie"
        height={300}
      />
    </>
  );
};

export default TotalPatientsChart;
