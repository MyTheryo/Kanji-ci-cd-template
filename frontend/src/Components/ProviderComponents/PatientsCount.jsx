"use client";
import SVG from "@/CommonComponent/SVG";
import { useGetAllPatientsQuery } from "@/Redux/features/provider/providerApi";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Col } from "reactstrap";

const PatientsCount = () => {
  const { data: session } = useSession();
  const npiNumber = session?.user?.npiNumber;
  const [filterPatients, setFilterPatient] = useState("");
  const { data, isLoading, refetch } = useGetAllPatientsQuery(
    { npiNumber, filterPatients },
    { refetchOnMountOrArgChange: true }
  );

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const [newPatients, setNewPatients] = useState(0);
  useEffect(() => {
    if (data) {
      const filteredPatients = data?.patients?.filter((patient) => {
        const joinedDate = new Date(patient?.sentOn);
        const joinedMonth = joinedDate?.getMonth();
        const joinedYear = joinedDate?.getFullYear();
        return joinedMonth === currentMonth && joinedYear === currentYear;
      });

      setNewPatients(filteredPatients?.length);
      console.log(newPatients);
    }
  }, [data, currentMonth, currentYear]);

  const taskSummaryLeftData = [
    {
      icon: "Pie",
      color: "primary",
      title: "New Clients (Current Month)",
      count: newPatients?.length || 0,
    },
    {
      icon: "Category",
      color: "secondary",
      title: "Total Clients",
      count: data
        ? data?.patients?.filter(
            (patient) => patient?.invitationStatus !== "deleted"
          )?.length
        : 0,
    },
  ];

  return (
    <Col sm="12" className="custom-width-1 h-max">
      <div className="project-cost">
        <ul className="d-flex flex-column gap-2 w-100">
          {taskSummaryLeftData.map((item, i) => (
            <li className="card-hover p-0 mt-2 w-100" key={i}>
              <div
                className={`d-flex bg-light-${item.color} flex-column p-2 py-md-3 py-lg-4 align-items-center gap-2`}
              >
                <div
                  className={`flex-shrink-0 border-${item.color} p-1 rounded-3`}
                >
                  <SVG
                    iconId={item.icon}
                    className={`svg-w-24 stroke-${item.color}`}
                  />
                </div>
                <div className="d-flex flex-column flex-grow-1 gap-1">
                  <h6 className="fw-500 text-center">{item.title}</h6>
                  <h4 className="fw-700 text-center">{item.count}</h4>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Col>
  );
};

export default PatientsCount;
