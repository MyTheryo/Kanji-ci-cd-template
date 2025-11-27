import { Delete, Edit, Href, Update } from "../../../../Constant";
import Link from "next/link";
import { Button } from "reactstrap";

const AddProjectsAndUploadTableBody = () => {
  const addProjectsAndUploadData = [
    {
      date: "28 May 2024",
      status: "Completed",
      statusClass: "bg-success",
      price: "$56,908",
    },
    {
      date: "12 June 2024",
      status: "On going",
      statusClass: "bg-danger",
      price: "$45,087",
    },
    {
      date: "12 July 2024",
      status: "Pending",
      statusClass: "bg-warning",
      price: "$60,123",
    },
    {
      date: "14 June 2024",
      status: "Pending",
      statusClass: "bg-warning",
      price: "$70,435",
    },
    {
      date: "25 June 2024",
      status: "Completed",
      statusClass: "bg-success",
      price: "$15,987",
    },
  ];
  return (
    <tbody>
      {addProjectsAndUploadData.map((data, index) => (
        <tr key={index}>
          <td>
            <Link className="text-inherit" href={Href}>
              {"Untrammelled Prevents"}
            </Link>
          </td>
          <td>{data.date}</td>
          <td>
            <span className={`status-icon ${data.statusClass}`} /> {data.status}
          </td>
          <td>{data.price}</td>
          <td className="text-end">
            <Button size="sm" color="primary" href={Href}>
              <i className="fa fa-pencil" /> {Edit}
            </Button>
            <Button size="sm" color="transparent" href={Href}>
              <i className="fa fa-link" /> {Update}
            </Button>
            <Button size="sm" color="danger" href={Href}>
              <i className="fa fa-trash" /> {Delete}
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default AddProjectsAndUploadTableBody;
