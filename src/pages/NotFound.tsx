import { useNavigate } from "react-router-dom";
import { ErrorPanel } from "@/shared/components/ErrorPanel";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <ErrorPanel
      fullScreen
      title="404: NOTHING HERE"
      message="This path leads nowhere. Head back to the main menu."
      action={{ label: "MAIN MENU", onClick: () => navigate("/") }}
    />
  );
};

export default NotFound;
