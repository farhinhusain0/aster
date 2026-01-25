import React from "react";
import {
  DeleteMemberModal,
  OnlyAdminDialog,
  ActivateMemberModal,
  DeactivateMemberModal,
} from "./modals";
import {
  useDeleteUser,
  useOrgUsers,
  useChangeRole,
  invalidateOrgUsersQuery,
  useDeactivateUser,
  useActivateUser,
} from "@/api/queries/users";
import toast from "react-hot-toast";
import { useMe } from "@/api/queries/auth";
import { Input } from "@/components/base/input/input";
import { SearchMd } from "@untitledui/icons";
import { Table, TableCard } from "@/components/application/table/table";
import { Tabs } from "@/components/application/tabs/tabs";
import { Key } from "react-aria-components";
import { Avatar } from "@/components/base/avatar/avatar";
import Typography from "@/components/common/Typography";
import { Select } from "@/components/base/select/select";
import { IEnrichedUser } from "@/api/calls/users";
import { useDisclosure } from "@/hooks/modal";
import { useQueryClient } from "@tanstack/react-query";
import ContentContainerCard from "@/components/common/ContentContainerCard";
import { Button } from "../base/buttons/button";
import { IOrganization } from "@/api/calls/organizations";

const TABS = [
  {
    label: "All",
    id: "all",
  },
  {
    label: "Admins",
    id: "admins",
  },
  {
    label: "Deactivated",
    id: "deactivated",
  },
  {
    label: "Invited",
    id: "invited",
  },
];

const ADMIN = { label: "Admin", id: "owner" };
const MEMBER = { label: "Member", id: "member" };
const DELETE = { label: "Delete", id: "delete" };
const ACTIVATE = { label: "Activate", id: "activated" };
const DEACTIVATE = { label: "Deactivate", id: "deactivated" };
const INVITED = { label: "Invited", id: "invited" };

const ACTIONS_BY_STATUS = {
  activated: [ADMIN, MEMBER, DEACTIVATE],
  invited: [ADMIN, MEMBER, DELETE],
  deactivated: [ACTIVATE],
};

