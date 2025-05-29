import { useNavigate } from "react-router-dom";
import Button from "./Button";

function BackButtonRefresh() {
  const navigate = useNavigate();

  return (
    <Button
  type="back"
  onClick={(e) => {
    e.preventDefault();
    navigate("/app/cities", { state: { refresh: true } });
  }}
>
  &larr; Back
</Button>

  );
}

export default BackButtonRefresh;
