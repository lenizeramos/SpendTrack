import { useState } from "react";
import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Loader,
  Modal,
  Pagination,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  LuArrowDown,
  LuArrowUp,
  LuCircleAlert,
  LuCircleCheckBig,
  LuPencil,
  LuSearch,
  LuTrash2,
  LuX,
} from "react-icons/lu";
import {
  useGetTransactionsQuery,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} from "../services/api";
import { currencyFormatter, formatDate } from "../utils/formatTransaction";
import type {
  Transaction,
  TransactionQueryParameters,
} from "../types/transaction";

const PAGE_SIZE_OPTIONS = ["5", "10", "20", "50"];

export default function Dashboard() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "description" | "amount">(
    "date",
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const queryParams: TransactionQueryParameters = {
    page,
    pageSize,
    search: search || undefined,
    sortBy,
    sortDir,
  };

  const { data, isLoading, isFetching, isError } =
    useGetTransactionsQuery(queryParams);

  const [updateTransaction, { isLoading: isUpdating }] =
    useUpdateTransactionMutation();
  const [deleteTransaction, { isLoading: isDeleting }] =
    useDeleteTransactionMutation();

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState("");

  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const transactions = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalCount = data?.totalCount ?? 0;

  if (isLoading) return <Loader />;

  if (isError) {
    return <Alert color="red">Failed to load transactions.</Alert>;
  }

  const toggleSort = (field: "date" | "description" | "amount") => {
    if (sortBy === field) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleSearchSubmit = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handlePageSizeChange = (value: string | null) => {
    if (!value) return;
    setPageSize(Number(value));
    setPage(1);
  };

  const openEdit = (transaction: Transaction) => {
    setEditing(transaction);
    setEditDescription(transaction.description);
    setEditError("");
  };

  const closeEdit = () => {
    if (isUpdating) return;
    setEditing(null);
    setEditDescription("");
    setEditError("");
  };

  const handleEdit = async () => {
    if (!editing?.id) return;

    const trimmed = editDescription.trim();

    if (!trimmed) {
      setEditError("Description is required.");
      return;
    }

    if (trimmed === editing.description) {
      closeEdit();
      return;
    }

    try {
      await updateTransaction({
        id: editing.id,
        description: trimmed,
      }).unwrap();

      notifications.show({
        title: "Transaction updated",
        message: "The transaction was updated successfully.",
        color: "green",
        icon: <LuCircleCheckBig size={18} />,
      });

      setEditing(null);
      setEditDescription("");
      setEditError("");
    } catch (error) {
      console.error("Update failed", error);

      notifications.show({
        title: "Update failed",
        message: "Could not update the transaction.",
        color: "red",
        icon: <LuCircleAlert size={18} />,
      });
    }
  };

  const openDelete = (transaction: Transaction) => setDeleting(transaction);

  const closeDelete = () => {
    if (isDeleting) return;
    setDeleting(null);
  };

  const handleDelete = async () => {
    if (!deleting?.id) return;

    try {
      await deleteTransaction(deleting.id).unwrap();

      notifications.show({
        title: "Transaction deleted",
        message: "The transaction was deleted successfully.",
        color: "green",
        icon: <LuCircleCheckBig size={18} />,
      });

      setDeleting(null);

      if (transactions.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
    } catch (error) {
      console.error("Delete failed", error);

      notifications.show({
        title: "Delete failed",
        message: "Could not delete the transaction.",
        color: "red",
        icon: <LuCircleAlert size={18} />,
      });
    }
  };

  const SortHeader = ({
    field,
    label,
  }: {
    field: "date" | "description" | "amount";
    label: string;
  }) => (
    <Group
      gap={4}
      style={{ cursor: "pointer", userSelect: "none" }}
      onClick={() => toggleSort(field)}
    >
      <Text size="sm" fw={500}>
        {label}
      </Text>
      {sortBy === field &&
        (sortDir === "asc" ? (
          <LuArrowUp size={14} />
        ) : (
          <LuArrowDown size={14} />
        ))}
    </Group>
  );

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end">
        <Group>
          <TextInput
            placeholder="Search description…"
            value={searchInput}
            onChange={(event) => {
              const value = event.currentTarget.value;
              setSearchInput(value);

              if (value.trim() === "" && search !== "") {
                setSearch("");
                setPage(1);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSearchSubmit();
            }}
            leftSection={<LuSearch size={16} />}
            rightSection={
              searchInput ? (
                <ActionIcon
                  variant="subtle"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    setPage(1);
                  }}
                  aria-label="Clear search"
                >
                  <LuX size={16} />
                </ActionIcon>
              ) : null
            }
          />
          <Button
            variant="default"
            disabled={!searchInput.trim()}
            onClick={handleSearchSubmit}
          >
            Search
          </Button>
        </Group>
        <Select
          data={PAGE_SIZE_OPTIONS}
          value={String(pageSize)}
          onChange={handlePageSizeChange}
          w={120}
          allowDeselect={false}
        />
      </Group>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              <SortHeader field="date" label="Date" />
            </Table.Th>
            <Table.Th>
              <SortHeader field="description" label="Description" />
            </Table.Th>
            <Table.Th>Source bank</Table.Th>
            <Table.Th>
              <SortHeader field="amount" label="Amount" />
            </Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {transactions.map((transaction) => (
            <Table.Tr
              key={
                transaction.id ??
                `${transaction.date}-${transaction.description}`
              }
            >
              <Table.Td>{formatDate(transaction.date)}</Table.Td>

              <Table.Td>
                <Text fw={500}>{transaction.description}</Text>
                {transaction.notes && (
                  <Text size="xs" c="dimmed">
                    {transaction.notes}
                  </Text>
                )}
              </Table.Td>

              <Table.Td>
                <Text size="sm">{transaction.sourceBank || "—"}</Text>
              </Table.Td>

              <Table.Td>
                <Text fw={600} c={transaction.amount < 0 ? "red" : "teal"}>
                  {transaction.amount < 0 ? "−" : "+"}
                  {currencyFormatter.format(Math.abs(transaction.amount))}
                </Text>
              </Table.Td>

              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => openEdit(transaction)}
                    aria-label="Edit transaction"
                  >
                    <LuPencil size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => openDelete(transaction)}
                    aria-label="Delete transaction"
                  >
                    <LuTrash2 size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}

          {transactions.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={5}>
                <Text ta="center" c="dimmed" py="md">
                  No transactions found.
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      <Group justify="space-between" align="center">
        <Text size="sm" c="dimmed">
          {totalCount} transaction{totalCount === 1 ? "" : "s"} total
          {isFetching ? " · loading…" : ""}
        </Text>

        <Pagination
          total={totalPages}
          value={page}
          onChange={setPage}
          withEdges
        />
      </Group>

      <Modal
        opened={editing !== null}
        onClose={closeEdit}
        title="Edit transaction"
        centered
        closeOnClickOutside={!isUpdating}
        closeOnEscape={!isUpdating}
      >
        <Stack gap="md">
          <TextInput
            label="Description"
            value={editDescription}
            onChange={(event) => setEditDescription(event.currentTarget.value)}
            disabled={isUpdating}
            error={editError}
            data-autofocus
          />

          {editing && (
            <Text size="sm" c="dimmed">
              Date: {formatDate(editing.date)} · Amount:{" "}
              {currencyFormatter.format(Math.abs(editing.amount))}
            </Text>
          )}

          <Group justify="flex-end">
            <Button variant="default" onClick={closeEdit} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleEdit} loading={isUpdating}>
              Save changes
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={deleting !== null}
        onClose={closeDelete}
        title="Delete transaction"
        centered
        closeOnClickOutside={!isDeleting}
        closeOnEscape={!isDeleting}
      >
        <Stack gap="md">
          <Alert
            color="red"
            variant="light"
            icon={<LuCircleAlert size={18} />}
            title="This action cannot be undone"
          >
            <Stack gap={4}>
              <Text size="sm">
                You are about to delete the following transaction:
              </Text>
              {deleting && (
                <>
                  <Text size="sm" fw={500}>
                    {deleting.description}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Date: {formatDate(deleting.date)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Amount:{" "}
                    {currencyFormatter.format(Math.abs(deleting.amount))}
                  </Text>
                </>
              )}
            </Stack>
          </Alert>

          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={closeDelete}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete} loading={isDeleting}>
              Delete transaction
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
