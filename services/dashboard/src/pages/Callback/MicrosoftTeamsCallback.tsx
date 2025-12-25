import { CircularProgress, Stack, Typography } from "@mui/joy";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  useCreateIntegration,
  useIntegrations,
} from "../../api/queries/integrations";
import { API_SERVER_URL } from "../../constants";
import { IntegrationPayload } from "../../components/Connection/types";
import { ConnectionName } from "../../types/Connections";
import { useMe } from "../../api/queries/auth";
import { ORGANIZATION_INTEGRATIONS_PATH } from "../../routes/paths";
import toast from "react-hot-toast";

export default function MicrosoftTeamsCallback() {
  const navigate = useNavigate();
  const { data: user, isPending } = useMe();
  const { data: integrations, isPending: isIntegrationsPending } =
    useIntegrations();
  const ignoreEffect = useRef(false);
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const state = (() => {
    const state = searchParams.get("state");
    if (state) {
      try {
        return JSON.parse(decodeURIComponent(state));
      } catch (e) {
        console.error("Failed to parse state", e);
      }
    }
    return {};
  })();
  const createIntegration = useCreateIntegration();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ignoreEffect.current || isPending || isIntegrationsPending) {
      return;
    }
    ignoreEffect.current = true;

    if (!code) {
      console.error("Authorization code is missing in the URL");
      return;
    }

    const requiredStateKeys = [
      "aadGroupId",
      "teamId",
      "channelId",
      "fromAadObjectId",
      "fromId",
      "tenantId",
    ];

    const missingKeys = requiredStateKeys.filter((key) => !(key in state));
    if (missingKeys.length > 0) {
      const err = `Missing required state parameters: ${missingKeys.join(", ")}`;
      setError(err);
      console.error(err);
      return;
    }

    handleConnect();
  }, [isPending, isIntegrationsPending]);

  async function handleConnect() {
    try {
      if (
        integrations?.some(
          (integration: { vendor: { name: string } }) =>
            integration.vendor.name === ConnectionName.Teams,
        )
      ) {
        setError("Integration with Microsoft Teams already exists");
        return;
      }

      const url = `${API_SERVER_URL}/integrations`;
      const body: IntegrationPayload = {
        vendor: ConnectionName.Teams,
        organization: user?.organization?._id as string,
        metadata: state,
        credentials: { code },
      };
      const response = await createIntegration.mutateAsync({ url, body });
      if (response.status === 200) {
        toast.success("Teams integration successful");
      }
    } catch (error) {
      console.error("Error during Microsoft Teams integration", error);
      toast.error("Microsoft authentication failed. Please try again.");
    }
    navigate(ORGANIZATION_INTEGRATIONS_PATH);
  }

  return (
    <Stack
      height={"100vh"}
      width={"100%"}
      alignItems={"center"}
      justifyContent={"center"}
      gap={2}
    >
      {error ? (
        <Stack alignItems={"center"} justifyContent={"center"} gap={2}>
          <Typography level="title-lg">{error}</Typography>
          <Link to={ORGANIZATION_INTEGRATIONS_PATH}>Go to Integration page</Link>
        </Stack>
      ) : (
        <Stack alignItems={"center"} justifyContent={"center"} gap={2}>
          <CircularProgress />
          <Typography>Integrating with Microsoft Teams...</Typography>
        </Stack>
      )}
    </Stack>
  );
}
