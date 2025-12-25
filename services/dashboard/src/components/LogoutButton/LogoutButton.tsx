import Button from "@mui/material/Button";
import { useAuth } from "../../providers/auth";

function LogoutButton() {
  const { logout } = useAuth();

  return (
    <Button color="inherit" onClick={logout}>
      Log Out
    </Button>
  );
}

export { LogoutButton };