const Invitations = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState<string>("");

  const deleteDisclosure = useDisclosure({ animationDuration: 300 });
  const onlyAdminDialogDisclosure = useDisclosure({ animationDuration: 300 });
  const activateDisclosure = useDisclosure({ animationDuration: 300 });
  const deactivateDisclosure = useDisclosure({ animationDuration: 300 });
  const {
    isOpen: deleteOpen,
    setIsOpen: setDeleteOpen,
    shouldRender: shouldRenderDeleteModal,
  } = deleteDisclosure;
  const {
    isOpen: onlyAdminDialogOpen,
    setIsOpen: setOnlyAdminDialogOpen,
    shouldRender: shouldRenderOnlyAdminDialogModal,
  } = onlyAdminDialogDisclosure;
  const {
    isOpen: activateOpen,
    setIsOpen: setActivateOpen,
    shouldRender: shouldRenderActivateModal,
  } = activateDisclosure;
  const {
    isOpen: deactivateOpen,
    setIsOpen: setDeactivateOpen,
    shouldRender: shouldRenderDeactivateModal,
  } = deactivateDisclosure;
  const [contextMember, setContextMember] =
    React.useState<IEnrichedUser | null>(null);
  const [tab, setTab] = React.useState<Key>("all");
  const { data: user } = useMe();

  const organization = user?.organization;
  const organizationId = organization?._id;

  const usersQuery = useOrgUsers(organizationId);

  const { rows, filteredTabs } = React.useMemo(() => {
    if (usersQuery.isPending || !usersQuery.data) {
      return { rows: [] as IEnrichedUser[], filteredTabs: [] };
    }
    const { users } = usersQuery.data;
    let _users = [...users];

    if (tab === "admins") {
      _users = _users.filter((user) => user.role === ADMIN.id);
    } else if (tab === "invited") {
      _users = _users.filter((user) => user.status === INVITED.id);
    } else if (tab === "deactivated") {
      _users = _users.filter((user) => user.status === DEACTIVATE.id);
    } else if (tab === "all") {
      _users = _users.filter((user) => user.status === ACTIVATE.id);
    }

    if (search) {
      _users = _users.filter(
        (user: { email: string; name: string }) =>
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          user.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Sort to put logged-in user at the top
    if (user?._id) {
      _users.sort((a, b) => {
        if (a._id === user._id) return -1;
        if (b._id === user._id) return 1;
        return 0;
      });
    }

    const filteredTabs = TABS.filter((tab) => {
      if (tab.id === "deactivated")
        return users.some((user) => user.status === DEACTIVATE.id);
      if (tab.id === "invited")
        return users.some((user) => user.status === INVITED.id);

      return true;
    });

    return { rows: _users, filteredTabs };
  }, [search, usersQuery.isPending, usersQuery.data, tab, user?._id]);

  const { mutateAsync: deleteUser } = useDeleteUser();
  const { mutateAsync: changeRole } = useChangeRole();
  const { mutateAsync: deactivateUser } = useDeactivateUser();
  const { mutateAsync: activateUser } = useActivateUser();

  const handleDeleteUser = async () => {
    setDeleteOpen(false);

    if (!contextMember) return;

    const promise = deleteUser(contextMember._id);
    toast.promise(promise, {
      loading: "Deleting user.",
      success: "User deleted.",
      error: "Delete failed.",
    });

    await promise;
    invalidateOrgUsersQuery(queryClient);
    setContextMember(null);
  };
  const handleChangeRole = async (user: IEnrichedUser) => {
    if (!user || !user.role || ![ADMIN.id, MEMBER.id].includes(user.role))
      return;

    const promise = changeRole({
      id: user._id,
      role: { [MEMBER.id]: ADMIN.id, [ADMIN.id]: MEMBER.id }[
        user.role
      ] as string,
    });

    await promise;
    invalidateOrgUsersQuery(queryClient);
  };

  function getOwnerCount() {
    return rows.filter((user) => user.role === ADMIN.id).length;
  }

  const handleSelectionChange = (value: Key | null, row: IEnrichedUser) => {
    if (!value) return;

    if (value === DELETE.id) {
      setContextMember(row as IEnrichedUser);
      setDeleteOpen(true);
    } else if (value === DEACTIVATE.id) {
      setContextMember(row as IEnrichedUser);
      setDeactivateOpen(true);
    } else {
      if (value === row.role) return;
      else if (value === MEMBER.id) {
        // Check if this is the only owner trying to demote themselves
        if (row.role === ADMIN.id && getOwnerCount() === 1) {
          setOnlyAdminDialogOpen(true);
          return;
        }
      }

      handleChangeRole(row as IEnrichedUser);
    }
  };

  const handleActivateClick = async (row: IEnrichedUser) => {
    setContextMember(row as IEnrichedUser);
    setActivateOpen(true);
  };

  const handleActivate = async () => {
    setActivateOpen(false);
    if (!contextMember) return;
    const promise = activateUser(contextMember._id);
    toast.promise(promise, {
      loading: "Activating user.",
      success: "User activated.",
      error: "Activation failed.",
    });
    await promise;
    invalidateOrgUsersQuery(queryClient);
    setContextMember(null);
  };

  const handleDeactivate = async () => {
    setDeactivateOpen(false);
    if (!contextMember) return;
    const promise = deactivateUser(contextMember._id);
    toast.promise(promise, {
      loading: "Deactivating user.",
      success: "User deactivated.",
      error: "Deactivation failed.",
    });
    await promise;
    invalidateOrgUsersQuery(queryClient);
    setContextMember(null);
  };

  return (
    <>
      {shouldRenderDeleteModal && (
        <DeleteMemberModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onSubmit={handleDeleteUser}
        />
      )}

      {shouldRenderOnlyAdminDialogModal && (
        <OnlyAdminDialog
          open={onlyAdminDialogOpen}
          onClose={() => setOnlyAdminDialogOpen(false)}
        />
      )}

      {shouldRenderDeactivateModal && (
        <DeactivateMemberModal
          open={deactivateOpen}
          onClose={() => setDeactivateOpen(false)}
          onSubmit={handleDeactivate}
          user={contextMember as IEnrichedUser}
          organization={organization as IOrganization}
        />
      )}

      {shouldRenderActivateModal && (
        <ActivateMemberModal
          open={activateOpen}
          onClose={() => setActivateOpen(false)}
          onSubmit={handleActivate}
          user={contextMember as IEnrichedUser}
          organization={organization as IOrganization}
        />
      )}

      <ContentContainerCard>
        <ContentContainerCard.Header>
          MANAGE MEMBERS
        </ContentContainerCard.Header>
        <div className="max-w-[320px] w-full py-4 px-6">
          <Input
            size="sm"
            type="search"
            icon={SearchMd}
            placeholder="Search by name or email..."
            value={search}
            onChange={(value) => setSearch(value)}
            className="w-full"
          />
        </div>

        <TableCard.Root className="ring-0 overflow-hidden">
          <Tabs
            selectedKey={tab}
            onSelectionChange={setTab}
            className={"px-6 pt-3"}
            defaultSelectedKey={"all"}
          >
            <Tabs.List
              items={filteredTabs}
              type="underline"
              className={"p-0 ring-0"}
            >
              {(tab) => <Tabs.Item {...tab} className="uppercase text-xs " />}
            </Tabs.List>
          </Tabs>
          <Table aria-label="Members Table" aria-labelledby="members-table">
            <Table.Header className={"hidden"}>
              <Table.Row>
                <Table.Head isRowHeader></Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {rows.map((row: IEnrichedUser) => (
                <Table.Row key={row._id} className="w-full">
                  <Table.Cell className="w-full">
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar
                          initials={row.name.slice(0, 2)}
                          src={row.picture}
                        />
                        <div className="w-full">
                          <Typography
                            variant="md/medium"
                            className="text-primary"
                          >
                            {row.name}
                          </Typography>
                          <Typography
                            variant="sm/normal"
                            className="text-tertiary"
                          >
                            {row.email}
                          </Typography>
                        </div>
                      </div>

                      {row.status === DEACTIVATE.id ? (
                        <Button
                          color="secondary"
                          size="sm"
                          onClick={() => handleActivateClick(row)}
                        >
                          Activate
                        </Button>
                      ) : (
                        <Select
                          aria-label="Member actions"
                          aria-labelledby="Member actions"
                          selectedKey={row.role as Key}
                          size="sm"
                          items={ACTIONS_BY_STATUS[
                            row.status as keyof typeof ACTIONS_BY_STATUS
                          ].filter((action) =>
                            action.id === DEACTIVATE.id
                              ? row._id !== user?._id
                              : true,
                          )}
                          className={"min-w-[133px]"}
                          onSelectionChange={(value) =>
                            handleSelectionChange(value, row)
                          }
                          isDisabled={row._id === user?._id}
                        >
                          {(item) => (
                            <Select.Item
                              {...item}
                              isDanger={
                                item.id === DELETE.id ||
                                item.id === DEACTIVATE.id
                              }
                            />
                          )}
                        </Select>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </TableCard.Root>
      </ContentContainerCard>
    </>
  );
};

export { Invitations };
