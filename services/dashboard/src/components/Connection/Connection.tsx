/* eslint-disable @typescript-eslint/no-explicit-any */
import { icons } from "./icons";
import { Vendor } from "../../types/Connections";
import { Null } from "./styles";
import Typography from "../common/Typography";
import { Link } from "react-router-dom";
import * as paths from "../../routes/paths";
import { Button } from "../base/buttons/button";
import { ConnectionModal } from "./ConnectionModal";
import { useDisclosure } from "@/hooks/modal";
import { Dot } from "../foundations/dot-icon";

interface Props {
  vendor: Vendor;
  data?: any; // Make data prop optional
}

export const Connection = ({ vendor, data }: Props) => {
  const { isOpen, onClose, onOpen, shouldRender } = useDisclosure();
  const { name } = vendor;
  const Icon = icons?.[name as keyof typeof icons] || Null;
  const isConnected = !!data; // Check if data exists

  const onSubmit = () => {
    onClose();
  };

  const content = (
    <div className="flex px-6 py-4 items-center justify-between border-b border-secondary">
      <div className="flex items-center gap-3">
        <Icon className="h-8 w-8" />
        <Typography variant="md/medium" className="text-primary">
          {vendor.displayName || vendor.name}
        </Typography>
      </div>

      <div>
        {/* Conditionally render a badge or the button */}
        {isConnected ? (
          <div className="flex gap-2 items-center">
            <Dot className={"size-2 text-utility-success-500"} />
            <Typography variant="md/medium" className="text-secondary">
              Connected
            </Typography>
          </div>
        ) : (
          <Button size="sm" color="link-color" onClick={onOpen}>
            Connect
          </Button>
        )}
      </div>
    </div>
  );

  if (isConnected) {
    return (
      <Link to={`${paths.ORGANIZATION_INTEGRATIONS_PATH}/${vendor?._id}`}>
        {content}
      </Link>
    );
  }

  return (
    <div>
      {content}
      {shouldRender && (
        <ConnectionModal
          open={isOpen}
          onClose={onClose}
          onSubmit={onSubmit}
          vendor={vendor}
        />
      )}
    </div>
  );
};
