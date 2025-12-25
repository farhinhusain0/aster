import { useMe } from "@/api/queries/auth";
import { useAuth } from "@/providers/auth";
import { Avatar } from "../base/avatar/avatar";
import { Dropdown } from "../base/dropdown/dropdown";
import { Button } from "react-aria-components";
import { cx } from "@/utils/cx";
import { ArrowLeft, Globe01, LogOut01, User01 } from "@untitledui/icons";
import { Link, useMatch, useSearchParams } from "react-router-dom";
import * as paths from "@/routes/paths";

export function Header() {
  const { data } = useMe();
  const organization = data?.organization;
  const { logout } = useAuth();

  return (
    <div className={"h-appbar flex flex-row  border-secondary border-b"}>
      <div
        className={`flex items-center w-sidebar border-r border-secondary`}
      >
        <div className="flex flex-col gap-5 px-4 w-full">
          <div className="flex w-max items-center justify-start overflow-visible h-8 gap-2 px-3">
            <Avatar
              size="xs"
              src={organization?.logo}
              placeholderIcon={Globe01}
            />
            <div className="text-primary font-semibold text-md">
              {organization?.name}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row flex-1 justify-between items-center px-5">
        <HeaderAction />
        <Dropdown.Root>
          <Button
            className={({ isPressed, isFocusVisible }) =>
              cx(
                "group relative inline-flex cursor-pointer rounded-full outline-focus-ring",
                (isPressed || isFocusVisible) && "outline-2 outline-offset-2",
              )
            }
          >
            <Avatar size="xs" src={data?.profile.picture} />
          </Button>
          <Dropdown.Popover>
            <Dropdown.Menu>
              <Dropdown.Section>
                <Dropdown.Item icon={User01} href={paths.PROFILE_PATH}>
                  Profile
                </Dropdown.Item>
                <Dropdown.Item
                  variant="danger"
                  onClick={logout}
                  icon={LogOut01}
                >
                  Logout
                </Dropdown.Item>
              </Dropdown.Section>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown.Root>
      </div>
    </div>
  );
}

const HeaderAction = () => {
  const [searchParams] = useSearchParams();
  const investigationDetailsMatch = useMatch({
    path: `${paths.INVESTIGATIONS_PATH}/:id/:checkId?`,
  });
  const integrationDetailsMatch = useMatch({
    path: `${paths.ORGANIZATION_INTEGRATIONS_PATH}/:vendorId`,
  });

  if (!investigationDetailsMatch && !integrationDetailsMatch) {
    return <div />;
  }

  const [path, label] = investigationDetailsMatch
    ? [paths.INVESTIGATIONS_PATH, "Investigations"]
    : [paths.ORGANIZATION_INTEGRATIONS_PATH, "Integrations"];

  return (
    <div>
      <Link
        className="text-primary text-sm font-semibold flex flex-row gap-2 items-center"
        to={{
          pathname: path,
          search: searchParams.toString(),
        }}
      >
        <ArrowLeft className="text-gray-400" size={20} />
        {label}
      </Link>
    </div>
  );
};
