import { AllTask, Completed, Pending } from "../../../Constant";

export const sideBartList = [
  { color: "primary", icon: "file-plus", tittle: AllTask },
  { color: "success", icon: "check-circle", tittle: Completed, badge: true },
  { color: "danger", icon: "cast", tittle: Pending, badge: true },
];
