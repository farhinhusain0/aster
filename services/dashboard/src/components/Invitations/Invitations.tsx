import React from "react";
import { DeleteMemberModal, ChangeRoleModal, OnlyAdminDialog } from "./modals";
import {
  useDeleteUser,
  useOrgUsers,
  useChangeRole,
  invalidateOrgUsersQuery,
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
    label: "Invited",
    id: "invited",
  },
];

const ACTIONS = [
  { label: "Admin", id: "owner" },
  { label: "Member", id: "member" },
  { label: "Delete", id: "delete" },
];

const Invitations = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState<string>("");

  const changeRoleDisclosure = useDisclosure({ animationDuration: 300 });
  const deleteDisclosure = useDisclosure({ animationDuration: 300 });
  const onlyAdminDialogDisclosure = useDisclosure({ animationDuration: 300 });
  const {
    isOpen: changeRoleOpen,
    setIsOpen: setChangeRoleOpen,
    shouldRender: shouldRenderChangeRoleModal,
  } = changeRoleDisclosure;
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

  const [contextMember, setContextMember] =
    React.useState<IEnrichedUser | null>(null);
  const [tab, setTab] = React.useState<Key>("all");
  const { data: user } = useMe();

  const organizationId = user?.organization._id;

  const usersQuery = useOrgUsers(organizationId);

  const rows = React.useMemo(() => {
    if (usersQuery.isPending || !usersQuery.data) {
      return [];
    }
    const { users } = usersQuery.data;
    let _users = [...users];

    if (tab === "admins") {
      _users = _users.filter((user) => user.role === "owner");
    } else if (tab === "invited") {
      _users = _users.filter((user) => user.status === "invited");
    }

    if (search) {
      return _users.filter(
        (user: { email: string; name: string }) =>
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          user.name.toLowerCase().includes(search.toLowerCase()),
      );
    }
    return _users;
  }, [search, usersQuery.isPending, usersQuery.data, tab]);

  const { mutateAsync: deleteUser } = useDeleteUser();
  const { mutateAsync: changeRole } = useChangeRole();

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
  const handleChangeRole = async () => {
    setChangeRoleOpen(false);

    if (
      !contextMember ||
      !contextMember.role ||
      !["owner", "member"].includes(contextMember.role)
    )
      return;

    const promise = changeRole({
      id: contextMember._id,
      role: { member: "owner", owner: "member" }[contextMember.role] as string,
    });

    await promise;
    invalidateOrgUsersQuery(queryClient);
    setContextMember(null);
  };

  const handleSelectionChange = (value: Key | null, row: IEnrichedUser) => {
    if (!value) return;

    if (value === "delete") {
      setContextMember(row as IEnrichedUser);
      setDeleteOpen(true);
    } else {
      if (value === row.role) return;
      else if (value === "member") {
        // Check if this is the only owner trying to demote themselves
        const ownerCount = rows.filter((user) => user.role === "owner").length;
        if (row.role === "owner" && ownerCount === 1) {
          setOnlyAdminDialogOpen(true);
          return;
        }
      }
      setContextMember(row as IEnrichedUser);
      setChangeRoleOpen(true);
    }
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

      {shouldRenderChangeRoleModal && (
        <ChangeRoleModal
          open={changeRoleOpen}
          onClose={() => setChangeRoleOpen(false)}
          onSubmit={handleChangeRole}
          currentRole={contextMember?.role || ""}
        />
      )}

      {shouldRenderOnlyAdminDialogModal && (
        <OnlyAdminDialog
          open={onlyAdminDialogOpen}
          onClose={() => setOnlyAdminDialogOpen(false)}
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
            <Tabs.List items={TABS} type="underline" className={"p-0 ring-0"}>
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

                      <Select
                        aria-label="Member actions"
                        aria-labelledby="Member actions"
                        selectedKey={row.role as Key}
                        size="sm"
                        items={ACTIONS.filter((action) => {
                          if (action.id === "delete") {
                            return row._id !== user?._id;
                          }
                          return true;
                        })}
                        className={"min-w-[133px]"}
                        onSelectionChange={(value) =>
                          handleSelectionChange(value, row)
                        }
                      >
                        {(item) => (
                          <Select.Item
                            {...item}
                            isDanger={item.id === "delete"}
                          />
                        )}
                      </Select>
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
