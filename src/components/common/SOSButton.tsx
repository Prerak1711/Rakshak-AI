import { Siren } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { AppButton } from "../ui/Button";

const SOSButton = () => {
  const navigate = useNavigate();

  return (
    <AppButton
      type="button"
      variant="danger"
      size="lg"
      className="w-full"
      onClick={() => navigate("/sos")}
    >
      <Siren size={24} />
      <span>Trigger SOS</span>
    </AppButton>
  );
};

export default SOSButton;
